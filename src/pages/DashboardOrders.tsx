import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, Clock, XCircle, Phone, MapPin } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Order } from '../types';
import { Menu360AdireBand, Menu360FoodIcon } from '../components/Menu360Brand';

export const DashboardOrders: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const [orders, setOrders] = useState<Order[]>(StorageService.getOrders(currentRestaurant.id));
  const [error, setError] = useState('');

  const handleUpdateStatus = async (orderId: string, status: 'pending' | 'completed' | 'cancelled') => {
    setError('');
    try {
      await StorageService.updateOrderStatus(orderId, status);
      setOrders(StorageService.getOrders(currentRestaurant.id));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update order status.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Order history</h2>
        <p className="text-sm text-stone-400">Review orders already on record for your restaurant.</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}

      {orders.length === 0 ? (
        <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 text-center text-stone-400">
          <Menu360AdireBand />
          <div className="px-6 py-14">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#F2A31B]"><Menu360FoodIcon kind="menu" size={40} /></div>
            <p className="text-base font-semibold">No saved orders yet</p>
            <p className="mt-1 text-sm text-stone-500">WhatsApp requests go straight to your chat. Those conversations are not stored here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{order.customerName}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                      order.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : order.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 flex items-center gap-4">
                    <span>Order ID: {order.id}</span>
                    <span>·</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      order.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" /> Complete
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      order.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>

              {/* Order details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Order Items</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-stone-800/50 p-3 rounded-xl border border-stone-800">
                        <span className="text-white font-medium">{item.quantity}x {item.name}</span>
                        <span className="text-orange-400 font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 bg-stone-800/30 p-6 rounded-2xl border border-stone-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Delivery & Customer Info</h4>
                  <div className="space-y-2 text-stone-300 text-xs">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-stone-400">Preference:</span>
                      <span className="capitalize text-white font-bold">{order.deliveryPreference}</span>
                    </p>
                    {order.customerPhone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-orange-500" />
                        <span>{order.customerPhone}</span>
                      </p>
                    )}
                    {order.deliveryAddress && (
                      <p className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <span>{order.deliveryAddress}</span>
                      </p>
                    )}
                    {order.specialInstructions && (
                      <p className="pt-2 text-stone-400 italic">
                        " {order.specialInstructions} "
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                    <span className="font-bold text-stone-400">Total Amount:</span>
                    <span className="text-lg font-black text-white">₦{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
