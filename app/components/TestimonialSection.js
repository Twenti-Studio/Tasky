'use client';

import { Star } from 'lucide-react';

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
  const testimonials = [
    {
      name: 'Budi Santoso',
      role: 'Mahasiswa',
      content: 'Platform yang bagus untuk mengisi waktu luang. Bisa dapat penghasilan tambahan dengan tugas-tugas yang simpel.',
      rating: 5
    },
    {
      name: 'Siti Rahayu',
      role: 'Ibu Rumah Tangga',
      content: 'Pencairan cepat dan mudah ke e-wallet. Sangat membantu untuk tambahan uang belanja bulanan.',
      rating: 5
    },
    {
      name: 'Ahmad Rizki',
      role: 'Karyawan',
      content: 'Cocok untuk penghasilan sampingan. Tugasnya tidak ribet dan hasilnya lumayan untuk tambahan.',
      rating: 4
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Kata Pengguna
          </h2>
          <p className="text-gray-500">
            Pengalaman pengguna yang sudah bergabung dengan Mikro Task
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
