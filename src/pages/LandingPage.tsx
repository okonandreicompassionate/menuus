import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, QrCode, Smartphone, Zap, Sparkles, ScanLine, ImagePlus } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import heroImage from '../assets/images/jollof_turkey_1793350581200.jpg';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div data-marketing className="min-h-screen bg-[#f7f5ef] font-sans text-stone-900 selection:bg-[#304638] selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-stone-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-orange-600" />
              A digital menu made for food businesses
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Your menu, ready for the <span className="text-orange-600">next guest.</span>
            </h1>
            <p className="max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
              Build a beautiful online menu with dish photos, descriptions and prices. Guests open your link or scan a QR code to browse on their phone—no app download needed.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <button
                onClick={() => navigate('/signup')}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-600/25 transition-all hover:bg-orange-700"
              >
                Create your menu <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/store/the-pepper-house"
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white px-6 py-3.5 text-base font-semibold text-stone-800 shadow-sm transition-all hover:bg-stone-50"
              >
                Explore the demo <Smartphone className="h-4 w-4 text-orange-600" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs font-medium text-stone-600 sm:text-sm">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700" /> Edit your menu any time</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-700" /> Share by link or QR</span>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border-4 border-white bg-stone-900 shadow-2xl sm:aspect-[5/4]">
              <img
                src={heroImage}
                alt="A sample dish shown on the Menu360 digital menu"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-4 pt-16 text-white sm:p-6 sm:pt-20">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">A sample guest view</p>
                <p className="mt-1 text-lg font-semibold sm:text-xl">A closer look at what’s on the menu</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:absolute sm:-bottom-5 sm:-left-5 sm:mt-0 sm:w-[calc(100%+2.5rem)] sm:grid-cols-2">
              <div className="flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-white p-3 shadow-lg sm:p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800"><ImagePlus className="h-4 w-4" /></span>
                <span className="text-xs font-semibold leading-4 text-stone-800 sm:text-sm">Photos &amp; prices</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-white p-3 shadow-lg sm:p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800"><ScanLine className="h-4 w-4" /></span>
                <span className="text-xs font-semibold leading-4 text-stone-800 sm:text-sm">QR-ready link</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-stone-200 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600">Simple Workflow</h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-stone-900">How Menu360 Works</h3>
            <p className="text-stone-600 text-base">Get your restaurant online and sharing its menu in four simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Store',
                desc: 'Sign up in 30 seconds, add your restaurant name, logo, address, and WhatsApp business number.',
                icon: Zap,
              },
              {
                step: '02',
                title: 'Add Your Menu',
                desc: 'Organize items into categories, upload appetizing food photos, set prices in NGN (₦), and toggle availability.',
                icon: Smartphone,
              },
              {
                step: '03',
                title: 'Share QR & Link',
                desc: 'Get a shareable menu link and QR code for tables, messages and social media.',
                icon: QrCode,
              },
              {
                step: '04',
                title: 'Let guests explore',
                desc: 'Guests can browse dishes, read descriptions and check prices. Ordering and checkout are not part of the current app.',
                icon: Sparkles,
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-stone-50 p-8 rounded-3xl border border-stone-200 relative group hover:border-orange-600/50 transition-all">
                <span className="text-4xl font-black text-stone-200 group-hover:text-orange-600/20 transition-colors absolute top-6 right-6">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-orange-600/10 text-orange-600 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h4>
                <p className="text-sm text-stone-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600">Built for Growth</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
              Everything Nigerian food businesses need to thrive online.
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Present your dishes, prices and restaurant details in one elegant place that works beautifully on every screen.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: 'A refined mobile menu', desc: 'A beautiful browsing experience, designed first for the phone in your guest’s hand.' },
                { title: 'Clear dish details', desc: 'Show names, descriptions, categories and prices without checkout friction.' },
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

          <div className="bg-stone-900 p-8 lg:p-12 rounded-3xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <h4 className="text-2xl font-bold mb-4">Ready to test drive?</h4>
            <p className="text-stone-300 text-sm mb-8 leading-relaxed">
              Step inside our sample restaurant <span className="text-orange-400 font-semibold">“The Pepper House”</span> and explore a complete digital menu.
            </p>
            <Link
              to="/store/the-pepper-house"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/30"
            >
              Visit The Pepper House Storefront <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Demo scope */}
      <section id="pricing" className="py-24 bg-stone-100 border-y border-stone-200 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600">Demo scope</h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-stone-900">A menu that’s ready to share</h3>
            <p className="text-stone-600 text-base">Set up your restaurant, manage dishes and let guests browse a polished public menu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Public storefront',
                description: 'Guests can browse dishes, descriptions, prices and availability on any device.',
                icon: Smartphone,
              },
              {
                title: 'Menu management',
                description: 'Organize your menu into categories and keep restaurant details up to date.',
                icon: Zap,
              },
              {
                title: 'Easy sharing',
                description: 'Share your public menu link or download its QR code from your dashboard.',
                icon: QrCode,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
                  <plan.icon className="h-5 w-5" />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-stone-900">{plan.title}</h4>
                <p className="text-sm leading-6 text-stone-600">{plan.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-stone-500">
            Menu360 currently publishes view-only menus. It does not process orders, payments or subscriptions.
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
              a: 'The public storefront is designed for browsing only. Guests can explore dishes, descriptions and prices; it does not include a cart or checkout.',
            },
            {
              q: 'Do I need technical skills to set up my menu?',
              a: 'Not at all! You can set up your restaurant, add your logo, categories, and dishes in less than 5 minutes right from your phone or laptop.',
            },
            {
              q: 'Are there any hidden commission fees?',
              a: 'The current app publishes view-only menus. It does not process orders or payments, and subscription billing is not enabled.',
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
