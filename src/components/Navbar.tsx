import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { StorageService } from '../services/storage';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = StorageService.getCurrentUser();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-6 border-b border-[#e7e2d7] bg-[#f7f5ef]/90 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
      {/* Zone 1: Brand */}
      <Link to="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-xl font-bold tracking-tight text-[#233127]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#304638] text-white shadow-md shadow-[#304638]/20">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <span>Menu360</span>
      </Link>

      {/* Zone 2: Nav Links */}
      <nav className="hidden items-center gap-7 text-xs font-medium text-stone-600 md:flex">
        <a href="/#features" className="shrink-0 whitespace-nowrap transition-colors hover:text-[#304638]">Features</a>
        <a href="/#how-it-works" className="shrink-0 whitespace-nowrap transition-colors hover:text-[#304638]">How It Works</a>
        <Link to="/store/the-pepper-house" className="shrink-0 whitespace-nowrap transition-colors hover:text-[#304638]">Explore Demo</Link>
        <a href="/#pricing" className="shrink-0 whitespace-nowrap transition-colors hover:text-[#304638]">Demo Scope</a>
        <a href="/#faq" className="shrink-0 whitespace-nowrap transition-colors hover:text-[#304638]">FAQ</a>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {currentUser ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-[#263a2d] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1c2d22]"
          >
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden whitespace-nowrap px-4 py-2 text-xs font-semibold text-stone-700 transition-colors hover:text-[#263a2d] sm:inline-flex"
            >
              Sign In
            </Link>
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#263a2d] px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#263a2d]/20 transition-colors hover:bg-[#1c2d22]"
            >
              Create Menu <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
