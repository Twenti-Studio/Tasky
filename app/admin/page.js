'use client';

import {
    Clock,
    CreditCard,
    TrendingUp,
    UserCheck,
    Users,
    UserX
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await api.getAdminStats();
            setStats(data.stats);
            setRecentUsers(data.recentUsers);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num || 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#042C71]"></div>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            label: 'Active Users',
            value: stats?.activeUsers || 0,
            icon: UserCheck,
            color: 'bg-green-500',
        },
        {
            label: 'Inactive Users',
            value: stats?.inactiveUsers || 0,
            icon: UserX,
            color: 'bg-red-500',
        },
        {
            label: 'Pending Withdrawals',
            value: stats?.pendingWithdrawals || 0,
            icon: Clock,
            color: 'bg-orange-500',
            hasNotification: (stats?.pendingWithdrawals || 0) > 0,
            notificationText: 'Needs attention!'
        },
        {
            label: 'Total Withdrawals',
            value: stats?.totalWithdrawals || 0,
            icon: CreditCard,
            color: 'bg-purple-500',
        },
        {
            label: 'Total Points Earned',
            value: formatNumber(stats?.totalEarnings || 0),
            icon: TrendingUp,
            color: 'bg-teal-500',
        },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 relative">
                            {stat.hasNotification && (
                                <div className="absolute top-2 right-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                    <Icon className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    {stat.hasNotification && (
                                        <p className="text-xs text-orange-600 font-medium mt-1">{stat.notificationText}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Username</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Balance</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map((user) => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <span className="font-medium text-gray-800">{user.username}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-gray-600">{formatNumber(user.balance)} pts</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-gray-500 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString('id-ID')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
