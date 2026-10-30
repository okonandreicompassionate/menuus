import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, QrCode, MessageSquare, Smartphone, Zap, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 font-sans selection:bg-orange-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-semibold tracking-widest text-orange-600 uppercase">
              Digital Infrastructure for Food Entrepreneurs
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12]">
              Launch your restaurant digital menu in <span className="text-orange-600">5 minutes</span>.
            </h1>
            <p className="text-lg text-stone-600 max-w-xl leading-relaxed">
              Give your diners a gorgeous mobile ordering experience. Receive structured orders directly on WhatsApp with zero commission fees on every plate sold.
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
              <span>Direct WhatsApp orders</span>
              <span aria-hidden="true">·</span>
              <span>Free QR generator</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900">
              <img
                src="/src/assets/images/hero_restaurant_store_1793350580179.jpg"
                alt="MenuDrop Digital Storefront Preview"
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
            <h3 className="text-3xl font-extrabold tracking-tight text-stone-900">How MenuDrop Works</h3>
            <p className="text-stone-600 text-base">Get your restaurant online and receiving orders in four simple steps.</p>
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
                title: 'Get WhatsApp Orders',
                desc: 'Customers browse your menu, add to cart, and send structured orders straight to your WhatsApp chat.',
                icon: MessageSquare,
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
              Traditional food delivery apps charge up to 25% commission per order. MenuDrop puts you directly in touch with your loyal customers through WhatsApp.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: 'Lightning-Fast Mobile Storefront', desc: 'Optimized for mobile browsers so customers order smoothly on any smartphone.' },
                { title: 'Instant WhatsApp Checkout', desc: 'Orders arrive formatted with itemized quantities, delivery addresses, and totals.' },
                { title: 'Downloadable QR Codes', desc: 'Generate table tent QR codes for dine-in customers or takeaway packaging.' },
                { title: 'Local NGN Currency Support', desc: 'Set accurate pricing in Naira with automatic category filtering and search.' },
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
              Experience our sample restaurant <span className="text-orange-400 font-semibold">"The Pepper House"</span>. Browse authentic Nigerian dishes, add items to your cart, and test the WhatsApp checkout flow right now.
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

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-stone-100 border-y border-stone-200 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600">Transparent Pricing</h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-stone-900">Simple plans for every kitchen</h3>
            <p className="text-stone-600 text-base">Start growing your online orders today with our affordable monthly plans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '₦3,000',
                period: '/month',
                desc: 'Perfect for small local food vendors and street kitchens.',
                features: ['Digital storefront', 'Up to 20 menu items', 'WhatsApp ordering', 'QR code generator'],
                popular: false,
              },
              {
                name: 'Pro',
                price: '₦7,000',
                period: '/month',
                desc: 'Ideal for growing restaurants and bustling cafes.',
                features: ['Unlimited menu items', 'Custom storefront themes', 'Order analytics & history', 'Priority WhatsApp support'],
                popular: true,
              },
              {
                name: 'Premium',
                price: '₦12,000',
                period: '/month',
                desc: 'For multi-branch restaurants and high-volume eateries.',
                features: ['Everything in Pro', 'Multiple staff accounts', 'Advanced analytics dashboard', 'Dedicated account manager'],
                popular: false,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-8 border relative flex flex-col justify-between shadow-sm transition-all hover:shadow-xl ${
                  plan.popular ? 'border-orange-600 ring-2 ring-orange-600/20' : 'border-stone-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-orange-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}
                <div>
                  <h4 className="text-xl font-bold text-stone-900 mb-1">{plan.name}</h4>
                  <p className="text-xs text-stone-500 mb-6">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-stone-900">{plan.price}</span>
                    <span className="text-stone-500 text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-sm text-stone-700">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.popular
                      ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-600/20'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
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
              q: 'How do customers place orders on WhatsApp?',
              a: 'When customers browse your MenuDrop storefront and add items to their cart, clicking "Order on WhatsApp" automatically generates a clean, structured text summary of their order, total amount, delivery preference, and instructions, opening your WhatsApp chat instantly.',
            },
            {
              q: 'Do I need technical skills to set up my menu?',
              a: 'Not at all! You can set up your restaurant, add your logo, categories, and dishes in less than 5 minutes right from your phone or laptop.',
            },
            {
              q: 'Are there any hidden commission fees?',
              a: 'No. MenuDrop charges a flat monthly subscription fee depending on your plan. You keep 100% of the profits from every meal you sell.',
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
