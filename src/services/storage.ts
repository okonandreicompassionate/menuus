import { AdminRestaurant, Restaurant, Category, MenuItem, Order, User } from '../types';
import { readApiResponse } from './http';
import { DEMO_CATEGORIES, DEMO_MENU_ITEMS, DEMO_RESTAURANT } from '../data/mockData';

const STORAGE_KEYS = {
  RESTAURANTS: 'menudrop_restaurants',
  CATEGORIES: 'menudrop_categories',
  MENU_ITEMS: 'menudrop_menu_items',
  ORDERS: 'menudrop_orders',
  CURRENT_USER: 'menudrop_current_user',
};

function readCache<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) as T[] : [];
}

async function apiRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  try {
    const response = await fetch(path, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return await readApiResponse<T>(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the app API. Start it with `npm run dev:api` and check its server configuration.');
    }
    throw error;
  }
}

export const StorageService = {
  init() {},

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) as User : null;
  },

  setCurrentUser(user: User | null) {
    if (user) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  hydrateDashboard(data: {
    restaurant: Restaurant;
    categories: Category[];
    menuItems: MenuItem[];
    orders: Order[];
  }) {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify([data.restaurant]));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(data.menuItems));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders));
  },

  getRestaurants(): Restaurant[] {
    return readCache<Restaurant>(STORAGE_KEYS.RESTAURANTS);
  },

  getRestaurantById(id: string): Restaurant | undefined {
    return this.getRestaurants().find(restaurant => restaurant.id === id);
  },

  getCategories(restaurantId: string): Category[] {
    return readCache<Category>(STORAGE_KEYS.CATEGORIES)
      .filter(category => category.restaurantId === restaurantId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async saveRestaurant(restaurant: Restaurant): Promise<Restaurant> {
    const result = await apiRequest<Restaurant>('/api/restaurant', 'PUT', restaurant);
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify([result]));
    return result;
  },

  async saveCategory(category: Category): Promise<Category> {
    const result = await apiRequest<Category>(
      category.id ? `/api/categories/${encodeURIComponent(category.id)}` : '/api/categories',
      category.id ? 'PUT' : 'POST',
      category,
    );
    const categories = readCache<Category>(STORAGE_KEYS.CATEGORIES).filter(item => item.id !== result.id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([...categories, result]));
    return result;
  },

  async deleteCategory(categoryId: string): Promise<void> {
    await apiRequest<void>(`/api/categories/${encodeURIComponent(categoryId)}`, 'DELETE');
    localStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(readCache<Category>(STORAGE_KEYS.CATEGORIES).filter(category => category.id !== categoryId)),
    );
  },

  getMenuItems(restaurantId: string): MenuItem[] {
    return readCache<MenuItem>(STORAGE_KEYS.MENU_ITEMS).filter(item => item.restaurantId === restaurantId);
  },

  async saveMenuItem(item: MenuItem): Promise<MenuItem> {
    const result = await apiRequest<MenuItem>(
      item.id ? `/api/menu-items/${encodeURIComponent(item.id)}` : '/api/menu-items',
      item.id ? 'PUT' : 'POST',
      item,
    );
    const items = readCache<MenuItem>(STORAGE_KEYS.MENU_ITEMS).filter(existing => existing.id !== result.id);
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify([...items, result]));
    return result;
  },

  async deleteMenuItem(itemId: string): Promise<void> {
    await apiRequest<void>(`/api/menu-items/${encodeURIComponent(itemId)}`, 'DELETE');
    localStorage.setItem(
      STORAGE_KEYS.MENU_ITEMS,
      JSON.stringify(readCache<MenuItem>(STORAGE_KEYS.MENU_ITEMS).filter(item => item.id !== itemId)),
    );
  },

  getOrders(restaurantId: string): Order[] {
    return readCache<Order>(STORAGE_KEYS.ORDERS)
      .filter(order => order.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async saveOrder(order: Order): Promise<Order> {
    const result = await apiRequest<Order>('/api/orders', 'POST', order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([result, ...readCache<Order>(STORAGE_KEYS.ORDERS)]));
    return result;
  },

  async updateOrderStatus(orderId: string, status: 'pending' | 'completed' | 'cancelled'): Promise<void> {
    const result = await apiRequest<Order>(`/api/orders/${encodeURIComponent(orderId)}`, 'PATCH', { status });
    const orders = readCache<Order>(STORAGE_KEYS.ORDERS).map(order => order.id === result.id ? result : order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  async getStorefront(slug: string): Promise<{
    restaurant: Restaurant;
    categories: Category[];
    menuItems: MenuItem[];
  }> {
    if (slug === DEMO_RESTAURANT.slug) {
      return {
        restaurant: DEMO_RESTAURANT,
        categories: DEMO_CATEGORIES,
        menuItems: DEMO_MENU_ITEMS,
      };
    }
    return apiRequest(`/api/storefront/${encodeURIComponent(slug)}`);
  },

  async getDashboard(): Promise<{
    restaurant: Restaurant;
    categories: Category[];
    menuItems: MenuItem[];
    orders: Order[];
  }> {
    return apiRequest('/api/dashboard');
  },

  async uploadImage(file: File, purpose: 'menu' | 'logo' | 'cover'): Promise<string> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Choose a JPG, PNG, or WebP image.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image files must be 5 MB or smaller.');
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Could not read the selected image.'));
      reader.onerror = () => reject(new Error('Could not read the selected image.'));
      reader.readAsDataURL(file);
    });
    const result = await apiRequest<{ url: string }>('/api/images', 'POST', { dataUrl, purpose });
    return result.url;
  },

  async getAdminRestaurants(): Promise<{
    restaurants: AdminRestaurant[];
    totalUsers: number;
    totalRestaurants: number;
    activeRestaurants: number;
  }> {
    return apiRequest('/api/admin/restaurants');
  },

  async setRestaurantStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
    await apiRequest<void>(`/api/admin/restaurants/${encodeURIComponent(id)}/status`, 'PATCH', { status });
  },
};
