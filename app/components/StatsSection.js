'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const StatCard = ({ end, label, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsVisible(true);
          hasAnimated.current = true;
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      setCount(Math.floor(percentage * end));

      if (percentage < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return (
    <div ref={cardRef} className="text-center group">
      <div className={`text-3xl md:text-4xl font-bold text-[#042C71] mb-1 transition-transform duration-300 group-hover:scale-110 ${isVisible ? 'animate-count' : 'opacity-0'}`}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-500 text-sm">
        {label}
      </div>
    </div>
  );
};

export default function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    { end: 100, label: t('landing.statsActiveUsers'), suffix: '+' },
    { end: 1000, label: t('landing.statsTasksCompleted'), suffix: '+' },
    { end: 95, label: t('landing.statsSatisfaction'), suffix: '%' }
  ];

  return (
    <section className="py-12 px-4 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
