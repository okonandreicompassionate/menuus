import { Restaurant, Category, MenuItem, Order } from '../types';
import amalaImage from '../assets/images/amala_soup_1793350581023.jpg';
import chapmanImage from '../assets/images/chapman_drink_1793350583131.jpg';
import jollofImage from '../assets/images/jollof_turkey_1793350581200.jpg';
import ofadaImage from '../assets/images/ofada_stew_1793350581015.jpg';

export const DEMO_RESTAURANT: Restaurant = {
  id: 'rest-pepper-house',
  userId: 'user-demo',
  name: 'The Pepper House',
  description: 'Authentic Nigerian home-style cooking, smoky party jollof, delicious soups and ice-cold drinks served fresh daily in Lagos.',
  logo: '',
  coverImage: jollofImage,
  whatsappNumber: '+2348012345678',
  address: '14 Admiralty Way, Lekki Phase 1, Lagos',
  openingHours: 'Mon - Sat: 9:00 AM - 10:00 PM',
  currency: '₦',
  slug: 'the-pepper-house',
  isOpen: true,
  theme: 'warm',
  plan: 'Pro',
  status: 'active',
  createdAt: new Date().toISOString(),
};

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-rice', restaurantId: 'rest-pepper-house', name: 'Rice Dishes', sortOrder: 1 },
  { id: 'cat-swallow', restaurantId: 'rest-pepper-house', name: 'Swallow & Soup', sortOrder: 2 },
  { id: 'cat-mains', restaurantId: 'rest-pepper-house', name: 'Grills & Specials', sortOrder: 3 },
  { id: 'cat-drinks', restaurantId: 'rest-pepper-house', name: 'Drinks & Cocktails', sortOrder: 4 },
];

export const DEMO_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    restaurantId: 'rest-pepper-house',
    categoryId: 'cat-rice',
    name: 'Party Jollof Rice & Grilled Turkey',
    description: 'Smoky firewood flavor party jollof rice served with golden crispy grilled turkey, fried plantain, and fresh pepper sauce.',
    price: 4500,
    image: jollofImage,
    isAvailable: true,
  },
  {
    id: 'item-2',
    restaurantId: 'rest-pepper-house',
    categoryId: 'cat-rice',
    name: 'Ofada Rice & Designer Stew',
    description: 'Local unpolished Ofada rice served in a traditional leaf bowl with rich green pepper designer stew, assorted meat, and boiled egg.',
    price: 5200,
    image: ofadaImage,
    isAvailable: true,
  },
  {
    id: 'item-3',
    restaurantId: 'rest-pepper-house',
    categoryId: 'cat-swallow',
    name: 'Amala with Gbegiri, Ewedu & Assorted',
    description: 'Smooth dark yam flour Amala served with steaming yellow Gbegiri bean soup, green Ewedu soup, and tender assorted beef chunks.',
    price: 4800,
    image: amalaImage,
    isAvailable: true,
  },
  {
    id: 'item-4',
    restaurantId: 'rest-pepper-house',
    categoryId: 'cat-mains',
    name: 'Crispy Fried Rice & Chicken',
    description: 'Richly spiced Nigerian fried rice loaded with mixed vegetables, liver, and succulent fried chicken thigh.',
    price: 4200,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    id: 'item-5',
    restaurantId: 'rest-pepper-house',
    categoryId: 'cat-drinks',
    name: 'Nigerian Chapman Cocktail',
    description: 'Refreshing signature cocktail mixed with Fanta, Sprite, Angostura bitters, grenadine, cucumber, and fresh citrus.',
    price: 2000,
    image: chapmanImage,
    isAvailable: true,
  },
  {
    id: 'item-6',
    restaurantId: 'rest-pepper-house',
    categoryId: 'cat-drinks',
    name: 'Zobo Drink (Hibiscus Infusion)',
    description: 'Chilled natural hibiscus flower brew infused with pineapple, ginger, and cloves. Sweet and invigorating.',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
];

export const DEMO_ORDERS: Order[] = [
  {
    id: 'ord-101',
    restaurantId: 'rest-pepper-house',
    customerName: 'Chidi Okafor',
    customerPhone: '+2348098765432',
    deliveryPreference: 'delivery',
    deliveryAddress: 'Plot 12, Block 4, Lekki Phase 1, Lagos',
    specialInstructions: 'Extra pepper sauce please, ring doorbell.',
    items: [
      { menuItemId: 'item-1', name: 'Party Jollof Rice & Grilled Turkey', price: 4500, quantity: 2 },
      { menuItemId: 'item-5', name: 'Nigerian Chapman Cocktail', price: 2000, quantity: 1 }
    ],
    totalAmount: 11000,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'pending'
  },
  {
    id: 'ord-102',
    restaurantId: 'rest-pepper-house',
    customerName: 'Amina Bello',
    customerPhone: '+2348033322211',
    deliveryPreference: 'pickup',
    specialInstructions: 'Picking up in 20 minutes.',
    items: [
      { menuItemId: 'item-2', name: 'Ofada Rice & Designer Stew', price: 5200, quantity: 1 },
      { menuItemId: 'item-6', name: 'Zobo Drink (Hibiscus Infusion)', price: 1200, quantity: 2 }
    ],
    totalAmount: 7600,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'completed'
  }
];
