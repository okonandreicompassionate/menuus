import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';
import { StorageService } from '../services/storage';

export const DashboardStorefront: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];

  const storefrontUrl = `${window.location.origin}/store/${currentRestaurant.slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&format=png&data=${encodeURIComponent(storefrontUrl)}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Storefront & QR Code</h2>
        <p className="text-sm text-stone-400">Share your public menu link or download a QR code that opens it.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Link Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-600/10 text-orange-500 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Your Public Storefront URL</h3>
            <p className="text-sm text-stone-400">
              Share this link so guests can browse your dishes, descriptions and prices. The public menu is view-only.
            </p>
            <div className="p-3 bg-stone-800 rounded-xl border border-stone-700 font-mono text-xs text-orange-400 truncate">
              {storefrontUrl}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Link'}</span>
            </button>
            <Link
              to={`/store/${currentRestaurant.slug}`}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-orange-600/25"
            >
              <span>Preview Store</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 space-y-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/10 text-orange-500 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Table QR Code</h3>
            <p className="text-sm text-stone-400">Guests scan to browse your view-only menu.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-stone-800">
            {/* Visual representation of QR code */}
            <img src={qrCodeUrl} alt={`QR code linking to ${currentRestaurant.name}'s menu`} className="h-48 w-48 rounded-xl object-contain" />
          </div>

          <a
            href={qrCodeUrl}
            download={`${currentRestaurant.slug}-menu-qr.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-5 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Download menu QR code
          </a>
        </div>
      </div>
    </div>
  );
};
