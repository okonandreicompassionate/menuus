import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { StorageService } from '../services/storage';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = StorageService.getCurrentUser();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 bg-white/90 backdrop-blur-md border-b border-stone-200">
      {/* Zone 1: Brand */}
      <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0">
        <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/20">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <span>MenuDrop</span>
      </Link>

      {/* Zone 2: Nav Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
        <a href="/#features" className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0">Features</a>
        <a href="/#how-it-works" className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0">How It Works</a>
        <Link to="/store/the-pepper-house" className="hover:text-orange-600 transition-colors whitespace-nowrap shrink-0">Explore Demo</Link>
        <a href="/#pricing" className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0">Pricing</a>
        <a href="/#faq" className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0">FAQ</a>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {currentUser ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors whitespace-nowrap shadow-sm"
          >
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors whitespace-nowrap shadow-sm shadow-orange-600/20"
            >
              Create Menu <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
