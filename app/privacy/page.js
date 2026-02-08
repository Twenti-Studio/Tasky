'use client';

import { ArrowLeft, CheckCircle, Cookie, Database, Eye, Lock, RefreshCw, Shield } from 'lucide-react';
import Link from "next/link";
import LandingNavbar from "../components/LandingNavbar";
import { useLanguage } from "../context/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Database,
      title: t('privacy.section1Title'),
      content: (
        <div>
          <p className="mb-3 text-gray-600">{t('privacy.section1Desc')}</p>
          <ul className="space-y-2">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t(`privacy.section1Item${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      icon: Eye,
      title: t('privacy.section2Title'),
      content: (
        <div>
          <p className="mb-3 text-gray-600">{t('privacy.section2Desc1')}</p>
          <ul className="space-y-2 mb-4">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t(`privacy.section2Item${i}`)}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium text-[#042C71] p-3 bg-blue-50 rounded-lg border border-blue-100">
            {t('privacy.section2Desc2')}
          </p>
        </div>
      )
    },
    {
      icon: Lock,
      title: t('privacy.section3Title'),
      content: <p className="text-gray-600 leading-relaxed">{t('privacy.section3Desc')}</p>
    },
    {
      icon: Cookie,
      title: t('privacy.section4Title'),
      content: <p className="text-gray-600 leading-relaxed">{t('privacy.section4Desc')}</p>
    },
    {
      icon: RefreshCw,
      title: t('privacy.section5Title'),
      content: <p className="text-gray-600 leading-relaxed">{t('privacy.section5Desc')}</p>
    },
    {
      icon: CheckCircle,
      title: t('privacy.section6Title'),
      content: <p className="text-gray-600 leading-relaxed">{t('privacy.section6Desc')}</p>
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar Integration */}
      <LandingNavbar isStatic={true} />

      {/* Hero Section */}
      <section className="hero-gradient-bg text-white pt-28 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-blob" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {t('privacy.title')}
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('privacy.intro')}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <main className="flex-grow py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 card-hover"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#042C71]">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-blue max-w-none text-gray-600">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Card */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('landing.faqStillHaveQuestions')}</h3>
            <p className="text-gray-600 mb-6">twentistudio@gmail.com</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#042C71] text-white rounded-lg font-semibold hover:bg-blue-800 transition-all btn-press"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
