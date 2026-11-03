import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, QrCode, Smartphone, Zap, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import heroImage from '../assets/images/jollof_turkey_1793350581200.jpg';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div data-marketing className="min-h-screen bg-[#f7f5ef] font-sans text-stone-900 selection:bg-[#304638] selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-semibold tracking-widest text-orange-600 uppercase">
              A considered digital home for your menu
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12]">
              Let your menu make a <span className="text-orange-600">lasting first impression.</span>
            </h1>
            <p className="text-lg text-stone-600 max-w-xl leading-relaxed">
              Give every dish the space it deserves. Share a polished, mobile-first menu your guests can browse anywhere.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/25 text-base"
              >
                Create Your Menu <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/store/the-pepper-house"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-stone-300 text-stone-800 font-semibold rounded-2xl hover:bg-stone-50 transition-all text-base shadow-sm"
              >
                Explore Live Demo <Smartphone className="w-4 h-4 text-orange-600" />
              </Link>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-stone-500 pt-2">
              <span>No credit card required</span>
              <span aria-hidden="true">·</span>
              <span>Simple, view-only menu</span>
              <span aria-hidden="true">·</span>
              <span>Free QR generator</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900">
              <img
                src={heroImage}
                alt="Menu360 Digital Storefront Preview"
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-stone-200 hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ₦
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Zero Commission</p>
                <p className="text-sm font-bold text-stone-900">Keep 100% of your earnings</p>
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
                desc: 'Print your custom QR code table tents, share your unique link on Instagram, Twitter, and WhatsApp status.',
                icon: QrCode,
              },
              {
                step: '04',
                title: 'Let guests explore',
                desc: 'Guests can browse dishes, read descriptions and check prices with no cart or checkout in the way.',
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
            Account billing and customer ordering are not enabled in this demo.
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
              a: 'Menu360 is view-only in this demo: it does not collect payments or process customer orders. Subscription billing is not enabled yet.',
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
