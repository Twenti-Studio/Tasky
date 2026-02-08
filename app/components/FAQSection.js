'use client';

import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const FAQItem = ({ question, answer, isOpen, onClick, index }) => {
    return (
        <div
            className="border border-gray-100 rounded-xl overflow-hidden bg-white card-hover"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <button
                onClick={onClick}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
                <span className="font-medium text-gray-900 pr-4">{question}</span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#042C71]' : ''
                        }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                    {typeof answer === 'string' ? (
                        <p>{answer}</p>
                    ) : (
                        answer
                    )}
                </div>
            </div>
        </div>
    );
};

export default function FAQSection() {
    const { t, language } = useLanguage();
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = language === 'id' ? [
        {
            question: 'Apa itu MiTa?',
            answer: 'MiTa adalah platform partisipasi digital yang menyediakan berbagai aktivitas seperti survei dan tugas interaktif sederhana. Pengguna dapat berpartisipasi dalam aktivitas tersebut dan memperoleh poin sebagai bentuk apresiasi.'
        },
        {
            question: 'Jenis aktivitas apa saja yang tersedia di MiTa?',
            answer: (
                <div>
                    <p className="mb-2">Aktivitas di MiTa dapat berupa:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Survei online</li>
                        <li>Aktivitas feedback dan evaluasi</li>
                        <li>Tugas interaktif sederhana lainnya</li>
                    </ul>
                    <p className="mt-2 text-gray-500 text-xs">Jenis aktivitas dapat berubah sesuai ketersediaan dan kebutuhan mitra.</p>
                </div>
            )
        },
        {
            question: 'Bagaimana cara mendapatkan poin?',
            answer: (
                <div>
                    <p>Poin diperoleh dengan menyelesaikan aktivitas hingga tahap akhir sesuai instruksi.</p>
                    <p className="mt-2">Setiap aktivitas akan melalui proses verifikasi sebelum poin dikreditkan ke akun pengguna.</p>
                </div>
            )
        },
        {
            question: 'Mengapa poin saya belum langsung masuk?',
            answer: (
                <div>
                    <p className="mb-2">Beberapa aktivitas memerlukan waktu untuk proses verifikasi. Status aktivitas dapat berupa:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Pending:</strong> sedang dalam proses pemeriksaan</li>
                        <li><strong>Terverifikasi:</strong> poin telah dikreditkan</li>
                        <li><strong>Ditolak:</strong> aktivitas tidak memenuhi ketentuan</li>
                    </ul>
                    <p className="mt-2 text-gray-500 text-xs">Waktu verifikasi dapat berbeda tergantung jenis aktivitas.</p>
                </div>
            )
        },
        {
            question: 'Apakah semua aktivitas pasti mendapatkan poin?',
            answer: (
                <div>
                    <p className="mb-2">Tidak selalu. Poin hanya diberikan jika aktivitas:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Diselesaikan sesuai instruksi</li>
                        <li>Tidak melanggar ketentuan</li>
                        <li>Lolos proses verifikasi</li>
                    </ul>
                    <p className="mt-2 text-gray-500 text-xs">Hal ini dilakukan untuk menjaga keadilan bagi seluruh pengguna.</p>
                </div>
            )
        },
        {
            question: 'Bagaimana cara menggunakan poin yang saya miliki?',
            answer: 'Poin yang telah terverifikasi dapat digunakan sesuai dengan opsi penukaran yang tersedia di platform MiTa. Detail penukaran dapat dilihat di dashboard pengguna.'
        },
        {
            question: 'Apakah MiTa gratis digunakan?',
            answer: 'Ya. Pendaftaran dan penggunaan MiTa tidak dikenakan biaya.'
        },
        {
            question: 'Apakah data saya aman?',
            answer: 'MiTa menjaga privasi dan keamanan data pengguna sesuai dengan Kebijakan Privasi yang berlaku. Data hanya digunakan untuk keperluan operasional platform.'
        },
        {
            question: 'Bagaimana jika saya mengalami kendala?',
            answer: 'Pengguna dapat menghubungi tim MiTa melalui halaman Laporan di menu Pengaturan atau email resmi yang tersedia di website.'
        }
    ] : [
        {
            question: 'What is MiTa?',
            answer: 'MiTa is a digital participation platform that provides various activities such as surveys and simple interactive tasks. Users can participate in these activities and earn points as a form of appreciation.'
        },
        {
            question: 'What types of activities are available on MiTa?',
            answer: (
                <div>
                    <p className="mb-2">Activities on MiTa can include:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Online surveys</li>
                        <li>Feedback and evaluation activities</li>
                        <li>Other simple interactive tasks</li>
                    </ul>
                    <p className="mt-2 text-gray-500 text-xs">Types of activities may change based on availability and partner needs.</p>
                </div>
            )
        },
        {
            question: 'How do I earn points?',
            answer: (
                <div>
                    <p>Points are earned by completing activities to the final stage according to instructions.</p>
                    <p className="mt-2">Each activity will go through a verification process before points are credited to the user's account.</p>
                </div>
            )
        },
        {
            question: 'Why haven\'t my points been credited yet?',
            answer: (
                <div>
                    <p className="mb-2">Some activities require time for the verification process. Activity status can be:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Pending:</strong> under review</li>
                        <li><strong>Verified:</strong> points have been credited</li>
                        <li><strong>Rejected:</strong> activity does not meet requirements</li>
                    </ul>
                    <p className="mt-2 text-gray-500 text-xs">Verification time may vary depending on the type of activity.</p>
                </div>
            )
        },
        {
            question: 'Do all activities guarantee points?',
            answer: (
                <div>
                    <p className="mb-2">Not always. Points are only given if the activity:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Is completed according to instructions</li>
                        <li>Does not violate terms</li>
                        <li>Passes the verification process</li>
                    </ul>
                    <p className="mt-2 text-gray-500 text-xs">This is done to maintain fairness for all users.</p>
                </div>
            )
        },
        {
            question: 'How do I use the points I have?',
            answer: 'Verified points can be used according to the redemption options available on the MiTa platform. Redemption details can be viewed in the user dashboard.'
        },
        {
            question: 'Is MiTa free to use?',
            answer: 'Yes. Registration and use of MiTa is free of charge.'
        },
        {
            question: 'Is my data safe?',
            answer: 'MiTa maintains user data privacy and security in accordance with the applicable Privacy Policy. Data is only used for platform operational purposes.'
        },
        {
            question: 'What if I experience issues?',
            answer: 'Users can contact the MiTa team through the Reports page in Settings or the official email available on the website.'
        }
    ];

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section id="faq" className="py-16 px-4 bg-gray-50">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-[#042C71]/10 rounded-xl mb-4">
                        <HelpCircle className="w-6 h-6 text-[#042C71]" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        {t('landing.faqTitle')}
                    </h2>
                    <p className="text-gray-500">
                        {t('landing.faqSubtitle')}
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            index={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        {t('landing.faqStillHaveQuestions')}{' '}
                        <a href="/settings" className="text-[#042C71] hover:underline font-medium">
                            {t('landing.faqContactUs')}
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
