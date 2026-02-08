'use client';

import { ClipboardList, Wallet, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const FeatureCard = ({ icon: Icon, title, description, index }) => {
  return (
    <div
      className="p-6 rounded-xl border border-gray-100 bg-white card-hover group"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#042C71] transition-colors duration-300">
        <Icon className="w-6 h-6 text-[#042C71] group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default function FeatureSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: ClipboardList,
      title: t('landing.featureSurveyTitle'),
      description: t('landing.featureSurveyDesc')
    },
    {
      icon: Wallet,
      title: t('landing.featureWithdrawTitle'),
      description: t('landing.featureWithdrawDesc')
    },
    {
      icon: Zap,
      title: t('landing.featureDailyTitle'),
      description: t('landing.featureDailyDesc')
    }
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{t('landing.featuresTitle')}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t('landing.featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} index={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
