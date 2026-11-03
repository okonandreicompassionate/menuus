import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, Phone, MapPin, RefreshCw, Search, LoaderCircle, MessageCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Order, StaffOrderView } from '../types';
import { Menu360AdireBand, Menu360FoodIcon } from '../components/Menu360Brand';

export const DashboardOrders: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const [orders, setOrders] = useState<Order[]>(StorageService.getOrders(currentRestaurant.id));
  const [error, setError] = useState('');
  const [lastChecked, setLastChecked] = useState(new Date());
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const [staffCode, setStaffCode] = useState('');
  const [staffOrder, setStaffOrder] = useState<StaffOrderView | null>(null);
  const [staffCodeError, setStaffCodeError] = useState('');
  const [isLookingUpCode, setIsLookingUpCode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const knownOrderIds = useRef(new Set(orders.map(order => order.id)));
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const visibleOrders = sortedOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const query = orderSearch.trim().toLowerCase();
    const matchesSearch = !query || order.customerName.toLowerCase().includes(query)
      || order.id.toLowerCase().includes(query)
      || (order.customerPhone || '').toLowerCase().includes(query)
      || (order.deliveryAddress || '').toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    let active = true;
    const refreshOrders = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const dashboard = await StorageService.getDashboard();
        if (!active) return;
        const incomingOrders = dashboard.orders.filter(order => !knownOrderIds.current.has(order.id));
        incomingOrders.forEach(order => knownOrderIds.current.add(order.id));
        if (incomingOrders.length > 0) {
          setNewOrderIds(current => [...new Set([...current, ...incomingOrders.map(order => order.id)])]);
        }
        StorageService.hydrateDashboard(dashboard);
        setOrders(dashboard.orders);
        setLastChecked(new Date());
        setError('');
      } catch (refreshError) {
        if (active) setError(refreshError instanceof Error ? refreshError.message : 'Could not refresh incoming orders.');
      }
    };
    void refreshOrders();
    const timer = window.setInterval(() => void refreshOrders(), 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, status: 'pending' | 'completed' | 'cancelled') => {
    setError('');
    setUpdatingOrderId(orderId);
    try {
      await StorageService.updateOrderStatus(orderId, status);
      setOrders(StorageService.getOrders(currentRestaurant.id));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update order status.');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const handleStaffCodeLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = staffCode.trim().toUpperCase();
    if (!/^[A-HJ-NP-Z2-9]{8}$/.test(normalizedCode)) {
      setStaffCodeError('Enter the 8-character code from the guest’s order ticket.');
      setStaffOrder(null);
      return;
    }
    setIsLookingUpCode(true);
    setStaffCodeError('');
    setStaffOrder(null);
    try {
      setStaffOrder(await StorageService.getStaffOrderByCode(normalizedCode));
    } catch (lookupError) {
      setStaffCodeError(lookupError instanceof Error ? lookupError.message : 'Could not find that order.');
    } finally {
      setIsLookingUpCode(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white sm:text-[28px]">Incoming orders</h2>
        <p className="mt-1 max-w-4xl text-sm text-stone-400">Newest requests appear first and refresh automatically. Give dine-in guests their staff code; contact pickup and delivery guests directly from their order.</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
          <span className="font-semibold text-orange-300">{orders.filter(order => order.status === 'pending').length} pending {orders.filter(order => order.status === 'pending').length === 1 ? 'order' : 'orders'}</span>
          <span className="inline-flex items-center gap-2"><RefreshCw className="h-3 w-3" /> Last checked {lastChecked.toLocaleTimeString()}</span>
        </p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}

      <section className="dashboard-order-code rounded-2xl border border-stone-800 bg-stone-900 p-4 sm:p-5">
        <h3 className="flex items-center gap-2 text-base font-bold text-white"><Search className="h-4 w-4 text-emerald-400" /> Find a dine-in order by code</h3>
        <p className="mt-1 text-sm text-stone-400">Ask the guest for their 8-character code and enter it here to see their items.</p>
        <form onSubmit={event => void handleStaffCodeLookup(event)} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={staffCode}
            onChange={event => setStaffCode(event.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 8))}
            maxLength={8}
            autoComplete="off"
            spellCheck={false}
            aria-label="Staff order code"
            placeholder="8-character code"
            className="min-h-11 flex-1 rounded-xl border border-stone-700 bg-stone-950 px-4 font-mono text-lg tracking-[0.2em] text-white outline-none placeholder:font-sans placeholder:text-sm placeholder:tracking-normal focus:border-emerald-500"
          />
          <button type="submit" disabled={isLookingUpCode || staffCode.length !== 8} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#008751] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#006C40] disabled:cursor-not-allowed disabled:opacity-50">
            {isLookingUpCode ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Finding…</> : 'Show order'}
          </button>
        </form>
        {staffCodeError && <p role="alert" className="mt-3 text-sm text-red-300">{staffCodeError}</p>}
        {staffOrder && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-stone-950 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-800 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">{staffOrder.restaurantName} · Dine in</p>
                <h4 className="mt-1 text-xl font-extrabold text-white">{staffOrder.orderNumber}</h4>
                <p className="mt-1 text-sm text-stone-300">Guest: <span className="font-semibold text-white">{staffOrder.customerName}</span></p>
                <p className="mt-1 text-xs font-semibold capitalize text-emerald-300">Status: {staffOrder.status}</p>
              </div>
              <p className="text-xs text-stone-500">{new Date(staffOrder.createdAt).toLocaleString()}</p>
            </div>
            <ul className="divide-y divide-stone-800">
              {staffOrder.items.map((item, index) => (
                <li key={`${item.menuItemId}-${index}`} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="font-medium text-white">{item.quantity} × {item.name}</span>
                  <span className="shrink-0 font-semibold text-emerald-300">{staffOrder.currency}{(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            {staffOrder.specialInstructions && <p className="mt-2 whitespace-pre-line rounded-lg bg-stone-900 p-3 text-sm text-stone-300">{staffOrder.specialInstructions}</p>}
            <div className="mt-3 flex justify-between border-t border-stone-800 pt-3 font-bold text-white">
              <span>Estimated total</span><span>{staffOrder.currency}{staffOrder.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}
      </section>

      {visibleOrders.length === 0 && (statusFilter !== 'all' || orderSearch.trim()) ? (
        <p className="rounded-xl border border-stone-800 bg-stone-900 p-5 text-sm text-stone-400">No orders match this search and status.</p>
      ) : orders.length === 0 ? (
        <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 text-center text-stone-400">
          <Menu360AdireBand />
          <div className="px-6 py-14">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#F2A31B]"><Menu360FoodIcon kind="menu" size={40} /></div>
            <p className="text-base font-semibold">No order requests yet</p>
            <p className="mt-1 text-sm text-stone-500">Requests guests submit from your menu will appear here. Keep this page open or check WhatsApp for messages.</p>
          </div>
        </div>
      ) : (
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={orderSearch}
              onChange={event => setOrderSearch(event.target.value)}
              placeholder="Search customer or order ID"
              className="min-h-10 flex-1 rounded-xl border border-stone-800 bg-stone-900 px-4 text-sm text-white outline-none placeholder:text-stone-500 focus:border-emerald-500"
            />
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'completed', 'cancelled'] as const).map(status => (
                <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`min-h-10 rounded-xl px-3 text-xs font-semibold capitalize ${
                  statusFilter === status ? 'bg-[#008751] text-white' : 'border border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-800'
                }`}>
                  {status === 'all' ? `All (${orders.length})` : `${status} (${orders.filter(order => order.status === status).length})`}
                </button>
              ))}
            </div>
          </div>
          {visibleOrders.map(order => (
            <div key={order.id} className={`dashboard-order-card bg-stone-900 border rounded-3xl p-4 sm:p-5 space-y-4 ${
              newOrderIds.includes(order.id) ? 'border-emerald-500/60' : 'border-stone-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{order.customerName}</h3>
                    {newOrderIds.includes(order.id) && <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">New</span>}
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

                    <div className="flex flex-wrap items-center gap-2">
                      {order.customerPhone && order.deliveryPreference !== 'dine-in' && (
                        <a
                          href={getCustomerWhatsappUrl(order, currentRestaurant.currency)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                        >
                          <MessageCircle className="h-4 w-4" /> Text customer
                        </a>
                      )}
                      <button
                        type="button"
                        disabled={order.status !== 'pending' || updatingOrderId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 ${
                          order.status === 'completed' ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-emerald-600 bg-emerald-950/60 text-emerald-200 hover:bg-emerald-800'
                        }`}
                      >
                        {updatingOrderId === order.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        {updatingOrderId === order.id ? 'Saving…' : 'Complete'}
                      </button>
                      <button
                        type="button"
                        disabled={order.status !== 'pending' || updatingOrderId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-60 ${
                          order.status === 'cancelled' ? 'border-red-500 bg-red-600 text-white' : 'border-red-600 bg-red-950/60 text-red-200 hover:bg-red-800'
                        }`}
                      >
                        <XCircle className="h-4 w-4" /> Cancel
                      </button>
                    </div>
              </div>

              {/* Order details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Order Items</h4>
                  <ul className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-stone-800/50 px-3 py-2.5 rounded-xl border border-stone-800">
                        <span className="text-white font-medium">{item.quantity}x {item.name}</span>
                        <span className="text-orange-400 font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="dashboard-order-info space-y-3 bg-stone-800/30 p-4 sm:p-5 rounded-2xl border border-stone-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Order & Customer Info</h4>
                  <div className="space-y-2 text-stone-300 text-xs">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-stone-400">Preference:</span>
                      <span className="text-white font-bold">{order.deliveryPreference === 'dine-in' ? 'Dine in' : order.deliveryPreference === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                    </p>
                    {order.customerPhone && (
                      <a href={`tel:${order.customerPhone}`} className="flex w-fit items-center gap-2 text-stone-300 underline decoration-stone-500 underline-offset-2 hover:text-white">
                        <Phone className="w-3.5 h-3.5 text-orange-500" />
                        <span>{order.customerPhone}</span>
                      </a>
                    )}
                    {order.deliveryPreference !== 'dine-in' && !order.customerPhone && (
                      <p className="text-amber-300">No contact number was provided for this order.</p>
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
        </section>
      )}
    </div>
  );
};

function getCustomerWhatsappUrl(order: Order, currency: string) {
  const phone = (order.customerPhone || '').replace(/\D/g, '');
  const message = [
    `Hello ${order.customerName}, this is the restaurant following up on your ${order.deliveryPreference} order ${order.id}.`,
    `Items: ${order.items.map(item => `${item.quantity} × ${item.name}`).join(', ')}`,
    `Order total: ${currency}${order.totalAmount.toLocaleString()}`,
    ...(order.deliveryAddress ? [`Delivery address: ${order.deliveryAddress}`] : []),
    'Please reply so we can confirm availability and arrange your order.',
  ].join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
