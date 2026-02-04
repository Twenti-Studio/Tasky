'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  const verifyEmail = async (token) => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email berhasil diverifikasi!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Verifikasi gagal');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Terjadi kesalahan saat verifikasi email');
    }
  };

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      const timeoutId = setTimeout(() => {
        verifyEmail(token);
      }, 0);
      return () => clearTimeout(timeoutId);
    } else {
      const timeoutId = setTimeout(() => {
        setStatus('error');
        setMessage('Token verifikasi tidak ditemukan');
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#042C71] to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#042C71] mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Memverifikasi Email...
            </h2>
            <p className="text-gray-600">Mohon tunggu sebentar</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifikasi Berhasil!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-[#042C71] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#031f4d] transition"
            >
              Masuk Sekarang
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifikasi Gagal
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-[#042C71] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#031f4d] transition"
            >
              Kembali ke Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#042C71] to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#042C71] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Memuat...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}


// NEXT TASK
// Add this env to railway
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_SECURE=false
// SMTP_USER=your-email@gmail.com
// SMTP_PASS=your-app-password
// SMTP_FROM=Mita <noreply@mita.app>