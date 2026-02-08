'use client';

import { CheckCircle, Globe, Lock, Save, User } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';

export default function AdminSettingsPage() {
    const { user, refreshUser } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Profile form
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.updateProfile({ name, email });
            await refreshUser();
            setSuccess(t('settings.profileUpdated'));
        } catch (err) {
            setError(err.message || t('settings.profileUpdateFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError(t('settings.passwordsDoNotMatch'));
            return;
        }

        if (newPassword.length < 6) {
            setError(t('settings.passwordTooShort'));
            return;
        }

        setLoading(true);

        try {
            await api.changePassword(currentPassword, newPassword);
            setSuccess(t('settings.passwordChanged'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || t('settings.passwordChangeFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('settings.title')}</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'profile'
                        ? 'bg-[#042C71] text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#042C71]'
                        }`}
                >
                    <User size={18} />
                    {t('settings.profile')}
                </button>
                <button
                    onClick={() => setActiveTab('password')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'password'
                        ? 'bg-[#042C71] text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#042C71]'
                        }`}
                >
                    <Lock size={18} />
                    {t('settings.password')}
                </button>
                <button
                    onClick={() => setActiveTab('language')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'language'
                        ? 'bg-[#042C71] text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#042C71]'
                        }`}
                >
                    <Globe size={18} />
                    {t('settings.language')}
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                    <CheckCircle size={20} />
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('settings.profileInfo')}</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.username')}</label>
                            <input
                                type="text"
                                value={user?.username || ''}
                                disabled
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">{t('settings.usernameCannotChange')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.fullName')}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('settings.fullNamePlaceholder')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('settings.emailPlaceholder')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-[#042C71] text-white rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? t('settings.saving') : t('settings.saveChanges')}
                        </button>
                    </form>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('settings.changePassword')}</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.currentPassword')}</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder={t('settings.currentPasswordPlaceholder')}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.newPassword')}</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder={t('settings.newPasswordPlaceholder')}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.confirmNewPassword')}</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t('settings.confirmNewPasswordPlaceholder')}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-[#042C71] text-white rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50"
                        >
                            <Lock size={18} />
                            {loading ? t('settings.changing') : t('settings.changePassword')}
                        </button>
                    </form>
                </div>
            )}

            {/* Language Tab */}
            {activeTab === 'language' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('settings.selectLanguage')}</h2>
                    <p className="text-gray-500 text-sm mb-4">{t('settings.languageDescription') || 'Choose your preferred language for the application interface.'}</p>
                    <div className="max-w-md">
                        <LanguageSwitcher />
                    </div>
                </div>
            )}
        </div>
    );
}
