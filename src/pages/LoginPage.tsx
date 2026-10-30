import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight, Lock, Mail, User as UserIcon, Store } from 'lucide-react';
import { StorageService } from '../services/storage';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignUp) {
      if (!name || !restaurantName) {
        setError('Please provide your name and restaurant name.');
        return;
      }
      const slug = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const userId = 'user-' + Date.now();
      const restaurantId = 'rest-' + Date.now();

      const newUser = {
        id: userId,
        email,
        name,
        restaurantId,
      };

      const newRestaurant = {
        id: restaurantId,
        userId,
        name: restaurantName,
        description: 'Authentic local cuisine and delicious meals.',
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
        whatsappNumber: '+2348012345678',
        address: 'Lagos, Nigeria',
        openingHours: 'Mon - Sun: 8:00 AM - 10:00 PM',
        currency: '₦',
        slug,
        isOpen: true,
        theme: 'warm' as const,
        plan: 'Starter' as const,
        createdAt: new Date().toISOString(),
      };

      StorageService.createRestaurantWithUser(newUser, newRestaurant);
      navigate('/dashboard');
    } else {
      // Demo / Login check
      const currentUser = StorageService.getCurrentUser();
      if (currentUser && currentUser.email === email) {
        navigate('/dashboard');
      } else {
        // Create user session if demo or match
        const demoUser = {
          id: 'user-demo',
          email,
          name: name || 'Merchant User',
          restaurantId: 'rest-pepper-house',
        };
        StorageService.setCurrentUser(demoUser);
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 text-2xl font-bold tracking-tight text-stone-900 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <span>MenuDrop</span>
        </Link>
        <h2 className="text-center text-2xl font-extrabold text-stone-900">
          {isSignUp ? 'Create your restaurant account' : 'Sign in to your dashboard'}
        </h2>
        <p className="text-center text-sm text-stone-600 mt-2">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
          >
            {isSignUp ? 'Sign in' : 'Create one now'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-stone-200 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Chef Tunde"
                      className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Restaurant Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Store className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="Mama Put Express"
                      className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@restaurant.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 shadow-lg shadow-orange-600/25 transition-all"
              >
                {isSignUp ? 'Create Restaurant Account' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/store/the-pepper-house" className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors">
              Want to see a live customer storefront? <span className="text-orange-600 font-semibold">View The Pepper House</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
