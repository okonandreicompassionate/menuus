import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, LoaderCircle, MapPin, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import QRCode from 'qrcode';
import { StorageService } from '../services/storage';
import { Category, MenuItem, Restaurant } from '../types';
import { Menu360AdireBand, Menu360FoodIcon, Menu360Logo, Menu360Progress } from '../components/Menu360Brand';

type SubmittedOrder = {
  id: string;
  whatsappUrl: string;
  demo: boolean;
  staffViewToken?: string;
  staffCode?: string;
};

export const StorefrontPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [whatsappOrderingEnabled, setWhatsappOrderingEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery' | 'dine-in'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [orderError, setOrderError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);

  useEffect(() => {
    let active = true;
    if (!slug) {
      setLoadError('Restaurant not found.');
      setIsLoading(false);
      return () => { active = false; };
    }

    StorageService.getStorefront(slug).then(data => {
      if (!active) return;
      setRestaurant(data.restaurant);
      setCategories(data.categories);
      setMenuItems(data.menuItems);
      setWhatsappOrderingEnabled(data.whatsappOrderingEnabled);
      setIsLoading(false);
      trackStorefrontVisit(slug);
    }).catch(error => {
      if (!active) return;
      setLoadError(error instanceof Error ? error.message : 'Unable to load this restaurant.');
      setIsLoading(false);
    });

    return () => { active = false; };
  }, [slug]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return menuItems.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
      const matchesQuery = !query || item.name.toLowerCase().includes(query)
        || item.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, menuItems, searchQuery]);
  const cartItems = useMemo(
    () => menuItems.filter(item => cart[item.id] && item.isAvailable),
    [cart, menuItems],
  );
  const cartItemCount = cartItems.reduce((sum, item) => sum + cart[item.id], 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * cart[item.id], 0);
  const whatsappPhone = restaurant?.whatsappNumber.replace(/\D/g, '') || '';
  const whatsappOrderLines = restaurant && whatsappOrderingEnabled && whatsappPhone.length >= 7
    && whatsappPhone.length <= 15 && cartItems.length > 0 && orderReference
    && customerName.trim()
    && (fulfillment !== 'delivery' || deliveryAddress.trim())
    ? [
      `Hello ${restaurant.name}, I'd like to send an order request.`,
      `Order reference: ${orderReference}`,
      `Fulfilment: ${fulfillment === 'dine-in' ? 'Dine-in' : fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}`,
      `Name: ${customerName.trim()}`,
      ...(fulfillment === 'delivery' ? [`Delivery address: ${deliveryAddress.trim()}`] : []),
      '',
      ...cartItems.map(item => `${cart[item.id]} × ${item.name} — ${restaurant.currency}${(item.price * cart[item.id]).toLocaleString()}`),
      '',
      `Total: ${restaurant.currency}${cartTotal.toLocaleString()}`,
      customerNote.trim() ? `Note: ${customerNote.trim()}` : '',
      '',
      'This is an order request, not a confirmed order. Please confirm availability, any delivery fee and payment with me before preparing it.',
    ].filter(Boolean)
    : [];
  const whatsappOrderUrl = whatsappOrderLines.length > 0
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappOrderLines.join('\n'))}`
    : '';

  const updateCart = (itemId: string, change: number) => {
    setCart(current => {
      const quantity = (current[itemId] || 0) + change;
      if (quantity <= 0) {
        const next = { ...current };
        delete next[itemId];
        return next;
      }
      return { ...current, [itemId]: quantity };
    });
  };

  const openOrderDialog = () => {
    setOrderReference(`M360-${Date.now().toString(36).toUpperCase()}`);
    setOrderError('');
    setIsCartOpen(true);
  };

  const handleSubmitOrder = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!restaurant) {
      setOrderError('Restaurant details are not available. Refresh the menu and try again.');
    } else if (cartItems.length === 0) {
      setOrderError('Add at least one available dish to your order.');
    } else if (!whatsappOrderingEnabled) {
      setOrderError('WhatsApp order requests are temporarily unavailable.');
    } else if (!customerName.trim()) {
      setOrderError('Enter your name so the restaurant knows who the request is from.');
    } else if (fulfillment === 'delivery' && !deliveryAddress.trim()) {
      setOrderError('Enter a delivery address or choose another option.');
    } else if (!whatsappOrderUrl) {
      setOrderError('This restaurant cannot receive WhatsApp orders right now.');
    } else if (restaurant.slug === 'the-pepper-house') {
      setOrderError('');
      setSubmittedOrder({ id: orderReference, whatsappUrl: '', demo: true });
      setCart({});
      setIsCartOpen(false);
    } else {
      setOrderError('');
      setIsSubmittingOrder(true);
      const whatsappWindow = window.open('about:blank', '_blank');
      try {
        const submission = await StorageService.submitOrder({
          restaurantId: restaurant.id,
          customerName: customerName.trim(),
          deliveryPreference: fulfillment,
          ...(fulfillment === 'delivery' ? { deliveryAddress: deliveryAddress.trim() } : {}),
          specialInstructions: customerNote.trim(),
          items: cartItems.map(item => ({ menuItemId: item.id, quantity: cart[item.id] })),
        });
        const orderNumber = `M360-${submission.order.id.slice(0, 8).toUpperCase()}`;
        const savedOrderWhatsappUrl = whatsappOrderUrl.replace(
          encodeURIComponent(orderReference),
          encodeURIComponent(orderNumber),
        );
        const staffCodeWhatsappUrl = submission.staffCode
          ? savedOrderWhatsappUrl.replace(
            encodeURIComponent(`Total: ${restaurant.currency}${cartTotal.toLocaleString()}`),
            encodeURIComponent(`Staff code: ${submission.staffCode}\nTotal: ${restaurant.currency}${cartTotal.toLocaleString()}`),
          )
          : savedOrderWhatsappUrl;
        setSubmittedOrder({
          id: orderNumber,
          whatsappUrl: staffCodeWhatsappUrl,
          demo: false,
          staffViewToken: submission.staffViewToken,
          staffCode: submission.staffCode,
        });
        setCart({});
        setIsCartOpen(false);
        if (whatsappWindow) {
          whatsappWindow.location.href = savedOrderWhatsappUrl;
        }
      } catch (submitError) {
        whatsappWindow?.close();
        setOrderError(submitError instanceof Error ? submitError.message : 'Could not send this order request. Please try again.');
      } finally {
        setIsSubmittingOrder(false);
      }
    }
  };

  if (isLoading) {
    return (
      <main data-storefront className="flex min-h-screen items-center justify-center bg-[#FBF6EA] px-6">
        <div className="w-full max-w-sm space-y-8 rounded-[18px] border-2 border-[#E3DCC8] bg-white p-8">
          <div className="flex justify-center"><Menu360Logo markSize={44} /></div>
          <Menu360Progress />
        </div>
      </main>
    );
  }

  if (!restaurant || loadError) {
    return (
      <main data-storefront className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FBF6EA] px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F2A31B]">
          <Menu360FoodIcon kind="menu" size={40} />
        </div>
        <p className="text-stone-600">{loadError || 'Restaurant not found.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-700">
          <ArrowLeft className="w-4 h-4" /> Back to Menu360
        </Link>
      </main>
    );
  }

  return (
    <main data-storefront className="min-h-screen bg-[#FBF6EA] text-[#0B2E1F]">
      <header className="relative min-h-[410px] overflow-hidden bg-[#1e2922] sm:min-h-[500px]">
        {restaurant.coverImage ? (
          <img
            src={restaurant.coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-55"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#5d6e52,_transparent_55%),linear-gradient(135deg,_#1e2922,_#373628)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171d18] via-[#171d18]/35 to-black/20" />

        <div className="relative mx-auto flex min-h-[410px] max-w-7xl flex-col px-5 pb-9 pt-6 sm:min-h-[500px] sm:px-8 sm:pb-12">
          <div className="flex items-center justify-between">
            <Link to="/" aria-label="menu360° home" className="inline-flex items-center gap-2 text-xs font-medium text-white/75 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> <Menu360Logo dark markSize={34} />
            </Link>
            <span className="rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
              Restaurant menu
            </span>
          </div>

          <div className="mt-auto flex flex-col gap-5 sm:flex-row sm:items-end">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={`${restaurant.name} logo`}
                className="h-20 w-20 rounded-2xl border border-white/30 bg-white object-cover shadow-xl sm:h-24 sm:w-24"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur sm:h-24 sm:w-24">
                <Menu360FoodIcon kind="jollof" size={50} />
              </div>
            )}
            <div className="max-w-3xl text-white">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9c7a2]">
                A menu by {restaurant.name}
              </p>
              <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
                {restaurant.name}
              </h1>
              {restaurant.description && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                  {restaurant.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-[#e7e2d7] bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 text-xs text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {restaurant.address && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#61765a]" /> {restaurant.address}
              </span>
            )}
            {restaurant.openingHours && (
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#61765a]" /> {restaurant.openingHours}
              </span>
            )}
          </div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
            restaurant.isOpen ? 'bg-[#eaf0e7] text-[#466043]' : 'bg-stone-100 text-stone-500'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${restaurant.isOpen ? 'bg-[#6b8c5f]' : 'bg-stone-400'}`} />
            {restaurant.isOpen ? 'Open today' : 'Currently closed'}
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#75856a]">Made with care</p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-[#20251f] sm:text-4xl">Explore the menu</h2>
            <p className="mt-2 text-sm text-stone-500">
              {whatsappOrderingEnabled
                ? `Adding dishes only makes a draft. Submit it to save the request in ${restaurant.name}’s dashboard and open WhatsApp.`
                : `Browse the menu and contact ${restaurant.name} directly to place an order.`}
            </p>
          </div>
          <label className="relative block w-full md:max-w-xs">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Find a dish"
              className="w-full rounded-full border border-[#e5e0d5] bg-white py-3 pl-11 pr-4 text-sm text-stone-800 outline-none transition focus:border-[#7b8b70] focus:ring-4 focus:ring-[#718369]/10"
            />
          </label>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeCategory === 'all'
                ? 'bg-[#263a2d] text-white'
                : 'border border-[#e5e0d5] bg-white text-stone-600 hover:border-[#9ca891]'
            }`}
          >
            All dishes
          </button>
          {categories.map(category => (
            <button
              type="button"
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeCategory === category.id
                  ? 'bg-[#263a2d] text-white'
                  : 'border border-[#e5e0d5] bg-white text-stone-600 hover:border-[#9ca891]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="overflow-hidden rounded-[18px] border-2 border-[#E3DCC8] bg-white text-center">
            <Menu360AdireBand />
            <div className="px-6 py-14">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F2A31B]">
                <Menu360FoodIcon kind="plantain" size={48} />
              </div>
              <h3 className="font-serif text-xl text-[#0B2E1F]">
                {menuItems.length === 0 ? 'The menu is being prepared' : 'No dishes found'}
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                {menuItems.length === 0 ? 'Please check back soon for the latest menu.' : 'Try a different search or category.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(item => (
              <MenuCard
                key={item.id}
                item={item}
                category={categories.find(category => category.id === item.categoryId)}
                currency={restaurant.currency}
                quantity={cart[item.id] || 0}
                onAdd={whatsappOrderingEnabled ? () => updateCart(item.id, 1) : undefined}
              />
            ))}
          </div>
        )}
        {!whatsappOrderingEnabled && (
          <p className="mt-6 rounded-xl border border-[#e7e2d7] bg-white px-4 py-3 text-center text-sm text-stone-600">
            Online order requests are temporarily unavailable. Please contact the restaurant directly.
          </p>
        )}
      </section>

      {whatsappOrderingEnabled && cartItemCount > 0 && !isCartOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={openOrderDialog}
            className="mx-auto flex min-h-14 w-full max-w-xl items-center justify-between rounded-2xl bg-[#17251c] px-5 py-3 text-left text-white shadow-2xl"
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm font-semibold">Review &amp; send · {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</span>
            </span>
            <span className="text-sm font-bold">{restaurant.currency}{cartTotal.toLocaleString()}</span>
          </button>
        </div>
      )}

      {isCartOpen && whatsappOrderingEnabled && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={event => {
          if (event.target === event.currentTarget) setIsCartOpen(false);
        }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-dialog-title"
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#fbfaf7] p-5 shadow-2xl sm:rounded-3xl sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#008751]">
                  {restaurant.slug === 'the-pepper-house' ? 'Sample menu preview' : 'The restaurant will receive this request'}
                </p>
                <h2 id="order-dialog-title" className="mt-1 text-2xl font-bold text-[#20251f]">Review your order</h2>
              </div>
              <button type="button" onClick={() => setIsCartOpen(false)} aria-label="Close order" className="rounded-full p-2 text-stone-500 hover:bg-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="divide-y divide-stone-200">
              {cartItems.map(item => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-800">{item.name}</p>
                    <p className="mt-1 text-xs text-stone-500">{restaurant.currency}{item.price.toLocaleString()} each</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => updateCart(item.id, -1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-700">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-stone-800">{cart[item.id]}</span>
                    <button type="button" aria-label={`Add one ${item.name}`} onClick={() => updateCart(item.id, 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-700">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-4 text-sm font-bold text-stone-900">
              <span>Estimated total</span>
              <span>{restaurant.currency}{cartTotal.toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-stone-600">
              {restaurant.slug === 'the-pepper-house'
                ? 'This sample lets you preview the order form. It will not contact a restaurant or save an order.'
                : 'Submitting saves it to the restaurant’s Orders page. WhatsApp will also open so you can message the staff directly.'}
            </p>

            <label className="mt-5 block text-xs font-semibold text-stone-700">
              Your name <span className="font-normal text-stone-500">(required)</span>
              <input value={customerName} onChange={event => setCustomerName(event.target.value)} maxLength={100} required className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 outline-none focus:border-[#718369] focus:ring-4 focus:ring-[#718369]/10" placeholder="How should the restaurant address you?" />
            </label>
            <fieldset className="mt-4">
              <legend className="text-xs font-semibold text-stone-700">Where are you ordering from?</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([
                  { value: 'dine-in', label: 'Dine in' },
                  { value: 'pickup', label: 'Pickup' },
                  { value: 'delivery', label: 'Delivery' },
                ] as const).map(option => (
                  <label key={option.value} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 text-sm font-semibold transition ${
                    fulfillment === option.value ? 'border-[#008751] bg-[#008751] text-white' : 'border-stone-300 bg-white text-stone-700'
                  }`}>
                    <input type="radio" name="fulfillment" value={option.value} checked={fulfillment === option.value} onChange={() => setFulfillment(option.value)} className="sr-only" />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {fulfillment === 'delivery' && (
              <label className="mt-3 block text-xs font-semibold text-stone-700">
                Delivery address <span className="font-normal text-stone-500">(required)</span>
                <textarea value={deliveryAddress} onChange={event => setDeliveryAddress(event.target.value)} maxLength={300} rows={2} required className="mt-1.5 w-full resize-y rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 outline-none focus:border-[#718369] focus:ring-4 focus:ring-[#718369]/10" placeholder="Street, area and any useful directions" />
              </label>
            )}
            <label className="mt-3 block text-xs font-semibold text-stone-700">
              Note for the restaurant <span className="font-normal text-stone-500">(optional)</span>
              <textarea value={customerNote} onChange={event => setCustomerNote(event.target.value)} maxLength={300} rows={2} className="mt-1.5 w-full resize-y rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 outline-none focus:border-[#008751] focus:ring-4 focus:ring-[#008751]/10" placeholder="Allergies or other requests…" />
            </label>
            {orderError && <p role="alert" className="mt-3 text-sm text-red-700">{orderError}</p>}
            <button type="button" onClick={handleSubmitOrder} disabled={isSubmittingOrder} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#008751] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#006C40] disabled:cursor-wait disabled:opacity-70">
              {isSubmittingOrder
                ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Sending request…</>
                : restaurant.slug === 'the-pepper-house'
                  ? <>Preview demo order <ShoppingBag className="h-4 w-4" /></>
                  : <>Send request &amp; open WhatsApp <ShoppingBag className="h-4 w-4" /></>}
            </button>
          </section>
        </div>
      )}

      {submittedOrder && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-h-[85dvh] max-w-lg overflow-y-auto rounded-2xl border border-[#008751]/20 bg-white p-4 shadow-xl" role="status">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#008751]" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#0B2E1F]">
                {submittedOrder.demo ? 'Demo only — no order was sent' : `Order received · ${submittedOrder.id}`}
              </p>
              <p className="mt-1 text-sm leading-5 text-stone-600">
                {submittedOrder.demo
                  ? 'This sample menu does not contact a real restaurant.'
                  : submittedOrder.staffViewToken
                    ? 'Show staff this QR or read them the 8-character code. They can open your order on their phone or enter the code in their dashboard.'
                    : 'Your request is on the restaurant’s Orders page. Send the message in WhatsApp to alert staff.'}
              </p>
              {!submittedOrder.demo && submittedOrder.staffViewToken && (
                <DineInOrderTicket orderNumber={submittedOrder.id} token={submittedOrder.staffViewToken} code={submittedOrder.staffCode} />
              )}
              {!submittedOrder.demo && (
                <a href={submittedOrder.whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-[#008751] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006C40]">
                  Open WhatsApp
                </a>
              )}
            </div>
            <button type="button" onClick={() => setSubmittedOrder(null)} aria-label="Dismiss order confirmation" className="rounded-full p-1 text-stone-500 hover:bg-stone-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-[#E3DCC8] bg-[#FBF6EA] px-5 py-8 text-center sm:px-8">
        <p className="font-serif text-lg text-[#29372c]">{restaurant.name}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          {whatsappOrderingEnabled ? 'Menu · WhatsApp order requests' : 'Menu · Browse the menu'} · Every dish, every angle.
        </p>
      </footer>
    </main>
  );
};

function MenuCard({ item, category, currency, quantity, onAdd }: {
  item: MenuItem;
  category?: Category;
  currency: string;
  quantity: number;
  onAdd?: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className={`overflow-hidden rounded-[1.4rem] border border-[#e9e4d9] bg-white shadow-[0_8px_24px_rgba(47,52,43,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(47,52,43,0.10)] ${!item.isAvailable ? 'opacity-75' : ''}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e7de]">
        {item.image && !imageFailed ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_#d3d9c8,_transparent_60%),linear-gradient(135deg,_#e8e7de,_#f1eee5)] text-[#65735f]">
            <Menu360FoodIcon kind="jollof" size={40} />
          </div>
        )}
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] backdrop-blur ${
          item.isAvailable ? 'bg-white/90 text-[#4c6546]' : 'bg-[#2d332d]/85 text-white'
        }`}>
          {item.isAvailable ? 'Available' : 'Sold out'}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            {category && <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#77846c]">{category.name}</p>}
            <h3 className="font-serif text-xl font-medium leading-snug text-[#272e27]">{item.name}</h3>
          </div>
          <p className="shrink-0 text-sm font-semibold text-[#465841]">{currency}{item.price.toLocaleString()}</p>
        </div>
        {item.description && <p className="text-xs leading-5 text-stone-500">{item.description}</p>}
        {onAdd && (
          <button
            type="button"
            disabled={!item.isAvailable}
            onClick={onAdd}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#17251c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263a2d] disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            <Plus className="h-4 w-4" />
            {item.isAvailable ? quantity ? `Add another · ${quantity} in order` : 'Add to order' : 'Unavailable'}
          </button>
        )}
      </div>
    </article>
  );
}

function DineInOrderTicket({ orderNumber, token, code }: { orderNumber: string; token: string; code?: string }) {
  const [qrCode, setQrCode] = useState('');
  const [qrError, setQrError] = useState('');
  const staffOrderUrl = `${window.location.origin}/staff/order/${encodeURIComponent(token)}`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(staffOrderUrl, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0B2E1F', light: '#FFFFFF' },
    }).then(dataUrl => {
      if (active) setQrCode(dataUrl);
    }).catch(error => {
      if (active) setQrError(error instanceof Error ? error.message : 'Could not create the staff QR ticket.');
    });
    return () => { active = false; };
  }, [staffOrderUrl]);

  return (
    <div className="mt-4 flex flex-col items-center rounded-xl border border-[#E3DCC8] bg-[#FBF6EA] p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#4B5D52]">Show staff this order ticket</p>
      <p className="mt-1 text-2xl font-extrabold tracking-wider text-[#0B2E1F]">{orderNumber}</p>
      {code && (
        <p className="mt-2 rounded-lg border border-[#E3DCC8] bg-white px-4 py-2 font-mono text-lg font-bold tracking-[0.2em] text-[#0B2E1F]">
          {code}
        </p>
      )}
      {qrCode ? (
        <img src={qrCode} alt={`QR ticket for order ${orderNumber}`} className="mt-3 h-48 w-48 rounded-lg bg-white p-2" />
      ) : qrError ? (
        <p role="alert" className="mt-3 text-xs text-[#D9480F]">QR ticket could not be generated: {qrError}</p>
      ) : (
        <div className="mt-3 flex h-48 w-48 items-center justify-center rounded-lg bg-white text-sm text-stone-500">Preparing QR ticket…</div>
      )}
      <p className="mt-2 max-w-xs text-xs leading-5 text-stone-600">Staff can scan the QR or type the 8-character code into Orders on their dashboard. Keep this page open until they’ve checked it.</p>
    </div>
  );
}

function trackStorefrontVisit(slug: string) {
  const visitKey = `menu360:visit:${slug}`;
  const visitorSessionKey = 'menu360:visitor-session';
  try {
    if (sessionStorage.getItem(visitKey)) return;
    const visitorSessionId = sessionStorage.getItem(visitorSessionKey) || crypto.randomUUID();
    sessionStorage.setItem(visitorSessionKey, visitorSessionId);
    sessionStorage.setItem(visitKey, 'recording');
    void StorageService.recordStorefrontVisit(slug, visitorSessionId).then(() => {
      sessionStorage.setItem(visitKey, 'recorded');
    }).catch(visitError => {
      try {
        sessionStorage.removeItem(visitKey);
      } catch (storageError) {
        console.error('Could not reset the storefront visit marker.', storageError);
      }
      console.error('Could not record this storefront visit.', visitError);
    });
  } catch (visitError) {
    console.error('Could not prepare storefront visit tracking.', visitError);
  }
}
