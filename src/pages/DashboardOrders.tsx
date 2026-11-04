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
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const knownOrderIds = useRef(new Set(orders.map(order => order.id)));
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const visibleOrders = sortedOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const query = orderSearch.trim().toLowerCase();
    const normalizedIdQuery = normalizeOrderIdentifier(query);
    const matchesSearch = !query || (order.customerName || '').toLowerCase().includes(query)
      || order.id.toLowerCase().includes(query)
      || (normalizedIdQuery.length > 0 && normalizeOrderIdentifier(order.id).includes(normalizedIdQuery))
      || (normalizedIdQuery.length > 0 && normalizeOrderIdentifier(getOrderReference(order.id)).includes(normalizedIdQuery))
      || (order.customerPhone || '').toLowerCase().includes(query)
      || (order.deliveryAddress || '').toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
  const selectedOrder = visibleOrders.find(order => order.id === selectedOrderId) || visibleOrders[0];

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
        <section className="grid items-start gap-4 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.4fr)]">
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
            <input
              value={orderSearch}
              onChange={event => setOrderSearch(event.target.value)}
              aria-label="Search orders by customer, contact, or order ID"
              placeholder="Search customer, contact, or order ID"
              className="min-h-10 flex-1 rounded-xl border border-stone-800 bg-stone-900 px-4 text-sm text-white outline-none placeholder:text-stone-500 focus:border-emerald-500"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(['all', 'pending', 'completed', 'cancelled'] as const).map(status => (
                <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`min-h-10 shrink-0 rounded-xl px-3 text-xs font-semibold capitalize ${
                  statusFilter === status ? 'bg-[#008751] text-white' : 'border border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-800'
                }`}>
                  {status === 'all' ? `All (${orders.length})` : `${status} (${orders.filter(order => order.status === status).length})`}
                </button>
              ))}
            </div>
          </div>
          <div aria-label="Orders" className="max-h-64 space-y-2 overflow-y-auto pr-1 lg:max-h-[calc(100vh-19rem)]">
            {visibleOrders.map(order => (
              <button
                key={order.id}
                type="button"
                aria-pressed={selectedOrder?.id === order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`dashboard-order-card block w-full rounded-2xl border p-3 text-left transition ${
                  selectedOrder?.id === order.id
                    ? 'border-emerald-600 bg-emerald-500/10'
                    : newOrderIds.includes(order.id)
                      ? 'border-emerald-500/60 bg-stone-900'
                      : 'border-stone-800 bg-stone-900 hover:border-stone-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">{order.customerName}</span>
                    <span className="mt-1 block truncate font-mono text-[11px] text-stone-400">{getOrderReference(order.id)}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    order.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-700'
                      : order.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-600'
                        : 'bg-orange-500/20 text-orange-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <span className="mt-2 flex items-center justify-between gap-2 text-[11px] text-stone-500">
                  <span className="truncate">{order.items.length} item{order.items.length === 1 ? '' : 's'} · {order.deliveryPreference === 'dine-in' ? 'Dine in' : order.deliveryPreference}</span>
                  <span className="shrink-0">{new Date(order.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                </span>
              </button>
            ))}
          </div>

          {selectedOrder ? (
            <article aria-label={`Details for ${getOrderReference(selectedOrder.id)}`} className="dashboard-order-info min-w-0 rounded-2xl border border-stone-800 bg-stone-900 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-800 pb-4">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold text-emerald-700">{getOrderReference(selectedOrder.id)}</p>
                  <h3 className="mt-1 break-words text-xl font-bold text-white">{selectedOrder.customerName}</h3>
                  <p className="mt-1 text-xs text-stone-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                {newOrderIds.includes(selectedOrder.id) && <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">New</span>}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {selectedOrder.customerPhone && selectedOrder.deliveryPreference !== 'dine-in' && (
                  <a
                    href={getCustomerWhatsappUrl(selectedOrder, currentRestaurant.currency)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                  >
                    <MessageCircle className="h-4 w-4" /> Text customer
                  </a>
                )}
                <button
                  type="button"
                  disabled={selectedOrder.status !== 'pending' || updatingOrderId === selectedOrder.id}
                  onClick={() => void handleUpdateStatus(selectedOrder.id, 'completed')}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-950/60 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingOrderId === selectedOrder.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {updatingOrderId === selectedOrder.id ? 'Saving…' : selectedOrder.status === 'completed' ? 'Completed' : 'Complete'}
                </button>
                <button
                  type="button"
                  disabled={selectedOrder.status !== 'pending' || updatingOrderId === selectedOrder.id}
                  onClick={() => void handleUpdateStatus(selectedOrder.id, 'cancelled')}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-600 bg-red-950/60 px-4 py-2 text-xs font-bold text-red-200 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" /> Cancel
                </button>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Order items</h4>
                  <ul className="space-y-1.5">
                    {selectedOrder.items.map((item, index) => (
                      <li key={`${item.menuItemId}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-stone-800 bg-stone-800/50 px-3 py-2.5 text-sm">
                        <span className="min-w-0 break-words font-medium text-white">{item.quantity} × {item.name}</span>
                        <span className="shrink-0 font-bold text-orange-700">{currentRestaurant.currency}{(item.price * item.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3 rounded-2xl border border-stone-800 bg-stone-800/30 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Customer details</h4>
                  <div className="space-y-2 text-xs text-stone-600">
                    <p><span className="font-semibold text-stone-500">Status:</span> <span className="font-bold capitalize text-white">{selectedOrder.status}</span></p>
                    <p><span className="font-semibold text-stone-500">Order type:</span> <span className="font-bold text-white">{selectedOrder.deliveryPreference === 'dine-in' ? 'Dine in' : selectedOrder.deliveryPreference}</span></p>
                    {selectedOrder.customerPhone && (
                      <a href={`tel:${selectedOrder.customerPhone}`} className="flex w-fit items-center gap-2 underline decoration-stone-500 underline-offset-2 hover:text-white">
                        <Phone className="h-3.5 w-3.5 text-orange-600" /><span>{selectedOrder.customerPhone}</span>
                      </a>
                    )}
                    {selectedOrder.deliveryPreference !== 'dine-in' && !selectedOrder.customerPhone && <p className="text-amber-700">No contact number was provided.</p>}
                    {selectedOrder.deliveryAddress && (
                      <p className="flex items-start gap-2 break-words"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" /><span>{selectedOrder.deliveryAddress}</span></p>
                    )}
                    {selectedOrder.specialInstructions && <p className="whitespace-pre-line pt-2 italic text-stone-500">{selectedOrder.specialInstructions}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-stone-800 pt-3">
                    <span className="text-sm font-bold text-stone-500">Total</span>
                    <span className="text-lg font-black text-white">{currentRestaurant.currency}{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <p className="rounded-2xl border border-stone-800 bg-stone-900 p-5 text-sm text-stone-500">Select an order to see its details.</p>
          )}
        </section>
      )}
    </div>
  );
};

function getCustomerWhatsappUrl(order: Order, currency: string) {
  const phone = (order.customerPhone || '').replace(/\D/g, '');
  const message = [
    `Hello ${order.customerName}, this is the restaurant following up on your ${order.deliveryPreference} order ${getOrderReference(order.id)}.`,
    `Items: ${order.items.map(item => `${item.quantity} × ${item.name}`).join(', ')}`,
    `Order total: ${currency}${order.totalAmount.toLocaleString()}`,
    ...(order.deliveryAddress ? [`Delivery address: ${order.deliveryAddress}`] : []),
    'Please reply so we can confirm availability and arrange your order.',
  ].join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function getOrderReference(orderId: string) {
  return `M360-${orderId.slice(0, 8).toUpperCase()}`;
}

function normalizeOrderIdentifier(value: string) {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}
