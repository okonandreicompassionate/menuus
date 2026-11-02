import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#e7e2d7] bg-[#eeece4] px-6 py-16 text-stone-600 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#263a2d] font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-[#304638] flex items-center justify-center text-white">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span>MenuDrop</span>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed">
            Helping Nigerian restaurants, cafes, and food vendors share beautiful, easy-to-browse digital menus.
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
        <p>© {new Date().getFullYear()} MenuDrop Technologies. Built for Nigerian Hospitality.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for food entrepreneurs.
        </p>
      </div>
    </footer>
  );
};
