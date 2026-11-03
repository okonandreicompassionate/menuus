import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Copy, Check, ExternalLink, Smartphone, Printer, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { StorageService } from '../services/storage';
import { Menu360FoodIcon, Menu360HopLoader, Menu360Logo } from '../components/Menu360Brand';

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
      canvas.width = 1214;
      canvas.height = 1828;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser could not create the QR artwork.');

      context.scale(2, 2);
      context.fillStyle = '#FBF6EA';
      context.fillRect(0, 0, 607, 914);
      context.strokeStyle = '#E5DDC9';
      context.lineWidth = 2;
      roundedRect(context, 8, 8, 591, 898, 42);
      context.stroke();

      context.fillStyle = '#0B2E1F';
      roundedRect(context, 9, 8, 589, 260, 42);
      context.fill();
      context.fillRect(9, 48, 589, 220);
      drawAdireBand(context, 8, 48, 591);
      context.fillStyle = '#F2A31B';
      context.fillRect(8, 267, 591, 6);

      context.textAlign = 'center';
      context.drawImage(brandMarkImage, 171, 42, 52, 52);
      context.fillStyle = '#FBF6EA';
      context.textAlign = 'left';
      context.font = '700 22px Outfit, sans-serif';
      context.fillText('menu', 235, 76);
      context.fillStyle = '#F2A31B';
      context.fillText('360°', 279, 76);
      context.textAlign = 'center';
      context.fillStyle = '#F2A31B';
      context.font = '700 14px Outfit, sans-serif';
      context.letterSpacing = '3px';
      context.fillText('DIGITAL MENU', 303.5, 147);
      context.fillStyle = '#FBF6EA';
      context.letterSpacing = '-1px';
      context.font = `700 ${Math.max(25, Math.min(38, 520 / currentRestaurant.name.length * 1.7))}px Outfit, sans-serif`;
      context.fillText(currentRestaurant.name, 303.5, 218, 520);
      context.fillStyle = '#F2A31B';
      context.font = '700 14px Outfit, sans-serif';
      context.letterSpacing = '2px';
      context.fillText('SCAN TO EXPLORE OUR MENU', 303.5, 249);

      context.fillStyle = '#F2A31B';
      roundedRect(context, 154, 354, 300, 300, 27);
      context.fill();
      context.fillStyle = '#FFFFFF';
      roundedRect(context, 152, 351, 296, 296, 27);
      context.fill();
      context.drawImage(qrImage, 177, 376, 246, 246);
      drawFoodBadge(context, 112, 315, 'bowl');
      drawFoodBadge(context, 397, 314, 'skewer');
      drawFoodBadge(context, 113, 594, 'fruit');
      drawFoodBadge(context, 399, 594, 'drink');

      context.fillStyle = '#F2A31B';
      context.letterSpacing = 'normal';
      context.font = '700 16px Outfit, sans-serif';
      [65, 236, 408].forEach(x => {
        context.beginPath();
        context.arc(x, 712, 15, 0, Math.PI * 2);
        context.fill();
      });
      context.fillStyle = '#0B2E1F';
      context.textAlign = 'center';
      context.fillText('1', 65, 718);
      context.fillText('2', 236, 718);
      context.fillText('3', 408, 718);
      context.textAlign = 'left';
      context.font = '500 13px Outfit, sans-serif';
      context.fillText('Open your phone', 90, 712);
      context.fillText('camera', 90, 730);
      context.fillText('Point it at the', 261, 712);
      context.fillText('code', 261, 730);
      context.fillText('Tap the link', 432, 721);

      context.fillStyle = '#0B2E1F';
      context.textAlign = 'center';
      context.font = '500 11px Outfit, sans-serif';
      const urlLines = wrapText(context, storefrontUrl, 410);
      urlLines.slice(0, 2).forEach((line, index) => context.fillText(line, 303.5, 762 + index * 17));
      context.fillStyle = '#008751';
      context.font = '700 14px Outfit, sans-serif';
      context.letterSpacing = '3px';
      context.fillText('EVERY DISH, EVERY ANGLE.', 303.5, 797);
      context.fillStyle = '#F2A31B';
      context.fillRect(8, 838, 591, 6);
      drawAdireBand(context, 844, 62, 591);

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
          <article className="qr-print-card relative mx-auto aspect-[607/914] w-full max-w-[390px] overflow-hidden rounded-[2rem] border border-[#E5DDC9] bg-[#FBF6EA] text-center shadow-2xl shadow-black/20">
            <div className="qr-adire-band absolute inset-x-0 top-0 h-[6.1%]" />
            <div className="absolute inset-x-0 top-[5.9%] h-[23.2%] bg-[#0B2E1F]">
              <div className="mt-[5%] flex items-center justify-center gap-2">
                <Menu360Logo dark markSize={36} />
              </div>
              <p className="mt-[3%] text-[clamp(8px,2.2vw,13px)] font-bold uppercase tracking-[0.24em] text-[#F2A31B]">Digital menu</p>
              <h3 className="mx-auto mt-[2%] max-w-[90%] break-words px-2 text-[clamp(18px,5vw,29px)] font-bold leading-tight text-[#FBF6EA]">{currentRestaurant.name}</h3>
              <p className="mt-[2%] text-[clamp(8px,2.2vw,13px)] font-bold uppercase tracking-[0.16em] text-[#FBF6EA]">Scan to explore our menu</p>
            </div>
            <div className="absolute inset-x-0 top-[29.2%] h-[0.7%] bg-[#F2A31B]" />
            <div className="absolute inset-x-0 top-[29.9%] h-[63.8%] bg-[#FBF6EA]">
              <div className="absolute left-1/2 top-[11.5%] flex aspect-square w-[49.3%] -translate-x-1/2 items-center justify-center rounded-[10%] bg-[#F2A31B] p-[1%]">
                <div className="flex h-full w-full items-center justify-center rounded-[9%] bg-white p-[8%]">
                {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt={`QR code for ${currentRestaurant.name}'s Menu360 menu`} className="h-full w-full" />
                ) : (
                  <Menu360HopLoader label="Preparing QR" />
                )}
                </div>
              </div>
              <FoodBadge className="absolute left-[18.5%] top-[7%]" kind="jollof" />
              <FoodBadge className="absolute right-[18.5%] top-[7%]" kind="suya" />
              <FoodBadge className="absolute left-[18.5%] top-[59%]" kind="puffpuff" />
              <FoodBadge className="absolute right-[18.5%] top-[59%]" kind="zobo" />
              <div className="absolute inset-x-[8%] top-[71%] grid grid-cols-3 gap-1 text-left">
                {['Open your phone camera', 'Point it at the code', 'Tap the link'].map((step, index) => (
                  <div key={step} className="flex items-start gap-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F2A31B] text-[10px] font-bold text-[#0B2E1F]">{index + 1}</span>
                    <span className="text-[clamp(7px,1.9vw,11px)] leading-[1.35] text-[#0B2E1F]">{step}</span>
                  </div>
                ))}
              </div>
              <p className="absolute inset-x-[12%] top-[82%] line-clamp-2 break-all text-[clamp(7px,1.8vw,10px)] font-medium text-[#0B2E1F]">{storefrontUrl}</p>
              <p className="absolute inset-x-0 top-[89%] text-[clamp(8px,2vw,12px)] font-bold uppercase tracking-[0.2em] text-[#008751]">Every dish, every angle.</p>
            </div>
            <div className="absolute inset-x-0 top-[93.7%] h-[0.7%] bg-[#F2A31B]" />
            <div className="qr-adire-band absolute inset-x-0 bottom-0 h-[6.8%]" />
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

