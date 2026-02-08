'use client';

import { AlertCircle, Calendar, CheckCircle, Info, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

export default function WithdrawPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [bankMethod, setBankMethod] = useState('dana'); // Default to DANA
  const [danaNumber, setDanaNumber] = useState('');
  const [danaName, setDanaName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.isAdmin) {
        router.push('/admin');
      }
    }
  }, [user, authLoading, router]);

  const formatPoints = (points) => {
    return new Intl.NumberFormat('id-ID').format(Math.floor(points || 0));
  };

  const quickAmounts = [5000, 10000, 25000, 50000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const withdrawAmount = parseInt(amount);

    if (!withdrawAmount || withdrawAmount < 5000) {
      setError(t('withdraw.minimumError'));
      return;
    }

    if (withdrawAmount > (user?.balance || 0)) {
      setError(t('withdraw.insufficientBalance'));
      return;
    }

    if (!danaNumber) {
      setError(t('withdraw.enterDanaNumber'));
      return;
    }

    if (!danaName) {
      setError(t('withdraw.enterDanaName'));
      return;
    }

    // Validate phone number format
    if (!/^(08|628)[0-9]{8,12}$/.test(danaNumber.replace(/\s/g, ''))) {
      setError(t('withdraw.invalidPhoneNumber'));
      return;
    }

    setLoading(true);

    try {
      await api.requestWithdrawal(withdrawAmount, bankMethod, danaNumber, danaName);
      setSuccess(true);
      setAmount('');
      setDanaNumber('');
      setDanaName('');
      await refreshUser();
    } catch (err) {
      setError(err.message || t('withdraw.withdrawalFailed'));
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

  const canWithdraw = (user?.balance || 0) >= 5000;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">{t('withdraw.title')}</h1>
          <p className="text-sm text-gray-500">{t('withdraw.subtitle')}</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('withdraw.availableBalance')}</p>
              <p className="text-2xl font-bold text-[#042C71]">{formatPoints(user?.balance || 0)} <span className="text-lg font-normal">{t('common.pts')}</span></p>
            </div>
            <div className="w-12 h-12 bg-[#042C71]/10 rounded-full flex items-center justify-center">
              <Wallet className="text-[#042C71]" size={24} />
            </div>
          </div>
        </div>

        {/* Conversion Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex gap-3">
            <Info className="text-blue-600 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">{t('withdraw.conversionRate')}</p>
              <p>{t('withdraw.conversionInfo')}</p>
              <p className="mt-1">{t('withdraw.minimumWithdrawal')}</p>
            </div>
          </div>
        </div>

        {/* Processing Schedule Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <Calendar className="text-amber-600 flex-shrink-0" size={20} />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">{t('withdraw.withdrawalSchedule')}</p>
              <p>{t('withdraw.scheduleInfo')}</p>
              <p className="mt-1 text-xs">{t('withdraw.scheduleNote')}</p>
            </div>
          </div>
        </div>

        {!canWithdraw ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-orange-900">{t('withdraw.notEnoughPoints')}</p>
                <p className="text-sm text-orange-700 mt-1">
                  {t('withdraw.needMorePoints', { amount: formatPoints(5000 - (user?.balance || 0)) })}
                </p>
              </div>
            </div>
          </div>
        ) : success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="text-green-600 mx-auto mb-3" size={48} />
            <h3 className="font-semibold text-green-900 mb-2">{t('withdraw.withdrawalRequested')}</h3>
            <p className="text-sm text-green-700">
              {t('withdraw.withdrawalSuccess')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Amount */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('withdraw.withdrawAmount')}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('withdraw.enterPoints')}
                min="5000"
                max={user?.balance || 0}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71] bg-white text-gray-900"
              />
              <div className="flex gap-2 mt-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    disabled={amt > (user?.balance || 0)}
                    className={`flex-1 py-2 text-sm rounded-lg border transition ${amt > (user?.balance || 0)
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : amount === amt.toString()
                        ? 'border-[#042C71] bg-blue-50 text-[#042C71]'
                        : 'border-gray-200 hover:border-[#042C71] hover:bg-blue-50'
                      }`}
                  >
                    {formatPoints(amt)}
                  </button>
                ))}
              </div>
              {amount && (
                <p className="text-sm text-gray-500 mt-2">
                  = Rp {formatPoints(amount)}
                </p>
              )}
            </div>

            {/* DANA Payment */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-4">{t('withdraw.withdrawMethod')}</h3>

              {/* Bank Method Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('withdraw.selectBank')}
                </label>
                <select
                  value={bankMethod}
                  onChange={(e) => setBankMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71] bg-white text-gray-900"
                >
                  <option value="dana">DANA</option>
                  {/* Future banks can be added here */}
                </select>
              </div>

              {/* DANA Details */}
              {bankMethod === 'dana' && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">DANA</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{t('withdraw.danaEWallet')}</p>
                      <p className="text-xs text-gray-500">{t('withdraw.transferToDANA')}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('withdraw.danaPhoneNumber')}
                      </label>
                      <input
                        type="tel"
                        value={danaNumber}
                        onChange={(e) => setDanaNumber(e.target.value)}
                        placeholder={t('withdraw.danaPhonePlaceholder')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71] bg-white text-gray-900"
                      />
                      <p className="text-xs text-gray-500 mt-1">{t('withdraw.danaPhoneHint')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('withdraw.danaAccountName')}
                      </label>
                      <input
                        type="text"
                        value={danaName}
                        onChange={(e) => setDanaName(e.target.value)}
                        placeholder={t('withdraw.danaNamePlaceholder')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71] bg-white text-gray-900"
                      />
                      <p className="text-xs text-gray-500 mt-1">{t('withdraw.danaNameHint')}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#042C71] text-white py-4 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? t('withdraw.processing') : t('withdraw.requestWithdrawal')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
