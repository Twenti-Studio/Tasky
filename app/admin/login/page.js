'use client';

import { ArrowLeft, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
    const router = useRouter();
    const { user, login, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // If already logged in as admin, go to admin panel
    useEffect(() => {
        if (!authLoading && user?.isAdmin) {
            router.push('/admin');
        }
    }, [user, authLoading, router]);

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
        setLoading(true);

        try {
            const result = await login(formData);
            if (result.user?.isAdmin) {
                router.push('/admin');
            } else {
                setError('Access denied. You do not have admin privileges.');
                // Optionally log them out if they aren't admin but tried to login here
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-[#042C71] p-8 text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                            <Shield className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">MiTa Admin</h1>
                        <p className="text-blue-100 text-sm mt-1">Authorized Personnel Only</p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Admin Username / Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="emailOrUsername"
                                        value={formData.emailOrUsername}
                                        onChange={handleChange}
                                        required
                                        placeholder="admin@mita.com"
                                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#042C71] focus:border-transparent outline-none transition text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#042C71] focus:border-transparent outline-none transition text-gray-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#042C71] text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Login to Secure Area
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <Link href="/login" className="text-sm text-gray-500 hover:text-[#042C71] flex items-center justify-center gap-2">
                                <ArrowLeft size={16} />
                                Back to User Login
                            </Link>
                        </div>
                    </div>
                </div>
                <p className="text-center text-gray-500 text-xs mt-6">
                    &copy; 2026 Twenti Studio. All rights reserved.
                </p>
            </div>
        </div>
    );
}
