'use client';

import {
    ChevronRight,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Users,
    X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingWithdrawals, setPendingWithdrawals] = useState(0);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (!loading && user && !user.isAdmin) {
            router.push('/dashboard');
        } else if (user?.isAdmin) {
            const fetchPendingCount = async () => {
                try {
                    const data = await api.getAdminStats();
                    setPendingWithdrawals(data.stats?.pendingWithdrawals || 0);
                } catch (error) {
                    console.error('Failed to fetch pending withdrawals:', error);
                }
            };

            // Fetch pending withdrawals count
            fetchPendingCount();
            // Refresh every 30 seconds
            const interval = setInterval(fetchPendingCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#042C71]"></div>
            </div>
        );
    }

    if (!user?.isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You don't have admin privileges.</p>
                    <Link href="/dashboard" className="text-[#042C71] hover:underline mt-4 inline-block">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Users', icon: Users },
        {
            href: '/admin/withdrawals',
            label: 'Withdrawals',
            icon: CreditCard,
            badge: pendingWithdrawals > 0 ? pendingWithdrawals : null
        },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#042C71] transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-between p-4 border-b border-blue-800">
                    <h1 className="text-xl font-bold text-white">MiTa Admin</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                                {isActive && !item.badge && <ChevronRight size={16} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-600"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
                        <div className="w-8 h-8 bg-[#042C71] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
