import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, UtensilsCrossed } from 'lucide-react';
import { StaffOrderView } from '../types';
import { StorageService } from '../services/storage';
import { Menu360Logo, Menu360Progress } from '../components/Menu360Brand';

export const StaffOrderPage: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>();
  const [order, setOrder] = useState<StaffOrderView | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    StorageService.getStaffOrder(token).then(data => {
      if (!active) return;
      setOrder(data);
    }).catch(loadError => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'This order ticket could not be opened.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [token]);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FBF6EA]"><Menu360Progress label="Loading order ticket" /></main>;
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#FBF6EA] px-5 text-center">
        <Link to="/" aria-label="menu360° home"><Menu360Logo /></Link>
        <div>
          <h1 className="text-xl font-bold text-[#0B2E1F]">Order ticket unavailable</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">{error || 'This ticket is invalid or has expired. Ask the guest to reopen their order ticket.'}</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#008751]"><ArrowLeft className="h-4 w-4" /> Menu360 home</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FBF6EA] px-4 py-6 text-[#0B2E1F] sm:px-6 sm:py-10">
      <article className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#E3DCC8] bg-white shadow-sm">
        <header className="bg-[#0B2E1F] px-5 py-5 text-white sm:px-7">
          <Link to="/" aria-label="menu360° home"><Menu360Logo dark markSize={36} /></Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-[#F2A31B]">{order.restaurantName} · Dine in</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-wide">{order.orderNumber}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/75"><Clock3 className="h-4 w-4" /> {new Date(order.createdAt).toLocaleString()}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">Status: {order.status}</p>
        </header>

        <section className="p-5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-[#E3DCC8] pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF4EE] text-[#008751]"><UtensilsCrossed className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Guest</p>
              <p className="text-lg font-bold">{order.customerName}</p>
            </div>
          </div>

          <h2 className="mb-3 mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">Items ordered</h2>
          <ul className="divide-y divide-[#E3DCC8]">
            {order.items.map((item, index) => (
              <li key={`${item.menuItemId}-${index}`} className="flex items-start justify-between gap-4 py-3">
                <span className="font-semibold">{item.quantity} × {item.name}</span>
                <span className="shrink-0 font-semibold">{order.currency}{(item.price * item.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>

          {order.specialInstructions && (
            <div className="mt-4 rounded-lg bg-[#FBF6EA] p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Note</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-5">{order.specialInstructions}</p>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-[#E3DCC8] pt-4 text-base font-extrabold">
            <span>Estimated total</span><span>{order.currency}{order.totalAmount.toLocaleString()}</span>
          </div>
          <p className="mt-3 text-xs leading-5 text-stone-500">Confirm availability and the final amount with the guest before preparing the order.</p>
        </section>
      </article>
    </main>
  );
};
