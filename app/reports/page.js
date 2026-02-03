'use client';

import { AlertCircle, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function ReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.isAdmin) {
        router.push('/admin/reports');
      } else {
        fetchReports();
      }
    }
  }, [user, authLoading, router]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getUserReports();
      setReports(response.reports);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.subject || !formData.description) {
      setError('Subjek dan deskripsi harus diisi');
      return;
    }

    try {
      setSubmitting(true);
      await api.createReport(formData);
      setSuccess('Laporan berhasil dikirim!');
      setFormData({ subject: '', category: 'technical', description: '' });
      setShowForm(false);
      fetchReports();
    } catch (err) {
      setError(err.message || 'Gagal mengirim laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { color: 'bg-blue-100 text-blue-800', label: 'Terbuka', icon: AlertCircle },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'Diproses', icon: Clock },
      resolved: { color: 'bg-green-100 text-green-800', label: 'Selesai', icon: CheckCircle2 },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Ditutup', icon: CheckCircle2 }
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const categories = {
      technical: 'Teknis',
      payment: 'Pembayaran',
      task: 'Tugas',
      other: 'Lainnya'
    };
    return categories[category] || category;
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#042C71] mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan & Aduan</h1>
          <p className="text-gray-600">Laporkan masalah atau sampaikan keluhan Anda</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Create Report Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#042C71] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#031f4d] transition"
          >
            {showForm ? 'Batal' : '+ Buat Laporan Baru'}
          </button>
        </div>

        {/* Report Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Buat Laporan Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjek
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042C71] focus:border-transparent"
                  placeholder="Judul singkat masalah Anda"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042C71] focus:border-transparent"
                >
                  <option value="technical">Teknis</option>
                  <option value="payment">Pembayaran</option>
                  <option value="task">Tugas</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042C71] focus:border-transparent"
                  placeholder="Jelaskan masalah Anda secara detail..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#CE4912] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#b84010] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Laporan
              </h3>
              <p className="text-gray-600">
                Anda belum pernah membuat laporan. Klik tombol di atas untuk membuat laporan baru.
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow hover:shadow-md transition p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {report.subject}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {getCategoryLabel(report.category)}
                      </span>
                      <span>
                        {new Date(report.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(report.status)}
                  </div>
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {report.description}
                </p>

                {report.adminNote && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Tanggapan Admin:
                    </p>
                    <p className="text-sm text-blue-800">
                      {report.adminNote}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
