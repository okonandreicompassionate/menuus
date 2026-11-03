import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, QrCode, Smartphone, Zap, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StorageService } from '../services/storage';
import { PlatformSettings } from '../types';
import { Menu360Logo } from '../components/Menu360Brand';
import heroImage from '../assets/images/jollof_turkey_1793350581200.jpg';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    let active = true;
    StorageService.getPlatformSettings().then(settings => {
      if (active) setPlatformSettings(settings);
    }).catch(error => {
      if (active) setSettingsError(error instanceof Error ? error.message : 'Could not load platform settings.');
    });
    return () => { active = false; };
  }, []);

  return (
    <div data-marketing className="min-h-screen bg-[#f7f5ef] font-sans text-stone-900 selection:bg-[#304638] selection:text-white">
      <Navbar signupsEnabled={platformSettings?.signupsEnabled} />
      {settingsError && (
        <p role="alert" className="mx-auto max-w-7xl px-5 pt-4 text-sm text-red-700 sm:px-8 lg:px-12">
          Platform settings could not be loaded: {settingsError}
        </p>
      )}

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/" aria-label="menu360° home" className="inline-flex">
                <Menu360Logo markSize={56} />
              </Link>
              <p className="text-sm font-bold text-[#4B5D52]">Every dish, every angle.</p>
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Your menu online. Orders to your team.
            </h1>
            <p className="max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
              Add your dishes once. Guests scan your QR, see what’s available and send an order request to your restaurant’s WhatsApp and dashboard.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={platformSettings?.signupsEnabled === false}
                onClick={() => navigate('/signup')}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#008751] px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#006C40] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {platformSettings?.signupsEnabled === false ? 'Sign-ups paused' : 'Create your free menu'} <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/store/the-pepper-house"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-base font-semibold text-stone-800 transition-colors hover:bg-stone-50"
              >
                View sample menu <Smartphone className="h-4 w-4 text-[#008751]" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs font-medium text-stone-600 sm:text-sm">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700" /> Edit your menu any time</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700" /> Share by link or QR</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[390px] lg:col-span-5 lg:mr-0 lg:max-w-[360px]">
            <div className="relative h-[230px] overflow-hidden rounded-xl border border-[#E3DCC8] bg-stone-900 shadow-md sm:h-[270px] lg:h-[290px]">
              <img
                src={heroImage}
                alt="A sample dish shown on the Menu360 digital menu"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
                <p className="text-sm font-semibold">The Pepper House</p>
                <p className="mt-0.5 text-xs text-white/80">Sample dish from its online menu</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-stone-500">A real example of the menu your guests will see.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-stone-200 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#008751]">For owners and guests</h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-stone-900">From menu setup to a guest’s order</h3>
            <p className="text-stone-600 text-base">Add your dishes, share a QR code and receive clear requests from guests.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Set up your restaurant',
                desc: 'Add your restaurant name, contact details and WhatsApp business number.',
                icon: Zap,
              },
              {
                step: '02',
                title: 'Add dishes and prices',
                desc: 'Group dishes into categories, add photos and mark items available or sold out.',
                icon: Smartphone,
              },
              {
                step: '03',
                title: 'Put out your QR code',
                desc: 'Guests scan at the table or open your link from a message or social profile.',
                icon: QrCode,
              },
              {
                step: '04',
                title: 'Receive the request',
                desc: 'The order appears in your dashboard. Guests can also send the same details to your WhatsApp.',
                icon: Sparkles,
              },
            ].map((item, idx) => (
              <div key={idx} className="border-t-2 border-[#E3DCC8] bg-white p-6 transition-colors hover:border-[#008751]">
                <span className="text-xs font-bold tracking-widest text-[#008751]">{item.step}</span>
                <div className="mb-4 mt-4 text-[#008751]">
                  <item.icon className="h-6 w-6" />
                </div>
                <h4 className="mb-2 text-lg font-bold text-stone-900">{item.title}</h4>
                <p className="text-sm text-stone-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-to-use" className="scroll-mt-24 bg-[#FBF6EA] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#008751]">Quick guide</h2>
            <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B2E1F] sm:text-4xl">How to use Menu360</h3>
            <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">A straightforward guide for restaurant owners, staff and guests.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <article className="rounded-xl border border-[#E3DCC8] bg-white p-6 sm:p-8">
              <h4 className="text-xl font-bold text-[#0B2E1F]">For the restaurant</h4>
              <ol className="mt-5 space-y-5">
                {[
                  ['Set up your page', 'Create an account and add your restaurant name, description, hours and WhatsApp business number.'],
                  ['Build your menu', 'Add categories, dish names, prices and photos. Mark an item unavailable whenever you run out.'],
                  ['Share your menu', 'Download your QR artwork or copy the link. Put the QR on tables, counters, packaging or social media.'],
                  ['Handle incoming orders', 'Submitted requests appear in the dashboard Orders page. Keep it open to see new orders refresh, and use status filters to track pending and completed requests.'],
                  ['Help dine-in guests', 'Guests receive a numbered ticket and short code. Scan their QR or enter the code in Orders to view their items.'],
                ].map(([title, detail], index) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF4EE] text-xs font-bold text-[#008751]">{index + 1}</span>
                    <div><h5 className="text-sm font-bold text-stone-900">{title}</h5><p className="mt-1 text-sm leading-5 text-stone-600">{detail}</p></div>
                  </li>
                ))}
              </ol>
            </article>

            <article className="rounded-xl border border-[#E3DCC8] bg-white p-6 sm:p-8">
              <h4 className="text-xl font-bold text-[#0B2E1F]">For your guests</h4>
              <ol className="mt-5 space-y-5">
                {[
                  ['Open the menu', 'Scan the restaurant QR code or open its menu link. No app download is needed.'],
                  ['Choose what you want', 'Browse categories, search dishes and add available items to the order basket.'],
                  ['Choose dine-in, pickup or delivery', 'Enter a name. Delivery guests add an address; dine-in guests can simply submit their order.'],
                  ['Send the request', 'Submitting saves the order for the restaurant. WhatsApp can also open with the order details so the guest can message staff.'],
                  ['Show the dine-in ticket', 'For dine-in, keep the numbered ticket open and show its QR or short code to staff. They can look up the order and confirm it before preparing.'],
                ].map(([title, detail], index) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF4EE] text-xs font-bold text-[#008751]">{index + 1}</span>
                    <div><h5 className="text-sm font-bold text-stone-900">{title}</h5><p className="mt-1 text-sm leading-5 text-stone-600">{detail}</p></div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 rounded-lg bg-[#F5EFDF] p-3 text-xs leading-5 text-stone-600">
                Orders are requests, not automatic payment or kitchen tickets. Restaurant staff should confirm availability, final price and preparation with the guest.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#008751]">Made for everyday service</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
              Give guests the details they need before they order.
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Present your dishes, prices and restaurant details in one elegant place that works beautifully on every screen.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: 'A refined mobile menu', desc: 'A beautiful browsing experience, designed first for the phone in your guest’s hand.' },
                { title: 'Clear dish details', desc: 'Show names, descriptions, categories and prices before guests send a structured order request.' },
                { title: 'One easy-to-share link', desc: 'Share your storefront on social media, in messages or at your restaurant.' },
                { title: 'Your restaurant, your style', desc: 'Add your own story, contact details, photos and opening hours.' },
              ].map((feat, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-stone-900">{feat.title}</h4>
                    <p className="text-sm text-stone-600">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[#0B2E1F] p-8 text-white lg:p-10">
            <h4 className="mb-4 text-2xl font-bold">See the guest menu</h4>
            <p className="mb-8 text-sm leading-relaxed text-stone-200">
              Browse the sample menu as a customer would. It’s a preview; no real order is sent.
            </p>
            <Link
              to="/store/the-pepper-house"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#008751] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#006C40]"
            >
              Visit The Pepper House Storefront <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-stone-200 bg-stone-100 px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mx-auto mb-10 max-w-2xl space-y-4 text-center sm:mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600">Straightforward plans</h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Start free. Grow when you’re ready.</h3>
            <p className="text-sm leading-6 text-stone-600 sm:text-base">
              Your core menu, QR sharing and WhatsApp ordering are free. Paid plans are planned upgrades, not subscriptions you can buy yet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                name: 'Free',
                price: '₦0',
                cadence: 'forever',
                tagline: 'The real essentials for one food business.',
                features: ['One restaurant menu', 'Menu categories and dish photos', 'Shareable menu link and QR code', 'WhatsApp order basket', 'Update prices and availability'],
                status: 'Available now',
                featured: false,
              },
              {
                name: 'Pro',
                price: '₦3,000',
                cadence: 'per month',
                tagline: 'Know what guests love and bring them back.',
                features: ['Everything in Free', 'Menu views and popular-dish insights', 'Scheduled specials and offers', 'Remove Menu360 branding'],
                status: 'Planned',
                featured: true,
              },
              {
                name: 'Premium',
                price: '₦7,000',
                cadence: 'per month',
                tagline: 'More control for busy, growing restaurants.',
                features: ['Everything in Pro', 'Multiple staff accounts and roles', 'Menu variants and add-ons', 'Order activity and sales exports'],
                status: 'Planned',
                featured: false,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                cadence: 'tailored to your group',
                tagline: 'One workspace for a multi-location business.',
                features: ['Multiple branches and shared menus', 'Branch-level staff permissions', 'Group-wide reporting', 'Onboarding and priority support'],
                status: 'Talk to us when available',
                featured: false,
              },
            ].filter(plan => platformSettings?.paidPlansVisible !== false || plan.name === 'Free').map((plan) => (
              <div
                key={plan.name}
                className={`flex min-w-0 flex-col rounded-3xl border bg-white p-5 shadow-sm sm:p-6 ${
                  plan.featured ? 'border-[#304638] ring-2 ring-[#304638]/10' : 'border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-lg font-bold text-stone-900">{plan.name}</h4>
                  {plan.featured && <span className="rounded-full bg-[#304638]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#304638]">Most popular</span>}
                </div>
                <p className="mt-4 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">{plan.price}</p>
                <p className="mt-1 text-xs font-medium text-stone-500">{plan.cadence}</p>
                <p className="mt-4 min-h-10 text-sm leading-5 text-stone-600">{plan.tagline}</p>
                <ul className="mt-5 flex-1 space-y-3 border-t border-stone-100 pt-5">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex gap-2 text-xs leading-5 text-stone-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.name === 'Free' ? (
                  <button
                    type="button"
                    disabled={platformSettings?.signupsEnabled === false}
                    onClick={() => navigate('/signup')}
                    className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#263a2d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2d22] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {platformSettings?.signupsEnabled === false ? 'Sign-ups paused' : 'Start free'} <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="mt-6 flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-center text-xs font-semibold text-stone-500">
                    {plan.status}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mx-auto mt-7 max-w-3xl text-center text-xs leading-5 text-stone-500">
            WhatsApp orders are sent directly to the restaurant; customers confirm delivery and payment with the business. Menu360 does not collect payments. Paid prices and features are planned and are not available for purchase yet.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600">Got Questions?</h2>
          <h3 className="text-3xl font-extrabold tracking-tight text-stone-900">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Can guests order from the menu?',
              a: 'Guests can build a basket and send the order details to your restaurant’s WhatsApp. You confirm availability, delivery and payment directly with them.',
            },
            {
              q: 'Do I need technical skills to set up my menu?',
              a: 'Not at all! You can set up your restaurant, add your logo, categories, and dishes in less than 5 minutes right from your phone or laptop.',
            },
            {
              q: 'Are there any hidden commission fees?',
              a: 'Menu360 does not process payments. Guests send their order to your WhatsApp and arrange payment with your restaurant. Paid subscriptions are not available yet.',
            },
            {
              q: 'Can I download a QR code for my restaurant tables?',
              a: 'Yes! Every restaurant gets an instant downloadable QR code that customers can scan with their phone cameras to view your digital menu immediately.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-stone-900 mb-2">{item.q}</h4>
              <p className="text-sm text-stone-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};
