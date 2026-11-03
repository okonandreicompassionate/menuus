import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Phone, Store, User as UserIcon } from 'lucide-react';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/auth';
import { Menu360Logo } from '../components/Menu360Brand';
import heroImage from '../assets/images/jollof_turkey_1793350581200.jpg';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupsEnabled, setSignupsEnabled] = useState<boolean | null>(null);
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    let active = true;
    StorageService.getPlatformSettings().then(settings => {
      if (active) setSignupsEnabled(settings.signupsEnabled);
    }).catch(loadError => {
      if (active) setSettingsError(loadError instanceof Error ? loadError.message : 'Could not check account availability.');
    });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = isSignUp
        ? await AuthService.signUp(name, restaurantName, whatsappNumber, email, password)
        : await AuthService.signIn(email, password);
      StorageService.setCurrentUser(result.user);
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to continue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-auth className="min-h-screen bg-[#f7f5ef] text-[#20251f]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-[#1e2922] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2E1F]/75 via-[#0B2E1F]/50 to-[#0B2E1F]/90" />
          <Link to="/" aria-label="menu360° home" className="relative z-10 inline-flex w-fit items-center gap-3 text-white">
            <Menu360Logo dark markSize={48} />
          </Link>
          <div className="relative z-10 max-w-xl pb-10">
            <p className="mb-5 text-[13px] font-bold uppercase tracking-[0.24em] text-[#F2A31B]">Every dish, every angle.</p>
            <h1 className="font-serif text-5xl font-medium leading-[1.1] tracking-tight text-white xl:text-6xl">
              A beautiful menu starts a beautiful meal.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-6 text-white/70">
              Bring your restaurant online with a simple, elegant menu that guests can browse from anywhere.
            </p>
            <div className="mt-9 flex items-center gap-3 text-xs text-white/70">
              <span className="h-px w-8 bg-[#d9c7a2]" />
              Your dishes. Your story. Your space.
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:justify-center lg:px-14 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            <Link to="/" aria-label="menu360° home" className="mb-10 inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-[#0B2E1F] lg:hidden">
              <Menu360Logo markSize={44} />
            </Link>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#77846c]">
              {isSignUp ? 'Your next chapter' : 'Welcome back'}
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-[#20251f] sm:text-4xl">
              {isSignUp ? 'Create your restaurant account' : 'Sign in to your dashboard'}
            </h2>
            <p className="mt-3 text-sm text-stone-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-semibold text-[#465841] underline decoration-[#b4bda9] underline-offset-4 transition hover:text-[#263a2d]"
              >
                {isSignUp ? 'Sign in' : 'Create one'}
              </button>
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-[#e7e2d7] bg-white p-6 shadow-[0_20px_60px_rgba(47,52,43,0.07)] sm:p-8">
              {isSignUp && signupsEnabled === false && (
                <p role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                  New restaurant sign-ups are temporarily paused. Please check back soon.
                </p>
              )}
              {isSignUp && settingsError && (
                <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {settingsError}
                </p>
              )}
              {error && (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignUp && (
                  <>
                    <AuthField label="Your full name" icon={UserIcon}>
                      <input type="text" autoComplete="name" required value={name} onChange={event => setName(event.target.value)} placeholder="Chef Tunde" className="auth-input" />
                    </AuthField>
                    <AuthField label="Restaurant name" icon={Store}>
                      <input type="text" autoComplete="organization" required value={restaurantName} onChange={event => setRestaurantName(event.target.value)} placeholder="Mama Put Express" className="auth-input" />
                    </AuthField>
                    <AuthField label="WhatsApp business number" icon={Phone}>
                      <input type="tel" autoComplete="tel" required value={whatsappNumber} onChange={event => setWhatsappNumber(event.target.value)} placeholder="+2348012345678" className="auth-input" />
                      <p className="mt-1.5 text-[11px] leading-4 text-stone-500">Include your country code for accurate restaurant contact details.</p>
                    </AuthField>
                  </>
                )}
                <AuthField label="Email address" icon={Mail}>
                  <input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="owner@restaurant.com" className="auth-input" />
                </AuthField>
                <AuthField label="Password" icon={Lock}>
                  <input
                    type="password"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    minLength={12}
                    maxLength={128}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="At least 12 characters"
                    className="auth-input"
                  />
                </AuthField>
                <button
                  type="submit"
                  disabled={isSubmitting || (isSignUp && signupsEnabled !== true)}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#008751] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#006C40] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Please wait…' : isSignUp && signupsEnabled === null ? 'Checking availability…' : isSignUp ? 'Create restaurant account' : 'Sign in'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="mt-6 text-center">
              <Link to="/store/the-pepper-house" className="text-xs font-medium text-stone-500 transition-colors hover:text-[#304638]">
                Explore the sample menu <span className="font-semibold text-[#465841]">The Pepper House</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

function AuthField({ label, icon: Icon, children }: { label: string; icon: typeof UserIcon; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.13em] text-stone-600">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        {children}
      </div>
    </div>
  );
}
