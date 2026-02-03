'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

// Eye icons for password visibility toggle
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    bankMethod: 'dana',
    bankAccountNumber: '',
    bankAccountName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Kata sandi tidak sama');
      return;
    }

    if (formData.password.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }

    if (!formData.bankAccountNumber || !formData.bankAccountName) {
      setError('Data rekening/e-wallet harus diisi');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('Silakan masuk dengan akun yang baru dibuat.', {
        title: '✅ Pendaftaran Berhasil!',
        duration: 5000,
      });
      router.push('/login');
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042C71] focus:border-transparent outline-none transition bg-white text-gray-900 placeholder-gray-400";

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#042C71] to-blue-900 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/icon.png" 
              alt="Mita" 
              width={48} 
              height={48}
              className="rounded-xl"
            />
            <span className="text-white text-2xl font-bold">Mita</span>
          </Link>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Mulai Perjalananmu<br />Bersama Mita
          </h1>
          <p className="text-blue-200 text-lg">
            Daftar sekarang dan dapatkan penghasilan tambahan dari tugas-tugas sederhana.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-white text-sm font-medium">A</div>
              <div className="w-10 h-10 rounded-full bg-green-400 border-2 border-white flex items-center justify-center text-white text-sm font-medium">B</div>
              <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-white text-sm font-medium">C</div>
            </div>
            <p className="text-blue-200 text-sm">1.200+ pengguna sudah bergabung</p>
          </div>
        </div>

        <p className="text-blue-300 text-sm">© 2025 Twenti Studio</p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image 
                src="/icon.png" 
                alt="Mita" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <span className="text-[#042C71] text-xl font-bold">Mita</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h2>
              <p className="text-gray-600 mt-1">Isi data dibawah untuk mendaftar</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputStyles}
                  placeholder="email@contoh.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={inputStyles}
                  placeholder="Pilih username"
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-gray-400">(opsional)</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputStyles}
                  placeholder="Nama lengkap kamu"
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`${inputStyles} pr-12`}
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`${inputStyles} pr-12`}
                    placeholder="Ulangi kata sandi"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Bank Account Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Data Penarikan
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Data ini diperlukan untuk proses penarikan saldo. Pastikan data yang Anda masukkan benar.
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="bankMethod" className="block text-sm font-medium text-gray-700 mb-1">
                      Metode Penarikan
                    </label>
                    <select
                      id="bankMethod"
                      name="bankMethod"
                      value={formData.bankMethod}
                      onChange={handleChange}
                      required
                      className={inputStyles}
                    >
                      <option value="dana">DANA</option>
                      <option value="gopay">GoPay</option>
                      <option value="ovo">OVO</option>
                      <option value="shopeepay">ShopeePay</option>
                      <option value="linkaja">LinkAja</option>
                      <option value="bank">Transfer Bank</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Rekening/HP
                    </label>
                    <input
                      type="text"
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      required
                      className={inputStyles}
                      placeholder={formData.bankMethod === 'bank' ? 'Nomor rekening' : 'Nomor HP'}
                    />
                  </div>

                  <div>
                    <label htmlFor="bankAccountName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Pemilik Akun
                    </label>
                    <input
                      type="text"
                      id="bankAccountName"
                      name="bankAccountName"
                      value={formData.bankAccountName}
                      onChange={handleChange}
                      required
                      className={inputStyles}
                      placeholder="Sesuai dengan akun e-wallet/bank"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#CE4912] text-white py-3 rounded-lg font-semibold hover:bg-[#b84010] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Membuat akun...' : 'Daftar Sekarang'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-[#042C71] font-semibold hover:underline">
                  Masuk disini
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
