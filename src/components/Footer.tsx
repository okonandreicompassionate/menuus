import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-16 px-6 lg:px-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-white font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span>MenuDrop</span>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed">
            Empowering Nigerian restaurants, cafes, and food vendors with blazing-fast digital menus and seamless WhatsApp orders.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="/#features" className="hover:text-white transition-colors">Digital Storefront</a></li>
            <li><a href="/#features" className="hover:text-white transition-colors">WhatsApp Ordering</a></li>
            <li><a href="/#features" className="hover:text-white transition-colors">QR Code Generator</a></li>
            <li><a href="/#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Demo & Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/store/the-pepper-house" className="hover:text-white transition-colors">The Pepper House</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Merchant Login</Link></li>
            <li><Link to="/signup" className="hover:text-white transition-colors">Start Free Trial</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support & Legal</h4>
          <ul className="space-y-2.5 text-sm">
            <li><span className="text-stone-400">Lagos, Nigeria</span></li>
            <li><a href="https://wa.me/2348012345678" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp Support</a></li>
            <li><span className="text-stone-400">Privacy & Terms</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
        <p>© {new Date().getFullYear()} MenuDrop Technologies. Built for Nigerian Hospitality.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for food entrepreneurs.
        </p>
      </div>
    </footer>
  );
};
