import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Menu as MenuIcon,
  FolderKanban,
  Settings,
  QrCode,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu as HamburgerMenu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/auth';
import { Restaurant } from '../types';
import { Menu360Loader, Menu360Logo, Menu360Mark } from '../components/Menu360Brand';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(StorageService.getCurrentUser());
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('menu360:sidebar-collapsed') === 'true');
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant: Restaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navCollapsed = sidebarCollapsed && !mobileMenuOpen;

  useEffect(() => {
    localStorage.setItem('menu360:sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

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

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    const refreshPendingCount = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const count = await StorageService.getPendingOrderCount();
        if (active) setPendingOrderCount(count);
      } catch (error) {
        if (active) console.error('Could not refresh the pending order count.', error);
      }
    };
    void refreshPendingCount();
    const timer = window.setInterval(() => void refreshPendingCount(), 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [currentUser?.restaurantId]);

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
    { label: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Categories', path: '/dashboard/categories', icon: FolderKanban },
    { label: 'Store Settings', path: '/dashboard/settings', icon: Settings },
    { label: 'Storefront & QR', path: '/dashboard/storefront', icon: QrCode },
    ...(currentUser?.role === 'admin' ? [{ label: 'Admin Dashboard', path: '/admin', icon: ShieldCheck }] : []),
  ];

  if (isCheckingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FBF6EA]"><Menu360Loader label="Checking your menu" /></div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-300 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p>{sessionError || 'Please sign in to access your dashboard.'}</p>
        <button onClick={() => navigate('/login')} className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white">
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
        <Link to="/" aria-label="menu360° home" onClick={() => setMobileMenuOpen(false)}>
          <Menu360Logo dark markSize={38} />
        </Link>
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
        } md:flex flex-col ${sidebarCollapsed ? 'md:w-[76px]' : 'md:w-72'} w-full bg-stone-900 border-r border-stone-800 shrink-0 fixed md:sticky md:top-0 md:h-screen md:overflow-hidden inset-x-0 top-16 bottom-0 md:inset-y-0 z-40 transition-[width] duration-200`}
      >
        <div className={`border-b border-stone-800 hidden md:flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-4' : 'justify-between p-5'}`}>
          <Link to="/" aria-label="menu360° home">
            {sidebarCollapsed ? <Menu360Mark size={38} dark /> : <Menu360Logo dark markSize={40} />}
          </Link>
          {!sidebarCollapsed && (
            <button type="button" onClick={() => setSidebarCollapsed(true)} aria-label="Collapse navigation" title="Collapse navigation" className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-300 transition hover:bg-white/10 hover:text-white">
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
        {sidebarCollapsed && (
          <button type="button" onClick={() => setSidebarCollapsed(false)} aria-label="Expand navigation" title="Expand navigation" className="mx-auto mt-3 hidden h-9 w-9 items-center justify-center rounded-lg text-stone-300 transition hover:bg-white/10 hover:text-white md:flex">
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        {/* Restaurant selector info */}
        <div className={`menu360-active-store-card mx-3 mt-4 flex items-center rounded-2xl border border-stone-700/50 ${navCollapsed ? 'justify-center p-2' : 'justify-between gap-2 p-3'}`}>
          <div className={`flex min-w-0 items-center ${navCollapsed ? 'justify-center' : 'gap-3'}`}>
            {currentRestaurant.logo ? (
              <img
                src={currentRestaurant.logo}
                alt={currentRestaurant.name}
                className="h-10 w-10 rounded-xl border border-stone-700 object-cover shrink-0"
                referrerPolicy="no-referrer"
                title={currentRestaurant.name}
              />
            ) : (
              <div title={currentRestaurant.name} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-700"><Menu360Mark size={36} dark /></div>
            )}
            {!navCollapsed && <div className="min-w-0 truncate">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Store</p>
              <p className="text-sm font-bold text-white truncate">{currentRestaurant.name}</p>
            </div>}
          </div>
          {!navCollapsed && <Link
            to={`/store/${currentRestaurant.slug}`}
            target="_blank"
            title="View Storefront"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-700/60 text-stone-300 transition-colors hover:text-white hover:bg-stone-700"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>}
        </div>

        {/* Nav Links */}
        <nav className={`flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto py-4 ${navCollapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                title={navCollapsed ? item.label : undefined}
                aria-label={navCollapsed ? item.label : undefined}
                className={`flex min-h-11 shrink-0 items-center rounded-xl text-sm font-medium transition-all ${
                  navCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                } ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span className="relative flex shrink-0">
                  <item.icon className="w-5 h-5" />
                  {navCollapsed && item.label === 'Orders' && pendingOrderCount > 0 && (
                    <span aria-label={`${pendingOrderCount} pending orders`} className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold leading-none text-white">
                      {pendingOrderCount > 9 ? '9+' : pendingOrderCount}
                    </span>
                  )}
                </span>
                {!navCollapsed && <span className="flex min-w-0 flex-1 items-center justify-between gap-2 truncate">
                  {item.label}
                  {item.label === 'Orders' && pendingOrderCount > 0 && (
                    <span aria-label={`${pendingOrderCount} pending orders`} className="inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                      {pendingOrderCount > 99 ? '99+' : pendingOrderCount}
                    </span>
                  )}
                </span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className={`shrink-0 border-t border-stone-800 space-y-1 ${navCollapsed ? 'p-2' : 'p-3'}`}>
          <Link
            to="/"
            title={navCollapsed ? 'Back to Home' : undefined}
            className={`flex min-h-10 items-center rounded-xl text-sm font-medium text-stone-400 transition-colors hover:text-white hover:bg-stone-800/60 ${navCollapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}
          >
            <Menu360Mark size={22} dark />
            {!navCollapsed && <span>Back to Home</span>}
          </Link>
          <button
            onClick={handleLogout}
            title={navCollapsed ? 'Sign Out' : undefined}
            className={`w-full flex min-h-10 items-center rounded-xl text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 ${navCollapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}
          >
            <LogOut className="w-4 h-4" />
            {!navCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-64px)] min-w-0 flex-1 overflow-x-hidden bg-stone-950 p-4 sm:p-5 lg:p-7 md:min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
