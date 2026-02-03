'use client';

import { AlertCircle, CheckCircle2, Clock, MessageSquare, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
    adminNote: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.isAdmin) {
        router.push('/reports');
      } else {
        fetchReports();
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchReports();
    }
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getAllReports(filters);
      setReports(response.reports);
      setStats(response.stats || {});
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async (reportId) => {
    try {
      setUpdating(true);
      await api.updateReportStatus(reportId, updateData);
      await fetchReports();
      setSelectedReport(null);
      setUpdateData({ status: '', priority: '', adminNote: '' });
    } catch (err) {
      console.error('Failed to update report:', err);
      alert('Gagal mengupdate laporan');
    } finally {
      setUpdating(false);
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

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-700', label: 'Rendah' },
      normal: { color: 'bg-blue-100 text-blue-700', label: 'Normal' },
      high: { color: 'bg-orange-100 text-orange-700', label: 'Tinggi' },
      urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' }
    };

    const config = priorityConfig[priority] || priorityConfig.normal;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#042C71] mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan & Aduan</h1>
          <p className="text-gray-600">Kelola semua laporan dari pengguna</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">Terbuka</div>
            <div className="text-2xl font-bold text-blue-900">{stats.open || 0}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-600 mb-1">Diproses</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.in_progress || 0}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 mb-1">Selesai</div>
            <div className="text-2xl font-bold text-green-900">{stats.resolved || 0}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Ditutup</div>
            <div className="text-2xl font-bold text-gray-900">{stats.closed || 0}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042C71] focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="open">Terbuka</option>
                <option value="in_progress">Diproses</option>
                <option value="resolved">Selesai</option>
                <option value="closed">Ditutup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042C71] focus:border-transparent"
              >
                <option value="">Semua Kategori</option>
                <option value="technical">Teknis</option>
                <option value="payment">Pembayaran</option>
                <option value="task">Tugas</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042C71] focus:border-transparent"
                  placeholder="Cari subjek, user..."
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak Ada Laporan
              </h3>
              <p className="text-gray-600">
                Belum ada laporan dengan filter yang dipilih.
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.subject}
                      </h3>
                      {getPriorityBadge(report.priority)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {getCategoryLabel(report.category)}
                      </span>
                      <span>User: <strong>{report.user.username}</strong></span>
                      <span>
                        {new Date(report.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setUpdateData({
                          status: report.status,
                          priority: report.priority,
                          adminNote: report.adminNote || ''
                        });
                      }}
                      className="ml-2 px-4 py-2 bg-[#042C71] text-white rounded-lg hover:bg-[#031f4d] transition text-sm"
                    >
                      Kelola
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-2 whitespace-pre-wrap">
                  {report.description}
                </p>

                {report.adminNote && (
                  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
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

        {/* Update Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">Kelola Laporan</h2>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">{selectedReport.subject}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  User: <strong>{selectedReport.user.username}</strong> ({selectedReport.user.email})
                </p>
                <p className="text-gray-700">{selectedReport.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042C71]"
                  >
                    <option value="open">Terbuka</option>
                    <option value="in_progress">Diproses</option>
                    <option value="resolved">Selesai</option>
                    <option value="closed">Ditutup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas</label>
                  <select
                    value={updateData.priority}
                    onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042C71]"
                  >
                    <option value="low">Rendah</option>
                    <option value="normal">Normal</option>
                    <option value="high">Tinggi</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Admin
                  </label>
                  <textarea
                    value={updateData.adminNote}
                    onChange={(e) => setUpdateData({ ...updateData, adminNote: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042C71]"
                    placeholder="Berikan tanggapan atau catatan untuk user..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleUpdateReport(selectedReport.id)}
                    disabled={updating}
                    className="flex-1 bg-[#CE4912] text-white py-2 rounded-lg font-semibold hover:bg-[#b84010] transition disabled:opacity-50"
                  >
                    {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
