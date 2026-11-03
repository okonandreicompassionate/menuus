import React from 'react';
import { ArrowRight, ArrowUpRight, Check, Eye, FolderKanban, Menu as MenuIcon, QrCode, Store, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Menu360AdireBand } from '../components/Menu360Brand';

export const DashboardOverview: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(restaurant => restaurant.id === currentUser?.restaurantId) || restaurants[0];
  const menuItems = StorageService.getMenuItems(currentRestaurant.id);
  const categories = StorageService.getCategories(currentRestaurant.id);
  const availableItems = menuItems.filter(item => item.isAvailable).length;
  const planLabel = currentRestaurant.plan === 'Starter' ? 'Free' : currentRestaurant.plan;
  const nextAction = categories.length === 0
    ? { label: 'Create your first category', to: '/dashboard/categories', detail: 'Start by grouping dishes into sections guests can scan.' }
    : menuItems.length === 0
      ? { label: 'Add your first dish', to: '/dashboard/menu', detail: 'Add a dish name, photo, description and price to build your menu.' }
      : { label: 'Get your menu link', to: '/dashboard/storefront', detail: 'Your menu is taking shape. Get its QR code and shareable link.' };
  const setupSteps = [
    { label: 'Add a menu category', complete: categories.length > 0, to: '/dashboard/categories', icon: FolderKanban },
    { label: 'Add your first dish', complete: menuItems.length > 0, to: '/dashboard/menu', icon: MenuIcon },
    { label: 'Add restaurant details', complete: Boolean(currentRestaurant.address && currentRestaurant.openingHours), to: '/dashboard/settings', icon: Store },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <section className="dashboard-welcome overflow-hidden rounded-[1.75rem] border border-stone-800 p-5 sm:p-8 lg:p-10">
        <Menu360AdireBand className="mb-6" />
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              {planLabel} plan · Restaurant menu
            </p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Welcome, {currentUser?.name || 'Chef'}.
            </h2>
            <p className="text-sm leading-6 text-stone-400">
              Manage {currentRestaurant.name}’s dishes in one place, then share a polished menu guests can browse on their phones.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <Link
              to={nextAction.to}
              className="dashboard-primary-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition"
            >
              {nextAction.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={`/store/${currentRestaurant.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-700 px-5 py-3 text-sm font-semibold text-stone-300 transition hover:bg-stone-800/60"
            >
              Preview menu <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-xs leading-5 text-stone-500">{nextAction.detail}</p>
      </section>

      <section aria-label="Restaurant overview" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <OverviewStat label="Menu items" value={menuItems.length} detail="Dishes on your menu" icon={MenuIcon} />
        <OverviewStat label="Categories" value={categories.length} detail="Menu sections" icon={FolderKanban} />
        <OverviewStat label="Available" value={availableItems} detail="Ready to be viewed" icon={Check} />
        <OverviewStat label="Restaurant status" value={currentRestaurant.isOpen ? 'Open' : 'Closed'} detail="Menu remains available to browse" icon={Eye} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6">
        <div className="rounded-[1.5rem] border border-stone-800 bg-stone-900 p-5 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Getting started</p>
              <h3 className="text-2xl font-semibold text-white">Set up your menu</h3>
              <p className="mt-2 text-sm text-stone-400">A few details make your storefront ready to share.</p>
            </div>
            <UtensilsCrossed className="mt-1 h-5 w-5 shrink-0 text-orange-500" />
          </div>
          <div className="space-y-2">
            {setupSteps.map(({ label, complete, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 rounded-xl border border-stone-800/70 bg-stone-800/30 px-4 py-3 transition hover:bg-stone-800/60"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  complete ? 'bg-emerald-500/10 text-emerald-600' : 'bg-stone-800 text-stone-500'
                }`}>
                  {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span className={`flex-1 text-sm font-medium ${complete ? 'text-stone-400 line-through' : 'text-white'}`}>
                  {label}
                </span>
                {complete && <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Done</span>}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[1.5rem] border border-stone-800 bg-stone-900 p-5 sm:p-8">
          <div>
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600/10 text-orange-500">
              <QrCode className="h-5 w-5" />
            </div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Share your menu</p>
            <h3 className="text-2xl font-semibold text-white">One link, ready anywhere.</h3>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              Guests can build a basket and send their order to your restaurant on WhatsApp. Confirm availability and payment directly with them.
            </p>
          </div>
          <Link
            to="/dashboard/storefront"
            className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-stone-700 px-4 py-2.5 text-xs font-semibold text-stone-300 transition hover:border-stone-600 hover:bg-stone-800/60"
          >
            Get your menu link and QR code <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

function OverviewStat({ label, value, detail, icon: Icon }: {
  label: string;
  value: number | string;
  detail: string;
  icon: typeof MenuIcon;
}) {
  return (
    <div className="rounded-[1.25rem] border border-stone-800 bg-stone-900 p-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">{label}</span>
        <Icon className="h-4 w-4 text-orange-500" />
      </div>
      <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{detail}</p>
    </div>
  );
}
