import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, MapPin, Search, UtensilsCrossed } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Category, MenuItem, Restaurant } from '../types';

export const StorefrontPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f7f5ef] flex items-center justify-center">
        <p className="text-sm font-medium text-stone-500">Preparing the menu…</p>
      </main>
    );
  }

  if (!restaurant || loadError) {
    return (
      <main className="min-h-screen bg-[#f7f5ef] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-400">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <p className="text-stone-600">{loadError || 'Restaurant not found.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-700">
          <ArrowLeft className="w-4 h-4" /> Back to Menu360
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#20251f]">
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
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-medium text-white/75 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Menu360
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
                <UtensilsCrossed className="h-9 w-9" />
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
            <p className="mt-2 text-sm text-stone-500">Browse the dishes, ingredients and prices from {restaurant.name}.</p>
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
          <div className="rounded-3xl border border-dashed border-[#dcd7cb] bg-white/60 px-6 py-20 text-center">
            <UtensilsCrossed className="mx-auto mb-4 h-8 w-8 text-[#83917a]" />
            <h3 className="font-serif text-xl text-[#303a31]">
              {menuItems.length === 0 ? 'The menu is being prepared' : 'No dishes found'}
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              {menuItems.length === 0 ? 'Please check back soon for the latest menu.' : 'Try a different search or category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(item => (
              <MenuCard key={item.id} item={item} category={categories.find(category => category.id === item.categoryId)} currency={restaurant.currency} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-[#e6e1d6] bg-[#f0eee7] px-5 py-8 text-center sm:px-8">
        <p className="font-serif text-lg text-[#29372c]">{restaurant.name}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Menu for browsing</p>
      </footer>
    </main>
  );
};

function MenuCard({ item, category, currency }: { item: MenuItem; category?: Category; currency: string }) {
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
            <UtensilsCrossed className="h-10 w-10 opacity-60" />
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
      </div>
    </article>
  );
}
