import { Restaurant, Category, MenuItem, Order, User } from '../types';
import { DEMO_RESTAURANT, DEMO_CATEGORIES, DEMO_MENU_ITEMS, DEMO_ORDERS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  RESTAURANTS: 'menudrop_restaurants',
  CATEGORIES: 'menudrop_categories',
  MENU_ITEMS: 'menudrop_menu_items',
  ORDERS: 'menudrop_orders',
  CURRENT_USER: 'menudrop_current_user',
};

export const StorageService = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.RESTAURANTS)) {
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify([DEMO_RESTAURANT]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEMO_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(DEMO_MENU_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      const defaultUser: User = {
        id: 'user-demo',
        email: 'owner@thepepperhouse.com',
        name: 'Chef Tunde',
        restaurantId: 'rest-pepper-house'
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    }
  },

  isSupabaseActive(): boolean {
    return isSupabaseConfigured;
  },

  getCurrentUser(): User | null {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getRestaurants(): Restaurant[] {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    return data ? JSON.parse(data) : [DEMO_RESTAURANT];
  },

  getRestaurantById(id: string): Restaurant | undefined {
    return this.getRestaurants().find(r => r.id === id);
  },

  getRestaurantBySlug(slug: string): Restaurant | undefined {
    return this.getRestaurants().find(r => r.slug.toLowerCase() === slug.toLowerCase());
  },

  saveRestaurant(restaurant: Restaurant) {
    const restaurants = this.getRestaurants();
    const index = restaurants.findIndex(r => r.id === restaurant.id);
    if (index >= 0) {
      restaurants[index] = restaurant;
    } else {
      restaurants.push(restaurant);
    }
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));

    if (isSupabaseConfigured && supabase) {
      supabase.from('restaurants').upsert({
        id: restaurant.id,
        user_id: restaurant.userId,
        name: restaurant.name,
        description: restaurant.description,
        logo: restaurant.logo,
        cover_image: restaurant.coverImage,
        whatsapp_number: restaurant.whatsappNumber,
        address: restaurant.address,
        opening_hours: restaurant.openingHours,
        currency: restaurant.currency,
        slug: restaurant.slug,
        is_open: restaurant.isOpen,
        theme: restaurant.theme,
        plan: restaurant.plan
      }).then(({ error }) => {
        if (error) console.error('Supabase saveRestaurant error:', error);
      });
    }
  },

  getCategories(restaurantId: string): Category[] {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const categories: Category[] = data ? JSON.parse(data) : DEMO_CATEGORIES;
    return categories.filter(c => c.restaurantId === restaurantId).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  saveCategory(category: Category) {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const categories: Category[] = data ? JSON.parse(data) : DEMO_CATEGORIES;
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));

    if (isSupabaseConfigured && supabase) {
      supabase.from('categories').upsert({
        id: category.id,
        restaurant_id: category.restaurantId,
        name: category.name,
        sort_order: category.sortOrder
      }).then(({ error }) => {
        if (error) console.error('Supabase saveCategory error:', error);
      });
    }
  },

  deleteCategory(categoryId: string) {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    let categories: Category[] = data ? JSON.parse(data) : DEMO_CATEGORIES;
    categories = categories.filter(c => c.id !== categoryId);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));

    if (isSupabaseConfigured && supabase) {
      supabase.from('categories').delete().eq('id', categoryId).then(({ error }) => {
        if (error) console.error('Supabase deleteCategory error:', error);
      });
    }
  },

  getMenuItems(restaurantId: string): MenuItem[] {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    const items: MenuItem[] = data ? JSON.parse(data) : DEMO_MENU_ITEMS;
    return items.filter(i => i.restaurantId === restaurantId);
  },

  saveMenuItem(item: MenuItem) {
    const data = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    const items: MenuItem[] = data ? JSON.parse(data) : DEMO_MENU_ITEMS;
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));

    if (isSupabaseConfigured && supabase) {
      supabase.from('menu_items').upsert({
        id: item.id,
        restaurant_id: item.restaurantId,
        category_id: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        is_available: item.isAvailable
      }).then(({ error }) => {
        if (error) console.error('Supabase saveMenuItem error:', error);
      });
    }
  },

  deleteMenuItem(itemId: string) {
    const data = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    let items: MenuItem[] = data ? JSON.parse(data) : DEMO_MENU_ITEMS;
    items = items.filter(i => i.id !== itemId);
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));

    if (isSupabaseConfigured && supabase) {
      supabase.from('menu_items').delete().eq('id', itemId).then(({ error }) => {
        if (error) console.error('Supabase deleteMenuItem error:', error);
      });
    }
  },

  getOrders(restaurantId: string): Order[] {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const orders: Order[] = data ? JSON.parse(data) : DEMO_ORDERS;
    return orders.filter(o => o.restaurantId === restaurantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  saveOrder(order: Order) {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const orders: Order[] = data ? JSON.parse(data) : DEMO_ORDERS;
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (isSupabaseConfigured && supabase) {
      supabase.from('orders').insert({
        id: order.id,
        restaurant_id: order.restaurantId,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        delivery_preference: order.deliveryPreference,
        delivery_address: order.deliveryAddress,
        special_instructions: order.specialInstructions,
        items: order.items,
        total_amount: order.totalAmount,
        status: order.status
      }).then(({ error }) => {
        if (error) console.error('Supabase saveOrder error:', error);
      });
    }
  },

  updateOrderStatus(orderId: string, status: 'pending' | 'completed' | 'cancelled') {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const orders: Order[] = data ? JSON.parse(data) : DEMO_ORDERS;
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      if (isSupabaseConfigured && supabase) {
        supabase.from('orders').update({ status }).eq('id', orderId).then(({ error }) => {
          if (error) console.error('Supabase updateOrderStatus error:', error);
        });
      }
    }
  },

  createRestaurantWithUser(user: User, restaurant: Restaurant) {
    const users = JSON.parse(localStorage.getItem('menudrop_users') || '[]');
    users.push(user);
    localStorage.setItem('menudrop_users', JSON.stringify(users));
    this.setCurrentUser(user);
    this.saveRestaurant(restaurant);
  }
};
