import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Copy, Check, ExternalLink, Smartphone, Printer, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { StorageService } from '../services/storage';
import { Menu360HopLoader, Menu360Logo } from '../components/Menu360Brand';

export const DashboardStorefront: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const restaurants = StorageService.getRestaurants();
  const currentRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId) || restaurants[0];
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const storefrontUrl = currentRestaurant
    ? new URL(`/store/${encodeURIComponent(currentRestaurant.slug)}`, window.location.origin).toString()
    : '';

  useEffect(() => {
    let active = true;
    if (!storefrontUrl) return () => { active = false; };

    QRCode.toDataURL(storefrontUrl, {
      width: 900,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#17251c', light: '#ffffff' },
    }).then(dataUrl => {
      if (active) setQrCodeDataUrl(dataUrl);
    }).catch(qrError => {
      if (active) setError(qrError instanceof Error ? `Could not generate the QR code: ${qrError.message}` : 'Could not generate the QR code.');
    });

    return () => { active = false; };
  }, [storefrontUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      setCopied(true);
      setError('');
      window.setTimeout(() => setCopied(false), 2500);
    } catch (copyError) {
      setError(copyError instanceof Error ? `Could not copy the menu link: ${copyError.message}` : 'Could not copy the menu link.');
    }
  };

  const handleDownload = async () => {
    if (!currentRestaurant || !qrCodeDataUrl) return;
    try {
      const qrImage = await loadImage(qrCodeDataUrl);
      const brandMarkElement = document.querySelector<SVGSVGElement>('[data-brand-mark]');
      if (!brandMarkElement) throw new Error('The Menu360 brand mark is not available for the QR artwork.');
      const brandMarkMarkup = new XMLSerializer().serializeToString(brandMarkElement);
      const brandMarkImage = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(brandMarkMarkup)}`);
      await document.fonts.ready;
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1440;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser could not create the QR artwork.');

      context.fillStyle = '#FBF6EA';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#0B2E1F';
      context.fillRect(0, 0, canvas.width, 405);
      context.textAlign = 'center';
      context.drawImage(brandMarkImage, canvas.width / 2 - 48, 28, 96, 96);
      context.fillStyle = '#F2A31B';
      context.font = '700 23px Outfit, sans-serif';
      context.fillText('menu360°  ·  DIGITAL MENU', canvas.width / 2, 160);
      context.fillStyle = '#FBF6EA';
      context.font = `700 ${Math.max(34, Math.min(64, 1000 / currentRestaurant.name.length * 1.7))}px Outfit, sans-serif`;
      context.fillText(currentRestaurant.name, canvas.width / 2, 245, 960);
      context.fillStyle = '#FBF6EA';
      context.font = '700 25px Outfit, sans-serif';
      context.fillText('SCAN TO EXPLORE OUR MENU', canvas.width / 2, 320);

      context.fillStyle = '#FFFFFF';
      context.fillRect(150, 445, 780, 780);
      context.drawImage(qrImage, 190, 485, 700, 700);
      context.fillStyle = '#0B2E1F';
      context.font = '700 25px Outfit, sans-serif';
      context.fillText(storefrontUrl, canvas.width / 2, 1270, 960);
      context.fillStyle = '#008751';
      context.font = '700 22px Outfit, sans-serif';
      context.fillText('EVERY DISH, EVERY ANGLE.', canvas.width / 2, 1350);

      const imageBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not export the QR artwork.')), 'image/png');
      });
      const downloadUrl = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${currentRestaurant.slug}-menu360-qr.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      setError('');
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Could not download the QR artwork.');
    }
  };

  if (!currentRestaurant) {
    return <p className="rounded-2xl border border-stone-800 bg-stone-900 p-6 text-sm text-stone-300">Restaurant details are not available. Refresh your dashboard and try again.</p>;
  }

  return (
    <div data-qr-page className="mx-auto max-w-5xl space-y-8">
      <header className="qr-screen-only">
        <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.2em] text-orange-500">Share your restaurant</p>
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Storefront &amp; QR code</h2>
        <p className="mt-2 text-sm text-stone-400">A ready-to-print, branded QR card that opens your live menu.</p>
      </header>

      {error && <p role="alert" className="qr-screen-only rounded-xl border border-red-900 bg-red-950/60 p-4 text-sm text-red-200">{error}</p>}

      <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <section className="qr-screen-only flex flex-col justify-between space-y-6 rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/10 text-orange-500">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Your public menu link</h3>
            <p className="text-sm leading-6 text-stone-400">Share this link online so guests can browse your restaurant’s live dishes, prices and details.</p>
            <div className="break-all rounded-xl border border-stone-700 bg-stone-800 p-3 font-mono text-xs text-orange-300">{storefrontUrl}</div>
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button type="button" onClick={() => void handleCopy()} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-stone-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Link copied' : 'Copy link'}
            </button>
            <Link to={`/store/${currentRestaurant.slug}`} target="_blank" className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
              Preview menu <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="space-y-5">
          <article className="qr-print-card mx-auto w-full max-w-[390px] overflow-hidden rounded-[2rem] bg-[#f7f5ef] text-center shadow-2xl shadow-black/20">
            <div className="bg-[#0B2E1F] px-6 pb-7 pt-8 text-white">
              <div className="mx-auto mb-4"><Menu360Logo dark markSize={56} /></div>
              <p className="text-[13px] font-bold uppercase tracking-[0.24em] text-[#F2A31B]">Digital menu</p>
              <h3 className="mt-3 break-words font-serif text-2xl font-semibold leading-tight">{currentRestaurant.name}</h3>
              <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-white/80">Scan to explore our menu</p>
            </div>
            <div className="px-8 py-7">
              <div className="mx-auto flex aspect-square max-w-[260px] items-center justify-center rounded-2xl border border-[#e7e2d7] bg-white p-3 shadow-sm">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt={`QR code for ${currentRestaurant.name}'s Menu360 menu`} className="h-full w-full" />
                ) : (
                  <Menu360HopLoader label="Preparing QR" />
                )}
              </div>
              <p className="mt-5 break-all text-[10px] font-medium text-stone-600">{storefrontUrl}</p>
              <div className="mx-auto mt-5 h-px w-12 bg-[#b9aa89]" />
              <p className="mt-4 text-[13px] font-bold uppercase tracking-[0.2em] text-[#008751]">Every dish, every angle.</p>
            </div>
          </article>

          <div className="qr-screen-only mx-auto grid max-w-[390px] grid-cols-2 gap-3">
            <button type="button" onClick={() => window.print()} disabled={!qrCodeDataUrl} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50">
              <Printer className="h-4 w-4" /> Print card
            </button>
            <button type="button" onClick={() => void handleDownload()} disabled={!qrCodeDataUrl} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50">
              <Download className="h-4 w-4" /> Download PNG
            </button>
          </div>
          <p className="qr-screen-only mx-auto max-w-[390px] text-center text-xs leading-5 text-stone-500">Print the card for tables or download the high-resolution PNG to share or print elsewhere. The QR image is generated on this device.</p>
        </section>
      </div>
    </div>
  );
};

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not prepare the QR image for download.'));
    image.src = source;
  });
}
