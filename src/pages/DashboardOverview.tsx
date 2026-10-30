import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBag, Menu as MenuIcon, TrendingUp, ArrowUpRight, QrCode, Clock, CheckCircle } from 'lucide-react';
import { StorageService } from '../services/storage';

export const DashboardOverview: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const menuItems = StorageService.getMenuItems(currentRestaurant.id);
  const categories = StorageService.getCategories(currentRestaurant.id);
  const orders = StorageService.getOrders(currentRestaurant.id);

  const activeItemsCount = menuItems.filter(i => i.isAvailable).length;
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-600/20 via-stone-900 to-stone-900 p-8 rounded-3xl border border-stone-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold">
            <span>Plan: {currentRestaurant.plan}</span>
            <span>·</span>
            <span className="text-emerald-400">Store Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {currentUser?.name || 'Chef'}!</h2>
          <p className="text-sm text-stone-400">Here is what is happening at {currentRestaurant.name} today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/store/${currentRestaurant.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-5 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/30 text-sm"
          >
            <span>Preview Storefront</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Menu Items</span>
            <MenuIcon className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">{menuItems.length}</p>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> {activeItemsCount} items currently available
          </p>
        </div>

        <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Categories</span>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">{categories.length}</p>
          <p className="text-xs text-stone-400">Organized menu sections</p>
        </div>

        <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">WhatsApp Orders</span>
            <ShoppingBag className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">{orders.length}</p>
          <p className="text-xs text-stone-400">Total orders received</p>
        </div>

        <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Est. Order Volume</span>
            <span className="text-emerald-400 font-bold">₦</span>
          </div>
          <p className="text-3xl font-extrabold text-white">₦{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-stone-400">From completed & pending orders</p>
        </div>
      </div>

      {/* Recent Orders & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-stone-900 p-8 rounded-3xl border border-stone-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent WhatsApp Orders</h3>
            <Link to="/dashboard/orders" className="text-xs font-semibold text-orange-500 hover:text-orange-400">
              View all
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No orders received yet. Share your storefront link!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 4).map((order) => (
                <div key={order.id} className="p-4 rounded-2xl bg-stone-800/50 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{order.customerName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-white">₦{order.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-stone-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-stone-900 p-8 rounded-3xl border border-stone-800 space-y-6">
          <h3 className="text-lg font-bold text-white">Quick Management</h3>
          <div className="space-y-3">
            <Link
              to="/dashboard/menu"
              className="flex items-center justify-between p-4 rounded-2xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 transition-all text-sm font-medium text-white"
            >
              <span>Add New Food Item</span>
              <MenuIcon className="w-4 h-4 text-orange-500" />
            </Link>
            <Link
              to="/dashboard/storefront"
              className="flex items-center justify-between p-4 rounded-2xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 transition-all text-sm font-medium text-white"
            >
              <span>Download QR Code</span>
              <QrCode className="w-4 h-4 text-orange-500" />
            </Link>
            <Link
              to="/dashboard/settings"
              className="flex items-center justify-between p-4 rounded-2xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 transition-all text-sm font-medium text-white"
            >
              <span>Update WhatsApp Number</span>
              <Clock className="w-4 h-4 text-orange-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
