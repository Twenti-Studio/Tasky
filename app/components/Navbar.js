'use client';

import { AlertCircle, Briefcase, History, Home, LogOut, Menu, Settings, Shield, User, Wallet, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Don't show navbar on landing, login, register, or admin pages
  // Admin pages have their own layout with sidebar
  if (!user || pathname === '/' || pathname === '/login' || pathname === '/register' || pathname?.startsWith('/admin')) {
    return null;
  }

  const formatPoints = (points) => {
    return new Intl.NumberFormat('id-ID').format(Math.floor(points || 0));
  };

  // Different navigation for admin vs regular users
  const navLinks = user?.isAdmin
    ? [
      // Admin only sees admin panel
      { href: '/admin', label: 'Dashboard', icon: Shield },
      { href: '/admin/users', label: 'Users', icon: User },
      { href: '/admin/withdrawals', label: 'Payouts', icon: Wallet },
      { href: '/admin/reports', label: 'Laporan', icon: AlertCircle },
    ]
    : [
      // Regular users see earning features
      { href: '/dashboard', label: 'Home', icon: Home },
      { href: '/tasks', label: 'Earn', icon: Briefcase },
      { href: '/withdraw', label: 'Withdraw', icon: Wallet },
      { href: '/history', label: 'History', icon: History },
      { href: '/reports', label: 'Laporan', icon: AlertCircle },
      { href: '/settings', label: 'Settings', icon: Settings },
    ];

  const isActive = (href) => pathname === href;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="MiTa Logo"
              width={32}
              height={32}
              className="rounded-lg"
              style={{ width: 'auto', height: 'auto' }}
            />
            <span className="text-lg font-bold text-[#042C71] hidden sm:block">MiTa</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive(link.href)
                    ? 'bg-[#042C71] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Points & User */}
          <div className="flex items-center gap-3">
            {/* Points Badge */}
            <div className="bg-gradient-to-r from-[#042C71] to-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
              {formatPoints(user?.balance || 0)} pts
            </div>

            {/* User Menu (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="p-4 space-y-2">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
              <div className="w-10 h-10 bg-[#042C71] rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{user?.username}</p>
                <p className="text-xs text-gray-500">{formatPoints(user?.balance || 0)} points</p>
              </div>
            </div>

            {/* Navigation Links */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(link.href)
                    ? 'bg-[#042C71] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}

            {/* Logout */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition mt-4"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
