import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Menu360Logo } from './Menu360Brand';

export const Navbar: React.FC<{ signupsEnabled?: boolean | null }> = ({ signupsEnabled }) => {
  const navigate = useNavigate();
  const currentUser = StorageService.getCurrentUser();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-6 border-b border-[#e7e2d7] bg-[#FBF6EA]/95 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
      {/* Zone 1: Brand */}
      <Link to="/" aria-label="menu360° home" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
        <Menu360Logo markSize={42} />
      </Link>

      {/* Zone 2: Nav Links */}
      <nav className="hidden items-center gap-7 text-xs font-medium text-stone-600 md:flex">
        <a href="/#features" className="shrink-0 whitespace-nowrap transition-colors hover:text-[#008751]">Features</a>
        <a href="/#how-it-works" className="shrink-0 whitespace-nowrap transition-colors hover:text-[#008751]">How It Works</a>
        <Link to="/store/the-pepper-house" className="shrink-0 whitespace-nowrap transition-colors hover:text-[#304638]">Explore Demo</Link>
        <a href="/#pricing" className="shrink-0 whitespace-nowrap transition-colors hover:text-[#008751]">Plans</a>
        <a href="/#faq" className="shrink-0 whitespace-nowrap transition-colors hover:text-[#008751]">FAQ</a>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {currentUser ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-[#008751] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#006C40]"
          >
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden whitespace-nowrap px-4 py-2 text-sm font-bold text-stone-700 transition-colors hover:text-[#008751] sm:inline-flex"
            >
              Sign In
            </Link>
            <button
              type="button"
              disabled={signupsEnabled === false}
              onClick={() => navigate('/signup')}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#008751] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#006C40] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signupsEnabled === false ? 'Sign-ups paused' : 'Create Menu'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
