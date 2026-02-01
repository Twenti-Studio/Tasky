'use client';

import {
    CheckCircle,
    Clock,
    Loader,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchWithdrawals();
    }, [filter]);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminWithdrawals(filter);
            setWithdrawals(data.withdrawals);
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (withdrawalId, newStatus) => {
        setProcessing(true);
        try {
            await api.updateWithdrawalStatus(withdrawalId, newStatus, adminNote);
            await fetchWithdrawals();
            setModalOpen(false);
            setSelectedWithdrawal(null);
            setAdminNote('');
            alert(`Withdrawal ${newStatus} successfully!`);
        } catch (error) {
            console.error('Failed to update withdrawal:', error);
            alert(error.message || 'Failed to update withdrawal');
        } finally {
            setProcessing(false);
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num || 0);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            approved: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
            processing: { color: 'bg-purple-100 text-purple-700', icon: Loader },
            completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon size={12} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'approved', label: 'Approved' },
        { id: 'processing', label: 'Processing' },
        { id: 'completed', label: 'Completed' },
        { id: 'rejected', label: 'Rejected' },
    ];

    if (loading && withdrawals.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#042C71]"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Withdrawal Management</h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-lg font-bold text-gray-800">{stat._count}</p>
                        <p className="text-xs text-gray-500">{stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}</p>
                        <p className="text-sm text-[#042C71] font-medium">{formatNumber(stat._sum?.amount || 0)} pts</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filter === f.id
                                ? 'bg-[#042C71] text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#042C71]'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Withdrawals Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">User</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Amount</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">DANA Account</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Requested</th>
                                <th className="text-right py-4 px-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        No withdrawals found
                                    </td>
                                </tr>
                            ) : (
                                withdrawals.map((withdrawal) => (
                                    <tr key={withdrawal.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="font-medium text-gray-800">{withdrawal.user?.username}</p>
                                                <p className="text-sm text-gray-500">{withdrawal.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-bold text-[#042C71]">{formatNumber(withdrawal.amount)} pts</span>
                                            <p className="text-xs text-gray-500">Rp {formatNumber(withdrawal.amount)}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-medium text-gray-800">{withdrawal.accountNumber}</p>
                                            <p className="text-sm text-gray-500">{withdrawal.accountName}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            {getStatusBadge(withdrawal.status)}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-gray-500">{formatDate(withdrawal.createdAt)}</span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {withdrawal.status === 'pending' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedWithdrawal(withdrawal);
                                                            setModalOpen(true);
                                                        }}
                                                        className="px-3 py-1 bg-[#042C71] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition"
                                                    >
                                                        Process
                                                    </button>
                                                </div>
                                            )}
                                            {withdrawal.status === 'approved' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(withdrawal.id, 'completed')}
                                                    disabled={processing}
                                                    className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition disabled:opacity-50"
                                                >
                                                    Mark Transferred
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Process Modal */}
            {modalOpen && selectedWithdrawal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Process Withdrawal</h2>

                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="text-xl font-bold text-[#042C71]">{formatNumber(selectedWithdrawal.amount)} pts</p>
                            <p className="text-sm text-gray-500 mt-2">DANA: {selectedWithdrawal.accountNumber}</p>
                            <p className="text-sm text-gray-500">Name: {selectedWithdrawal.accountName}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (Optional)</label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Add a note..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71] resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleStatusUpdate(selectedWithdrawal.id, 'approved')}
                                disabled={processing}
                                className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(selectedWithdrawal.id, 'rejected')}
                                disabled={processing}
                                className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50"
                            >
                                Reject
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setModalOpen(false);
                                setSelectedWithdrawal(null);
                                setAdminNote('');
                            }}
                            className="w-full mt-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
