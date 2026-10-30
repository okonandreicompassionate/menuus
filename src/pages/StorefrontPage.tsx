import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Search,
  ShoppingBag,
  MapPin,
  Clock,
  Plus,
  Minus,
  X,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StorageService } from '../services/storage';
import { Restaurant, Category, MenuItem, CartItem, Order } from '../types';

export const StorefrontPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const restaurant = StorageService.getRestaurantBySlug(slug || 'the-pepper-house') || StorageService.getRestaurants()[0];

  const categories: Category[] = StorageService.getCategories(restaurant.id);
  const menuItems: MenuItem[] = StorageService.getMenuItems(restaurant.id);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Checkout form state
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryPreference, setDeliveryPreference] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  const filteredItems = menuItems.filter(item => {
    const matchesCat = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCart(prev => {
      const existing = prev.find(ci => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map(ci => ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(ci => {
        if (ci.menuItem.id === itemId) {
          const newQty = ci.quantity + delta;
          return newQty > 0 ? { ...ci, quantity: newQty } : null;
        }
        return ci;
      }).filter(Boolean) as CartItem[];
    });
  };

  const totalCartAmount = cart.reduce((sum, ci) => sum + (ci.menuItem.price * ci.quantity), 0);
  const totalCartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter your name for the order.');
      return;
    }

    const orderItems = cart.map(ci => ({
      menuItemId: ci.menuItem.id,
      name: ci.menuItem.name,
      price: ci.menuItem.price,
      quantity: ci.quantity,
    }));

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      restaurantId: restaurant.id,
      customerName,
      customerPhone,
      deliveryPreference,
      deliveryAddress,
      specialInstructions,
      items: orderItems,
      totalAmount: totalCartAmount,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    StorageService.saveOrder(newOrder);

    // Format WhatsApp message
    let message = `🍽️ *NEW ORDER FROM MENUDROP*\n`;
    message += `--------------------------------\n`;
    message += `*Restaurant:* ${restaurant.name}\n`;
    message += `*Customer Name:* ${customerName}\n`;
    if (customerPhone) message += `*Phone:* ${customerPhone}\n`;
    message += `*Fulfillment:* ${deliveryPreference.toUpperCase()}\n`;
    if (deliveryPreference === 'delivery' && deliveryAddress) {
      message += `*Delivery Address:* ${deliveryAddress}\n`;
    }
    if (specialInstructions) {
      message += `*Notes:* ${specialInstructions}\n`;
    }
    message += `--------------------------------\n`;
    message += `*ORDER ITEMS:*\n`;
    cart.forEach(ci => {
      message += `• ${ci.quantity}x ${ci.menuItem.name} - ₦${(ci.menuItem.price * ci.quantity).toLocaleString()}\n`;
    });
    message += `--------------------------------\n`;
    message += `*TOTAL AMOUNT: ₦${totalCartAmount.toLocaleString()}*\n`;
    message += `--------------------------------\n`;
    message += `Please confirm my order. Thank you! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = restaurant.whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setOrderPlaced(true);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 font-sans pb-24">
      {/* Top Bar / Header */}
      <div className="bg-stone-900 text-white py-3 px-6 text-xs text-center font-medium flex items-center justify-center gap-2">
        <span>Powered by <Link to="/" className="underline text-orange-400 font-bold">MenuDrop</Link></span>
        <span>·</span>
        <span>Order directly on WhatsApp with zero commission</span>
      </div>

      {/* Hero / Cover */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-stone-900">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-75"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-2xl shrink-0 bg-white"
              referrerPolicy="no-referrer"
            />
            <div className="text-white space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{restaurant.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  restaurant.isOpen ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {restaurant.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl line-clamp-2">{restaurant.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-stone-600">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-600" /> {restaurant.address}</span>
            <span className="hidden md:flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-600" /> {restaurant.openingHours}</span>
          </div>
          <a
            href={`https://wa.me/${restaurant.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Main Content & Menu */}
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Search & Category Filter */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search dishes or drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                activeCategory === 'all'
                  ? 'bg-orange-600 text-white shadow-orange-600/25'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              All Menu Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  activeCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-orange-600/25'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 text-stone-500 shadow-sm">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-semibold">No food items found</p>
            <p className="text-xs text-stone-400 mt-1">Try searching for something else.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const cartItem = cart.find(ci => ci.menuItem.id === item.id);
              return (
                <div key={item.id} className="bg-white rounded-3xl border border-stone-200 overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all">
                  <div>
                    <div className="relative h-48 overflow-hidden bg-stone-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-3 py-1 bg-stone-900 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-base font-bold text-stone-900">{item.name}</h3>
                        <span className="text-base font-extrabold text-orange-600 shrink-0">
                          ₦{item.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    {item.isAvailable ? (
                      cartItem ? (
                        <div className="flex items-center justify-between bg-orange-50 border border-orange-200 p-2 rounded-2xl">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="p-2 bg-white rounded-xl text-orange-600 hover:bg-orange-100 shadow-sm transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-stone-900 text-sm">{cartItem.quantity} in cart</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="p-2 bg-orange-600 rounded-xl text-white hover:bg-orange-700 shadow-sm transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full py-3 bg-stone-900 hover:bg-orange-600 text-white font-semibold rounded-2xl transition-all shadow-md text-xs flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add to Cart
                        </button>
                      )
                    ) : (
                      <button disabled className="w-full py-3 bg-stone-100 text-stone-400 font-semibold rounded-2xl cursor-not-allowed text-xs">
                        Currently Unavailable
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 left-6 right-6 max-w-xl mx-auto z-40">
          <div className="bg-stone-900 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between border border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-600/30">
                {totalCartCount}
              </div>
              <div>
                <p className="text-xs text-stone-400">Total Amount</p>
                <p className="text-base font-extrabold text-white">₦{totalCartAmount.toLocaleString()}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setOrderPlaced(false);
                setIsCartOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-orange-600/30 text-sm"
            >
              <span>Review Order</span>
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cart & WhatsApp Checkout Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-stone-900">Your Order Summary</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderPlaced ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-stone-900">WhatsApp Chat Opened!</h4>
                <p className="text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
                  Your order has been formatted and sent to <span className="font-semibold text-stone-900">{restaurant.name}</span> on WhatsApp. Complete your chat to finalize payment and delivery.
                </p>
                <button
                  onClick={() => {
                    setCart([]);
                    setIsCartOpen(false);
                    setOrderPlaced(false);
                  }}
                  className="px-6 py-3 bg-stone-900 text-white font-semibold rounded-2xl hover:bg-stone-800 transition-colors text-sm"
                >
                  Close & Continue Browsing
                </button>
              </div>
            ) : (
              <form onSubmit={handleWhatsAppCheckout} className="space-y-6">
                {/* Itemized Cart */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {cart.map(ci => (
                    <div key={ci.menuItem.id} className="flex items-center justify-between gap-4 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{ci.menuItem.name}</h4>
                        <p className="text-xs text-stone-500">₦{ci.menuItem.price.toLocaleString()} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-stone-300 px-2 py-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(ci.menuItem.id, -1)}
                            className="text-stone-600 hover:text-stone-900"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-stone-900">{ci.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(ci.menuItem.id, 1)}
                            className="text-stone-600 hover:text-stone-900"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="font-extrabold text-stone-900 text-sm">
                          ₦{(ci.menuItem.price * ci.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="p-4 bg-stone-900 text-white rounded-2xl flex items-center justify-between">
                  <span className="font-semibold text-sm">Total Amount</span>
                  <span className="text-xl font-black text-orange-400">₦{totalCartAmount.toLocaleString()}</span>
                </div>

                {/* Customer Details Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Chidi Okafor"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+2348012345678"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Fulfillment Preference</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryPreference('delivery')}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          deliveryPreference === 'delivery'
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-300'
                        }`}
                      >
                        Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryPreference('pickup')}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          deliveryPreference === 'pickup'
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-300'
                        }`}
                      >
                        Pickup
                      </button>
                    </div>
                  </div>

                  {deliveryPreference === 'delivery' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Delivery Address *</label>
                      <textarea
                        rows={2}
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Plot 12, Admiralty Way, Lekki Phase 1"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Special Instructions (Optional)</label>
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. Extra pepper, less salt..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <MessageSquare className="w-5 h-5" /> Order on WhatsApp (₦{totalCartAmount.toLocaleString()})
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