const FoodBadge: React.FC<{ className?: string; kind: 'jollof' | 'suya' | 'puffpuff' | 'zobo' }> = ({ className = '', kind }) => (
  <span className={`flex aspect-square w-[15%] items-center justify-center rounded-full border border-[#F2A31B] bg-[#FBF6EA] ${className}`}>
    <Menu360FoodIcon kind={kind} size={32} />
  </span>
);

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawAdireBand(context: CanvasRenderingContext2D, y: number, height: number, width: number) {
  context.save();
  context.beginPath();
  context.rect(0, y, width, height);
  context.clip();
  context.fillStyle = '#008751';
  context.fillRect(0, y, width, height);
  for (let x = 20; x < width; x += 40) {
    for (let bandY = y + 20; bandY < y + height + 20; bandY += 40) {
      context.beginPath();
      context.arc(x, bandY, 14, 0, Math.PI * 2);
      context.strokeStyle = '#FBF6EA';
      context.lineWidth = 2.5;
      context.stroke();
      context.beginPath();
      context.arc(x, bandY, 6.5, 0, Math.PI * 2);
      context.fillStyle = '#F2A31B';
      context.fill();
      context.beginPath();
      context.moveTo(x - 20, bandY - 20);
      context.lineTo(x - 14, bandY - 14);
      context.moveTo(x + 20, bandY - 20);
      context.lineTo(x + 14, bandY - 14);
      context.moveTo(x - 20, bandY + 20);
      context.lineTo(x - 14, bandY + 14);
      context.moveTo(x + 20, bandY + 20);
      context.lineTo(x + 14, bandY + 14);
      context.strokeStyle = '#FBF6EA';
      context.lineWidth = 2.5;
      context.stroke();
    }
  }
  context.restore();
}

