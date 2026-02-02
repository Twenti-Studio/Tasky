'use client';

import {
    ChevronLeft,
    ChevronRight,
    Search,
    UserCheck,
    UserX
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import { api } from '../../lib/api';

export default function AdminUsersPage() {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminUsers(pagination.page, 20);
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        // For now, client-side search
        // TODO: Implement server-side search
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await api.updateUserStatus(userId, !currentStatus);
            setUsers(users.map(u =>
                u.id === userId ? { ...u, isActive: !currentStatus } : u
            ));

            if (currentStatus) {
                toast.warning('User has been deactivated', {
                    title: 'User Deactivated',
                });
            } else {
                toast.success('User has been activated', {
                    title: 'User Activated',
                });
            }
        } catch (error) {
            console.error('Failed to update user status:', error);
            toast.error(error.message || 'Failed to update user status', {
                title: 'Update Failed',
            });
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num || 0);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#042C71]"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#042C71] w-64"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">User</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Balance</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Tasks</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Joined</th>
                                <th className="text-right py-4 px-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div>
                                            <p className="font-medium text-gray-800">{user.username}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="font-semibold text-[#042C71]">{formatNumber(user.balance)} pts</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-gray-600">{user._count?.earnings || 0}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {user.isActive ? (
                                                <>
                                                    <UserCheck size={12} />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <UserX size={12} />
                                                    Inactive
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${user.isActive
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                            disabled={pagination.page <= 1}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
