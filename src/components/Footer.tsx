import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Menu360Logo } from './Menu360Brand';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E3DCC8] bg-[#FBF6EA] px-6 py-16 text-stone-600 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <Link to="/" aria-label="menu360° home" className="inline-flex">
            <Menu360Logo markSize={40} />
          </Link>
          <p className="text-sm text-stone-400 leading-relaxed">
            Every dish, every angle. Beautiful digital menus for Nigerian food businesses.
          </p>
        </div>

        <div>
          <h4 className="text-[#263a2d] font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="/#features" className="transition-colors hover:text-[#263a2d]">Digital Storefront</a></li>
            <li><a href="/#features" className="transition-colors hover:text-[#263a2d]">Menu Browsing</a></li>
            <li><a href="/#features" className="transition-colors hover:text-[#263a2d]">QR Code Generator</a></li>
            <li><a href="/#pricing" className="transition-colors hover:text-[#263a2d]">Pricing Plans</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#263a2d] font-semibold mb-4 text-sm uppercase tracking-wider">Demo & Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/store/the-pepper-house" className="transition-colors hover:text-[#263a2d]">The Pepper House</Link></li>
            <li><Link to="/login" className="transition-colors hover:text-[#263a2d]">Merchant Login</Link></li>
            <li><Link to="/signup" className="transition-colors hover:text-[#263a2d]">Start Free Trial</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#263a2d] font-semibold mb-4 text-sm uppercase tracking-wider">Support & Legal</h4>
          <ul className="space-y-2.5 text-sm">
            <li><span className="text-stone-400">Lagos, Nigeria</span></li>
            <li><a href="https://wa.me/2348012345678" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#263a2d]">WhatsApp Support</a></li>
            <li><span className="text-stone-400">Privacy & Terms</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#dcd8ce] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
        <p>© {new Date().getFullYear()} Menu360. Built for Nigerian Hospitality.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for food entrepreneurs.
        </p>
      </div>
    </footer>
  );
};
