'use client';

import Image from 'next/image';
import Link from "next/link";
import { useEffect, useRef } from 'react';
import FeatureSection from "./components/FeatureSection";
import LandingNavbar from "./components/LandingNavbar";
import StatsSection from "./components/StatsSection";
import TestimonialSection from "./components/TestimonialSection";
import { useLanguage } from "./context/LanguageContext";

export default function Home() {
  const observerRef = useRef(null);
  const { t } = useLanguage();

  // Scroll reveal animation
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <section id="home" className="hero-gradient-bg text-white pt-28 pb-20 px-4 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#CE4912]/10 rounded-full blur-3xl animate-blob-delay-2" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl animate-blob-delay-4" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in-up">
              <p className="text-blue-300 text-sm font-medium mb-4 tracking-wide">
                {t('landing.heroSubtitle')}
              </p>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t('landing.heroTitle')}
                <span className="text-gradient-animate"> {t('landing.heroTitleHighlight')}</span>
              </h1>

              <p className="text-blue-100 text-lg mb-8 leading-relaxed opacity-0 animate-fade-in-up delay-200" style={{ animationFillMode: 'forwards' }}>
                {t('landing.heroDescription')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up delay-300" style={{ animationFillMode: 'forwards' }}>
                <Link
                  href="/register"
                  className="px-8 py-3 bg-[#CE4912] hover:bg-[#b84010] text-white font-semibold rounded-lg transition-all text-center cta-pulse shine-effect btn-press"
                >
                  {t('landing.startNow')}
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3 border border-white/30 hover:bg-white/10 hover:border-white/50 text-white font-semibold rounded-lg transition-all text-center btn-press"
                >
                  {t('landing.haveAccount')}
                </Link>
              </div>

              {/* Simple Trust Points */}
              <div className="flex flex-wrap gap-6 mt-10 text-sm text-blue-200 stagger-fade-in">
                <span className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {t('landing.freeForever')}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {t('landing.fastWithdrawal')}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {t('landing.noHiddenFees')}
                </span>
              </div>
            </div>

            {/* Right - Mobile App Mockup */}
            <div className="hidden md:flex justify-center opacity-0 animate-fade-in-right delay-400" style={{ animationFillMode: 'forwards' }}>
              <div className="relative animate-phone-float phone-glow">
                {/* Phone Frame */}
                <div className="relative w-[300px] h-[600px] bg-gray-800 rounded-[3rem] p-3 shadow-2xl border-4 border-gray-700">
                  {/* Screen */}
                  <div className="w-full h-full bg-gray-50 rounded-[2.2rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="bg-white px-6 py-2 flex justify-between items-center text-xs text-gray-600">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 bg-gray-600 rounded-sm"></div>
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="bg-white px-4 py-3">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-4">
                        <Image src="/icon.png" alt="Logo" width={28} height={28} className="rounded-lg" />
                        <div className="bg-[#042C71] text-white text-xs px-3 py-1 rounded-full font-medium animate-subtle-bounce">
                          5,000 pts
                        </div>
                      </div>

                      {/* Welcome */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{t('dashboard.welcome')}, User!</h3>
                        <p className="text-xs text-gray-500">{t('dashboard.welcomeBack')}</p>
                      </div>

                      {/* Balance Card */}
                      <div className="bg-gradient-to-br from-[#042C71] to-blue-700 rounded-2xl p-4 mb-4 shine-effect">
                        <p className="text-blue-200 text-xs mb-1">{t('dashboard.yourBalance')}</p>
                        <p className="text-3xl font-bold text-white">5,000</p>
                        <p className="text-blue-200 text-xs">{t('common.points')}</p>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 card-hover cursor-pointer">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-orange-500 text-sm">📋</span>
                          </div>
                          <p className="text-xs font-medium text-gray-900">{t('dashboard.earnPoints')}</p>
                          <p className="text-[10px] text-gray-400">{t('dashboard.completeTasks')}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 card-hover cursor-pointer">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-green-500 text-sm">💳</span>
                          </div>
                          <p className="text-xs font-medium text-gray-900">{t('nav.withdraw')}</p>
                          <p className="text-[10px] text-gray-400">{t('dashboard.cashOutPoints')}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-lg font-bold text-[#042C71]">239</p>
                          <p className="text-[10px] text-gray-400">{t('dashboard.totalEarned')}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-lg font-bold text-green-500">8</p>
                          <p className="text-[10px] text-gray-400">{t('dashboard.tasksDone')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-gray-800 rounded-b-2xl"></div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#CE4912]/20 rounded-full blur-2xl animate-blob"></div>
                <div className="absolute -top-6 -right-6 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl animate-blob-delay-2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div id="how-it-works" className="scroll-reveal">
        <StatsSection />
      </div>

      {/* Feature Section */}
      <div id="features" className="scroll-reveal">
        <FeatureSection />
      </div>

      {/* Testimonial Section */}
      <div id="testimonials" className="scroll-reveal">
        <TestimonialSection />
      </div>

      {/* Final CTA Section */}
      <section className="py-16 px-4 hero-gradient-bg text-white relative overflow-hidden scroll-reveal">
        {/* Background animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#CE4912]/10 rounded-full blur-2xl animate-blob-delay-2"></div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.readyToEarn')}
          </h2>
          <p className="text-blue-100 mb-8">
            {t('landing.joinThousands')}
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-[#CE4912] hover:bg-[#b84010] text-white font-semibold rounded-lg transition-all cta-pulse shine-effect btn-press"
          >
            {t('landing.createFreeAccount')}
          </Link>
          <p className="mt-4 text-sm text-blue-300">
            {t('landing.noCreditCard')}
          </p>
        </div>
      </section>
    </div>
  );
}
