import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Building2, Eye, ShoppingBag, ShieldCheck, Users, UserPlus, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { AdminAnalytics, AdminRestaurant, PlatformSettings } from '../types';
import { Menu360AdireBand, Menu360Logo } from '../components/Menu360Brand';

export const AdminDashboard: React.FC = () => {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [activeRestaurants, setActiveRestaurants] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsError, setAnalyticsError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const loadRestaurants = async () => {
    setError('');
    setAnalyticsError('');
    try {
      const result = await StorageService.getAdminRestaurants();
      setRestaurants(result.restaurants);
      setTotalUsers(result.totalUsers);
      setTotalRestaurants(result.totalRestaurants);
      setActiveRestaurants(result.activeRestaurants);
      const [settingsResult, analyticsResult] = await Promise.allSettled([
        StorageService.getAdminPlatformSettings(),
        StorageService.getAdminAnalytics(),
      ]);
      if (settingsResult.status === 'fulfilled') setPlatformSettings(settingsResult.value);
      else {
        setPlatformSettings(null);
        setError(settingsResult.reason instanceof Error ? settingsResult.reason.message : 'Could not load platform controls.');
      }
      if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value);
      else {
        setAnalytics(null);
        setAnalyticsError(analyticsResult.reason instanceof Error
          ? analyticsResult.reason.message
          : 'Could not load platform analytics.');
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the admin dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRestaurants();
  }, []);

  const updateStatus = async (restaurant: AdminRestaurant) => {
    const nextStatus = restaurant.status === 'active' ? 'suspended' : 'active';
    const confirmed = window.confirm(
      `${nextStatus === 'suspended' ? 'Suspend' : 'Reactivate'} ${restaurant.name}? ${
        nextStatus === 'suspended' ? 'Its public menu will no longer be accessible.' : 'Its public menu will become accessible again.'
      }`,
    );
    if (!confirmed) return;
    setUpdatingId(restaurant.id);
    setError('');
    try {
      await StorageService.setRestaurantStatus(restaurant.id, nextStatus);
      setRestaurants(current => current.map(item => item.id === restaurant.id ? { ...item, status: nextStatus } : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update restaurant status.');
    } finally {
      setUpdatingId('');
    }
  };

  const updateSetting = async (setting: keyof PlatformSettings, enabled: boolean) => {
    setUpdatingId(setting);
    setError('');
    try {
      const updatedSettings = await StorageService.updateAdminPlatformSettings({ [setting]: enabled });
      setPlatformSettings(updatedSettings);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update platform settings.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div data-dashboard className="min-h-screen bg-stone-950 p-5 text-stone-100 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Link to="/" aria-label="menu360° home" className="mb-4 inline-flex">
              <Menu360Logo markSize={48} />
            </Link>
            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.2em] text-orange-500">Platform control room</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Admin dashboard</h1>
            <p className="mt-2 text-sm text-stone-400">Review registered restaurants and manage storefront availability.</p>
          </div>
          <Link to="/dashboard" className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-700 px-4 py-2.5 text-sm font-medium text-stone-300 transition hover:bg-stone-800/60">
            Merchant dashboard <ArrowUpRight className="h-4 w-4" />
          </Link>
        </header>

        {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <section className="grid gap-4 sm:grid-cols-3">
          <AdminStat label="Accounts" value={totalUsers} icon={Users} />
          <AdminStat label="Restaurants" value={totalRestaurants} icon={Building2} />
          <AdminStat label="Active storefronts" value={activeRestaurants} icon={ShieldCheck} />
        </section>

        <section className="space-y-5 rounded-[1.5rem] border border-stone-800 bg-stone-900 p-5 sm:p-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">Growth &amp; engagement</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Platform analytics</h2>
            <p className="mt-1 text-xs leading-5 text-stone-500">Rolling 30-day performance. Visits count once per restaurant in a browser tab session; no IP addresses are stored.</p>
          </div>
          {analytics ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AdminStat label="Menu visits · 30 days" value={analytics.visitsLast30Days} icon={Eye} />
                <AdminStat label="Order requests · 30 days" value={analytics.ordersLast30Days} icon={ShoppingBag} />
                <AdminStat label="New accounts · 30 days" value={analytics.signupsLast30Days} icon={UserPlus} />
                <AdminStat label="Pending orders" value={analytics.pendingOrders} icon={ShoppingBag} />
              </div>
              <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                  <AdminTrend title="Menu visits" values={analytics.daily.map(day => day.visits)} color="bg-emerald-500" />
                  <AdminTrend title="New accounts" values={analytics.daily.map(day => day.signups)} color="bg-orange-500" />
                  <AdminTrend title="Order requests" values={analytics.daily.map(day => day.orders)} color="bg-sky-500" />
                </div>
                <section className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">Top storefronts</h3>
                      <p className="mt-1 text-xs text-stone-500">Ranked by visits in the last 30 days</p>
                    </div>
                    <span className="text-xs text-stone-500">All-time visits: {analytics.totalVisits.toLocaleString()}</span>
                  </div>
                  {analytics.topRestaurants.length ? (
                    <ol className="mt-4 divide-y divide-stone-800">
                      {analytics.topRestaurants.map((item, index) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-800 text-xs font-bold text-orange-400">{index + 1}</span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-stone-100">{item.name}</p>
                              <p className="truncate text-xs text-stone-500">/{item.slug}</p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-white">{item.visits.toLocaleString()} visits</p>
                            <p className="text-xs text-stone-500">{item.orders.toLocaleString()} orders</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-5 text-sm text-stone-500">No active storefront activity yet. Visits will appear after the database update is installed.</p>
                  )}
                  <p className="mt-4 border-t border-stone-800 pt-3 text-xs text-stone-500">
                    {analytics.totalOrders.toLocaleString()} order requests total · Counts show requests, not confirmed sales.
                  </p>
                </section>
              </div>
            </>
          ) : isLoading ? (
            <p className="text-sm text-stone-500">Loading platform analytics…</p>
          ) : (
            <p role="status" className="rounded-xl border border-amber-900/70 bg-amber-950/30 p-4 text-sm leading-6 text-amber-200">
              Analytics are unavailable. Apply the latest <code className="rounded bg-black/30 px-1.5 py-0.5">supabase/schema.sql</code> to create the visit tracking table and reporting function.
              {analyticsError && <span className="mt-1 block text-xs text-amber-300/80">{analyticsError}</span>}
            </p>
          )}
        </section>
        <Menu360AdireBand />

        <section className="rounded-[1.5rem] border border-stone-800 bg-stone-900 p-5 sm:p-7">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Platform controls</h2>
            <p className="mt-1 text-xs text-stone-500">Changes are saved platform-wide and apply to new requests and page loads.</p>
          </div>
          {platformSettings ? (
            <div className="divide-y divide-stone-800">
              <AdminSettingToggle
                label="New restaurant sign-ups"
                description="Allow new businesses to create accounts."
                checked={platformSettings.signupsEnabled}
                disabled={updatingId !== ''}
                onChange={enabled => void updateSetting('signupsEnabled', enabled)}
              />
              <AdminSettingToggle
                label="WhatsApp order requests"
                description="Let guests compose orders from restaurant menus and send them to WhatsApp."
                checked={platformSettings.whatsappOrderingEnabled}
                disabled={updatingId !== ''}
                onChange={enabled => void updateSetting('whatsappOrderingEnabled', enabled)}
              />
              <AdminSettingToggle
                label="Show paid plans"
                description="Display the planned Pro, Premium and Enterprise tiers on the public pricing page."
                checked={platformSettings.paidPlansVisible}
                disabled={updatingId !== ''}
                onChange={enabled => void updateSetting('paidPlansVisible', enabled)}
              />
            </div>
          ) : isLoading ? (
            <p className="text-sm text-stone-500">Loading platform controls…</p>
          ) : (
            <p className="text-sm text-stone-400">Platform controls are unavailable until the database settings schema is installed.</p>
          )}
        </section>

        <section className="overflow-hidden rounded-[1.5rem] border border-stone-800 bg-stone-900">
          <div className="flex flex-col justify-between gap-2 border-b border-stone-800 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <h2 className="text-xl font-semibold text-white">Restaurants</h2>
              <p className="mt-1 text-xs text-stone-500">Showing the most recently created {restaurants.length} of {totalRestaurants}.</p>
            </div>
          </div>
          {isLoading ? (
            <p className="p-8 text-sm text-stone-500">Loading restaurants…</p>
          ) : restaurants.length === 0 ? (
            <p className="p-8 text-sm text-stone-500">No restaurant accounts have been created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-stone-800/30 text-[10px] uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Restaurant</th>
                    <th className="px-6 py-3 font-semibold">Owner</th>
                    <th className="px-6 py-3 font-semibold">Plan</th>
                    <th className="px-6 py-3 font-semibold">Created</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {restaurants.map(restaurant => (
                    <tr key={restaurant.id}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-stone-900">{restaurant.name}</p>
                        <p className="mt-1 text-xs text-stone-500">/{restaurant.slug}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-stone-700">{restaurant.owner.name}</p>
                        <p className="mt-1 text-xs text-stone-500">{restaurant.owner.email}</p>
                      </td>
                      <td className="px-6 py-4 text-stone-600">{restaurant.plan}</td>
                      <td className="px-6 py-4 text-stone-600">{new Date(restaurant.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          restaurant.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                        }`}>
                          {restaurant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/store/${restaurant.slug}`} target="_blank" className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100">
                            Preview
                          </Link>
                          <button
                            type="button"
                            disabled={updatingId === restaurant.id}
                            onClick={() => void updateStatus(restaurant)}
                            className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
                          >
                            {updatingId === restaurant.id ? 'Saving…' : restaurant.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

function AdminSettingToggle({ label, description, checked, disabled, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
      <span>
        <span className="block text-sm font-semibold text-stone-100">{label}</span>
        <span className="mt-1 block max-w-2xl text-xs leading-5 text-stone-500">{description}</span>
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={event => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-stone-700 transition peer-checked:bg-orange-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange-400 peer-disabled:opacity-50" />
        <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function AdminStat({ label, value, icon: Icon }: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-[1.25rem] border border-stone-800 bg-stone-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">{label}</span>
        <Icon className="h-4 w-4 text-orange-500" />
      </div>
      <p className="text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function AdminTrend({ title, values, color }: { title: string; values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const firstDate = new Date();
  firstDate.setDate(firstDate.getDate() - Math.max(values.length - 1, 0));
  const lastDate = new Date();

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-stone-400">{values.reduce((sum, value) => sum + value, 0).toLocaleString()} total</span>
      </div>
      <div className="mt-4 flex h-24 items-end gap-[2px]" role="img" aria-label={`${title} daily trend over the last 30 days`}>
        {values.map((value, index) => (
          <span
            key={index}
            title={`${value} on day ${index + 1}`}
            className={`min-w-0 flex-1 rounded-t-sm ${color} ${value ? 'opacity-80' : 'opacity-20'}`}
            style={{ height: `${Math.max((value / max) * 100, 3)}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-stone-500">
        <span>{firstDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <span>Daily · each chart uses its own scale</span>
        <span>{lastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}
