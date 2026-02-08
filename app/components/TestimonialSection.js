'use client';

import { Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TestimonialCard = ({ name, role, content, rating, index }) => {
  return (
    <div
      className="bg-white p-6 rounded-xl border border-gray-100 card-hover"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex gap-0.5 mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 hover:scale-125 transition-transform" />
        ))}
      </div>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        &quot;{content}&quot;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#042C71] flex items-center justify-center text-white font-medium group-hover:scale-110 transition-transform">
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-gray-900 text-sm">{name}</div>
          <div className="text-xs text-gray-400">{role}</div>
        </div>
      </div>
    </div>
  );
};

export default function TestimonialSection() {
  const { t, language } = useLanguage();

  const testimonials = language === 'id' ? [
    {
      name: 'Budi S.',
      role: 'Pengguna Aktif',
      content: 'Platform ini membantu saya berpartisipasi dalam survei dan aktivitas respons yang jelas dan mudah.',
      rating: 5
    },
    {
      name: 'Siti R.',
      role: 'Pengguna Aktif',
      content: 'Poin masuk setelah verifikasi dan penukaran mudah dilakukan.',
      rating: 5
    },
    {
      name: 'Ahmad R.',
      role: 'Pengguna Aktif',
      content: 'Cocok untuk mengisi waktu sambil berkontribusi pada riset digital.',
      rating: 4
    }
  ] : [
    {
      name: 'Budi S.',
      role: 'Active User',
      content: 'This platform helps me participate in surveys and response activities that are clear and easy.',
      rating: 5
    },
    {
      name: 'Siti R.',
      role: 'Active User',
      content: 'Points are credited after verification and redemption is easy to do.',
      rating: 5
    },
    {
      name: 'Ahmad R.',
      role: 'Active User',
      content: 'Great for filling time while contributing to digital research.',
      rating: 4
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {t('landing.testimonialsTitle')}
          </h2>
          <p className="text-gray-500">
            {t('landing.testimonialsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} index={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
