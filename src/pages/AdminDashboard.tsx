import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Building2, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { AdminRestaurant } from '../types';

export const AdminDashboard: React.FC = () => {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [activeRestaurants, setActiveRestaurants] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const loadRestaurants = async () => {
    setError('');
    try {
      const result = await StorageService.getAdminRestaurants();
      setRestaurants(result.restaurants);
      setTotalUsers(result.totalUsers);
      setTotalRestaurants(result.totalRestaurants);
      setActiveRestaurants(result.activeRestaurants);
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

  return (
    <div data-dashboard className="min-h-screen bg-stone-950 p-5 text-stone-100 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">MenuDrop control room</p>
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

function AdminStat({ label, value, icon: Icon }: {
  label: string;
  value: number;
  icon: typeof Users;
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
