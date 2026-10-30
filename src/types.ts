export interface User {
  id: string;
  email: string;
  name: string;
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  userId: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  whatsappNumber: string;
  address: string;
  openingHours: string;
  currency: string;
  slug: string;
  isOpen: boolean;
  theme: 'warm' | 'dark' | 'clean';
  plan: 'Starter' | 'Pro' | 'Premium';
  createdAt: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone?: string;
  deliveryPreference: 'delivery' | 'pickup';
  deliveryAddress?: string;
  specialInstructions?: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}
