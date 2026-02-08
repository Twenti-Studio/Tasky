'use client';

import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [earnings, setEarnings] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('earnings');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.isAdmin) {
        router.push('/admin');
      } else {
        fetchHistory();
      }
    }
  }, [user, authLoading, router]);

  const fetchHistory = async () => {
    try {
      const [earningsData, withdrawalsData] = await Promise.all([
        api.getEarnings(),
        api.getWithdrawals().catch(() => ({ withdrawals: [] })),
      ]);
      setEarnings(earningsData.earnings || []);
      setWithdrawals(withdrawalsData.withdrawals || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPoints = (points) => {
    return new Intl.NumberFormat('id-ID').format(Math.floor(points || 0));
  };

  const formatDate = (date) => {
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: t('history.statusCompleted'),
      pending: t('history.statusPending'),
      processing: t('history.statusProcessing'),
      rejected: t('history.statusRejected'),
    };
    return labels[status] || status;
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
          <h1 className="text-xl font-bold text-gray-800">{t('history.title')}</h1>
          <p className="text-sm text-gray-500">{t('history.subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'earnings'
              ? 'bg-[#042C71] text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {t('history.earnings')}
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'withdrawals'
              ? 'bg-[#042C71] text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {t('history.withdrawals')}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : activeTab === 'earnings' ? (
          earnings.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('history.noEarnings')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('history.startEarning')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {earnings.map((earning) => (
                <div
                  key={earning.id}
                  className="bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <ArrowDownLeft className="text-green-600" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{earning.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(earning.createdAt)}</p>
                        <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {earning.source}
                        </span>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-600">+{formatPoints(earning.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : withdrawals.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('history.noWithdrawals')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('history.withdrawalHistoryAppear')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="text-orange-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{t('history.withdrawalTo')} {withdrawal.method}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(withdrawal.createdAt)}</p>
                      <p className="text-xs text-gray-500">{withdrawal.accountNumber}</p>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${getStatusColor(withdrawal.status)}`}>
                        {getStatusLabel(withdrawal.status)}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-orange-600">-{formatPoints(withdrawal.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