function drawFoodBadge(context: CanvasRenderingContext2D, x: number, y: number, kind: 'bowl' | 'skewer' | 'fruit' | 'drink') {
  context.beginPath();
  context.arc(x + 44, y + 44, 44, 0, Math.PI * 2);
  context.fillStyle = '#FBF6EA';
  context.fill();
  context.strokeStyle = '#F2A31B';
  context.lineWidth = 3;
  context.stroke();
  context.strokeStyle = '#0B2E1F';
  context.lineWidth = 2.5;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  if (kind === 'bowl') {
    context.beginPath();
    context.moveTo(x + 24, y + 45);
    context.lineTo(x + 64, y + 45);
    context.lineTo(x + 60, y + 59);
    context.quadraticCurveTo(x + 44, y + 72, x + 28, y + 59);
    context.closePath();
    context.fillStyle = '#008751';
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(x + 22, y + 45);
    context.lineTo(x + 66, y + 45);
    context.stroke();
  } else if (kind === 'skewer') {
    context.beginPath();
    context.moveTo(x + 25, y + 63);
    context.lineTo(x + 63, y + 25);
    context.stroke();
    for (let index = 0; index < 3; index += 1) {
      context.save();
      context.translate(x + 34 + index * 10, y + 54 - index * 10);
      context.rotate(-Math.PI / 4);
      context.fillStyle = '#D9480F';
      roundedRect(context, -6, -4, 12, 8, 2);
      context.fill();
      context.stroke();
      context.restore();
    }
  } else if (kind === 'fruit') {
    context.fillStyle = '#F2A31B';
    context.beginPath();
    context.arc(x + 37, y + 48, 12, 0, Math.PI * 2);
    context.arc(x + 53, y + 48, 12, 0, Math.PI * 2);
    context.arc(x + 45, y + 33, 12, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  } else {
    context.fillStyle = '#D9480F';
    context.beginPath();
    context.moveTo(x + 31, y + 32);
    context.lineTo(x + 57, y + 32);
    context.lineTo(x + 54, y + 61);
    context.lineTo(x + 34, y + 61);
    context.closePath();
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(x + 44, y + 32);
    context.lineTo(x + 51, y + 20);
    context.stroke();
    context.fillStyle = '#F2A31B';
    context.beginPath();
    context.arc(x + 57, y + 27, 5, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/(?<=\/)|(?<=-)|\s/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line + word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}
