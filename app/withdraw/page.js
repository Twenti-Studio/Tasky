'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Wallet, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function WithdrawPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const formatPoints = (points) => {
    return new Intl.NumberFormat('id-ID').format(Math.floor(points || 0));
  };

  const formatRupiah = (points) => {
    return new Intl.NumberFormat('id-ID').format(Math.floor(points || 0));
  };

  const paymentMethods = [
    { id: 'gopay', name: 'GoPay', icon: '💚' },
    { id: 'ovo', name: 'OVO', icon: '💜' },
    { id: 'dana', name: 'DANA', icon: '💙' },
    { id: 'shopeepay', name: 'ShopeePay', icon: '🧡' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
  ];

  const quickAmounts = [5000, 10000, 25000, 50000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const withdrawAmount = parseInt(amount);

    if (!withdrawAmount || withdrawAmount < 5000) {
      setError('Minimum withdrawal is 5,000 points');
      return;
    }

    if (withdrawAmount > (user?.balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    if (!method) {
      setError('Please select a payment method');
      return;
    }

    if (!accountNumber || !accountName) {
      setError('Please fill in account details');
      return;
    }

    setLoading(true);

    try {
      await api.requestWithdrawal(withdrawAmount, method, accountNumber, accountName);
      setSuccess(true);
      setAmount('');
      setAccountNumber('');
      setAccountName('');
      await refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to process withdrawal');
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
          <h1 className="text-xl font-bold text-gray-800">Withdraw</h1>
          <p className="text-sm text-gray-500">Cash out your points</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-[#042C71]">{formatPoints(user?.balance || 0)} pts</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Equivalent</p>
              <p className="text-lg font-semibold text-gray-800">Rp {formatRupiah(user?.balance || 0)}</p>
            </div>
          </div>
        </div>

        {/* Conversion Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <Info className="text-blue-600 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Conversion Rate</p>
              <p>1,000 Points = Rp 1,000</p>
              <p className="mt-1">Minimum Withdrawal: 5,000 Points (Rp 5,000)</p>
            </div>
          </div>
        </div>

        {!canWithdraw ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-orange-900">Not enough points</p>
                <p className="text-sm text-orange-700 mt-1">
                  You need {formatPoints(5000 - (user?.balance || 0))} more points to withdraw.
                </p>
              </div>
            </div>
          </div>
        ) : success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="text-green-600 mx-auto mb-3" size={48} />
            <h3 className="font-semibold text-green-900 mb-2">Withdrawal Requested!</h3>
            <p className="text-sm text-green-700">
              Your withdrawal request has been submitted. It will be processed within 1-3 business days.
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
                Amount (Points)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="5000"
                max={user?.balance || 0}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
              />
              <div className="flex gap-2 mt-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    disabled={amt > (user?.balance || 0)}
                    className={`flex-1 py-2 text-sm rounded-lg border transition ${
                      amt > (user?.balance || 0)
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'border-gray-200 hover:border-[#042C71] hover:bg-blue-50'
                    }`}
                  >
                    {formatPoints(amt)}
                  </button>
                ))}
              </div>
              {amount && (
                <p className="text-sm text-gray-500 mt-2">
                  = Rp {formatRupiah(amount)}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setMethod(pm.id)}
                    className={`p-3 border rounded-lg text-left transition ${
                      method === pm.id
                        ? 'border-[#042C71] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg mr-2">{pm.icon}</span>
                    <span className="text-sm font-medium">{pm.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Account Details
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={method === 'bank' ? 'Bank Account Number' : 'Phone Number'}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
              />
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account Holder Name"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#042C71]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#042C71] text-white py-4 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
