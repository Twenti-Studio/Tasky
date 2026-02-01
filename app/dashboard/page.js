'use client';

import { ArrowRight, Clock, Coins, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ totalEarned: 0, tasksCompleted: 0 });
  const [recentEarnings, setRecentEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.isAdmin) {
        router.push('/admin');
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [profileData, earningsData] = await Promise.all([
        api.getProfile(),
        api.getEarnings(),
      ]);
      setStats({
        totalEarned: earningsData.total || 0,
        tasksCompleted: profileData.user._count?.earnings || 0,
      });
      setRecentEarnings(earningsData.earnings?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPoints = (points) => {
    return new Intl.NumberFormat('id-ID').format(Math.floor(points || 0));
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#042C71]"></div>
      </div>
    );
  }

  const canWithdraw = (user?.balance || 0) >= 5000;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Hi, {user?.username}!</h1>
          <p className="text-sm text-gray-500">Welcome back to Mita</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#042C71] to-blue-600 rounded-2xl p-6 text-white mb-6">
          <p className="text-sm opacity-80 mb-1">Your Balance</p>
          <p className="text-4xl font-bold mb-4">{formatPoints(user?.balance || 0)}</p>
          <p className="text-sm opacity-80">points</p>

          {canWithdraw ? (
            <Link
              href="/withdraw"
              className="mt-4 inline-flex items-center gap-2 bg-white text-[#042C71] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
            >
              Withdraw Now
              <ArrowRight size={16} />
            </Link>
          ) : (
            <p className="mt-4 text-sm opacity-70">
              {formatPoints(5000 - (user?.balance || 0))} more points to withdraw
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/tasks"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#042C71] hover:shadow-md transition"
          >
            <div className="w-10 h-10 bg-[#CE4912]/10 rounded-lg flex items-center justify-center mb-3">
              <Coins className="text-[#CE4912]" size={20} />
            </div>
            <p className="font-semibold text-gray-800">Earn Points</p>
            <p className="text-xs text-gray-500 mt-1">Complete tasks</p>
          </Link>

          <Link
            href="/withdraw"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#042C71] hover:shadow-md transition"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <p className="font-semibold text-gray-800">Withdraw</p>
            <p className="text-xs text-gray-500 mt-1">Cash out points</p>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-[#042C71]">{formatPoints(stats.totalEarned)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Earned</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-[#CE4912]">{stats.tasksCompleted}</p>
            <p className="text-xs text-gray-500 mt-1">Tasks Done</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
            <Link href="/history" className="text-sm text-[#042C71] hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentEarnings.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No activity yet</p>
              <Link
                href="/tasks"
                className="text-[#042C71] text-sm hover:underline mt-2 inline-block"
              >
                Start earning now →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEarnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{earning.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(earning.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-600">+{formatPoints(earning.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
