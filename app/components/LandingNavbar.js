'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function LandingNavbar({ isStatic = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(isStatic);
  const { t } = useLanguage();

  useEffect(() => {
    if (isStatic) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isStatic]);

  const navLinks = [
    { href: '#features', label: t('landing.navFeatures') },
    { href: '#how-it-works', label: t('landing.navHowItWorks') },
    { href: '#testimonials', label: t('landing.navTestimonials') },
    { href: '#faq', label: t('landing.navFaq') }
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-white shadow-sm py-3'
          : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/icon.png"
                alt="Mikro Task"
                width={36}
                height={36}
                className="rounded-lg transition-transform duration-300 group-hover:scale-110"
              />
              <span className={`text-xl font-bold transition-colors duration-300 ${scrolled ? 'text-[#042C71]' : 'text-white'
                }`}>
                MiTa
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`text-sm font-medium transition-all duration-300 hover:opacity-70 relative group ${scrolled ? 'text-gray-600' : 'text-white/90'
                    }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${scrolled ? 'bg-[#042C71]' : 'bg-white'
                    }`} />
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language Switcher */}
              <LanguageSwitcher variant="compact" isLanding={!scrolled} />
              <Link
                href="/login"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 btn-press ${scrolled
                  ? 'text-[#042C71] hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-[#CE4912] hover:bg-[#b84010] text-white text-sm font-medium rounded-lg transition-all duration-300 shine-effect btn-press"
              >
                {t('nav.register')}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-[#042C71]' : 'text-white'
                }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div
          className="absolute inset-0 bg-black/40 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className={`absolute top-0 right-0 bottom-0 w-72 bg-white shadow-xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Image
                  src="/icon.png"
                  alt="Mikro Task"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-lg font-bold text-[#042C71]">Mikro Task</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switcher (Mobile) */}
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-500 mb-2">{t('settings.language')}</p>
              <LanguageSwitcher />
            </div>

            <div className="space-y-1 mb-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="block px-3 py-2.5 text-gray-600 hover:text-[#042C71] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Link
                href="/login"
                className="block w-full px-4 py-2.5 text-center text-[#042C71] font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                className="block w-full px-4 py-2.5 text-center bg-[#CE4912] hover:bg-[#b84010] text-white font-medium rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.register')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
