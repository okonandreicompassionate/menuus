import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  LayoutDashboard,
  Menu as MenuIcon,
  FolderKanban,
  Settings,
  QrCode,
  LogOut,
  ExternalLink,
  ChevronDown,
  Menu as HamburgerMenu,
  X
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/auth';
import { Restaurant } from '../types';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(StorageService.getCurrentUser());
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant: Restaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    AuthService.getSession().then(async ({ user }) => {
      if (!active) return;
      StorageService.setCurrentUser(user);
      const dashboard = await StorageService.getDashboard();
      if (!active) return;
      StorageService.hydrateDashboard(dashboard);
      setCurrentUser(user);
      setIsCheckingSession(false);
    }).catch((error: unknown) => {
      if (!active) return;
      StorageService.setCurrentUser(null);
      setCurrentUser(null);
      if (error instanceof Error && error.message !== 'Not signed in.') {
        setSessionError(error.message);
      }
      setIsCheckingSession(false);
    });
    return () => { active = false; };
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      StorageService.setCurrentUser(null);
      navigate('/login');
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : 'Could not sign out. Please try again.');
    }
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Menu Items', path: '/dashboard/menu', icon: MenuIcon },
    { label: 'Categories', path: '/dashboard/categories', icon: FolderKanban },
    { label: 'Store Settings', path: '/dashboard/settings', icon: Settings },
    { label: 'Storefront & QR', path: '/dashboard/storefront', icon: QrCode },
  ];

  if (isCheckingSession) {
    return <div className="min-h-screen bg-stone-950 text-stone-300 flex items-center justify-center">Checking your session…</div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-300 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p>{sessionError || 'Please sign in to access your dashboard.'}</p>
        <button onClick={() => navigate('/login')} className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white">
          Go to sign in
        </button>
      </div>
    );
  }

  if (!currentRestaurant) {
    return <div className="min-h-screen bg-stone-950 text-stone-300 flex items-center justify-center">Your restaurant profile could not be loaded.</div>;
  }

  return (
    <div data-dashboard className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row font-sans selection:bg-orange-600 selection:text-white">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg">MenuDrop</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <HamburgerMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-72 bg-stone-900 border-r border-stone-800 shrink-0 fixed md:static inset-y-0 z-40 pt-16 md:pt-0`}
      >
        <div className="p-6 border-b border-stone-800 hidden md:flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white">MenuDrop</h1>
            <p className="text-xs text-stone-400">Merchant Dashboard</p>
          </div>
        </div>

        {/* Restaurant selector info */}
        <div className="p-4 mx-4 mt-6 rounded-2xl bg-stone-800/60 border border-stone-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {currentRestaurant.logo ? (
              <img
                src={currentRestaurant.logo}
                alt={currentRestaurant.name}
                className="w-10 h-10 rounded-xl object-cover border border-stone-700 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-stone-700 flex items-center justify-center text-stone-300 shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Store</p>
              <p className="text-sm font-bold text-white truncate">{currentRestaurant.name}</p>
            </div>
          </div>
          <Link
            to={`/store/${currentRestaurant.slug}`}
            target="_blank"
            title="View Storefront"
            className="p-2 rounded-xl bg-stone-700/60 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-stone-950 p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};
