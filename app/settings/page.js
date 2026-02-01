'use client';

import { CheckCircle, Lock, Save, User, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Profile form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Bank account form
    const [bankMethod, setBankMethod] = useState('dana');
    const [bankAccountNumber, setBankAccountNumber] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.isAdmin) {
                router.push('/admin/settings');
            } else {
                // Initialize form with user data
                setName(user.name || '');
                setEmail(user.email || '');
                setBankMethod(user.bankMethod || 'dana');
                setBankAccountNumber(user.bankAccountNumber || '');
                setBankAccountName(user.bankAccountName || '');
            }
        }
    }, [user, authLoading, router]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.updateProfile({ name, email });
            await refreshUser();
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleBankAccountUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.updateBankAccount({
                bankMethod,
                bankAccountNumber,
                bankAccountName
            });
            await refreshUser();
            setSuccess('Bank account details saved successfully!');
        } catch (err) {
            setError(err.message || 'Failed to update bank account');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.changePassword(currentPassword, newPassword);
            setSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#042C71]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-800">Settings</h1>
                    <p className="text-sm text-gray-500">Manage your account settings</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'profile'
                            ? 'bg-[#042C71] text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-[#042C71]'
                            }`}
                    >
                        <User size={18} />
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('bank')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'bank'
                            ? 'bg-[#042C71] text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-[#042C71]'
                            }`}
                    >
                        <Wallet size={18} />
                        Bank Account
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'password'
                            ? 'bg-[#042C71] text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-[#042C71]'
                            }`}
                    >
                        <Lock size={18} />
                        Password
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
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={user?.username || ''}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-[#042C71] text-white rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Bank Account Tab */}
                {activeTab === 'bank' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Bank Account Details</h2>
                        <p className="text-sm text-gray-500 mb-4">Add your bank account for withdrawals</p>

                        <form onSubmit={handleBankAccountUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method *
                                </label>
                                <select
                                    value={bankMethod}
                                    onChange={(e) => setBankMethod(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71] bg-white text-gray-900"
                                >
                                    <option value="dana">DANA</option>
                                    <option value="gopay">GoPay</option>
                                    <option value="ovo">OVO</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {bankMethod === 'dana' || bankMethod === 'gopay' || bankMethod === 'ovo'
                                        ? 'Phone Number *'
                                        : 'Account Number *'}
                                </label>
                                <input
                                    type="text"
                                    value={bankAccountNumber}
                                    onChange={(e) => setBankAccountNumber(e.target.value)}
                                    placeholder={bankMethod === 'dana' ? '08xxxxxxxxxx' : 'Account number'}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71] bg-white text-gray-900"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {bankMethod === 'dana' && 'Enter your DANA registered phone number'}
                                    {bankMethod === 'gopay' && 'Enter your GoPay registered phone number'}
                                    {bankMethod === 'ovo' && 'Enter your OVO registered phone number'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Account Holder Name *
                                </label>
                                <input
                                    type="text"
                                    value={bankAccountName}
                                    onChange={(e) => setBankAccountName(e.target.value)}
                                    placeholder="Name as registered"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71] bg-white text-gray-900"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Must match the name registered on your {bankMethod.toUpperCase()} account
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-700">
                                    <strong>Important:</strong> Make sure your account details are correct. Withdrawals will be processed to this account.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-[#042C71] text-white rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Bank Account'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
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
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
