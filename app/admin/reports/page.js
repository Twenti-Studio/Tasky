'use client';

import { AlertCircle, Camera, CheckCircle2, Clock, FileText, MessageSquare, Search, SlidersHorizontal, UserCircle, X } from 'lucide-react';
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
      setReports(response.reports || []);
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
      open: { color: 'bg-blue-100 text-blue-700 border border-blue-200', label: 'Terbuka' },
      in_progress: { color: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Diproses' },
      resolved: { color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: 'Selesai' },
      closed: { color: 'bg-slate-100 text-slate-600 border border-slate-200', label: 'Ditutup' }
    };

    const config = statusConfig[status] || statusConfig.open;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-slate-100 text-slate-600', label: 'Rendah' },
      normal: { color: 'bg-blue-100 text-blue-700', label: 'Normal' },
      high: { color: 'bg-orange-100 text-orange-700', label: 'Tinggi' },
      urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' }
    };

    const config = priorityConfig[priority] || priorityConfig.normal;
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${config.color}`}>
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'technical': return '🔧';
      case 'payment': return '💳';
      case 'task': return '📋';
      default: return '📝';
    }
  };

  const getApiBaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return url.replace(/\/api$/, '');
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#042C71] mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[#042C71] to-[#0a4da8] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan & Aduan</h1>
          <p className="text-slate-500 text-sm">Kelola semua laporan dari pengguna</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.open || 0}</div>
              <div className="text-sm text-slate-500">Terbuka</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.in_progress || 0}</div>
              <div className="text-sm text-slate-500">Diproses</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.resolved || 0}</div>
              <div className="text-sm text-slate-500">Selesai</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.closed || 0}</div>
              <div className="text-sm text-slate-500">Ditutup</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-5 h-5 text-slate-500" />
          <span className="font-semibold text-slate-700">Filter Laporan</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="">Semua Status</option>
              <option value="open">Terbuka</option>
              <option value="in_progress">Diproses</option>
              <option value="resolved">Selesai</option>
              <option value="closed">Ditutup</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Kategori</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="">Semua Kategori</option>
              <option value="technical">Teknis</option>
              <option value="payment">Pembayaran</option>
              <option value="task">Tugas</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Cari</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                placeholder="Cari subjek, user..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Tidak Ada Laporan
            </h3>
            <p className="text-slate-500">
              Belum ada laporan dengan filter yang dipilih.
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(report.category)}</span>
                    <h3 className="text-lg font-bold text-slate-800">
                      {report.subject}
                    </h3>
                    {getPriorityBadge(report.priority)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">
                      {getCategoryLabel(report.category)}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <UserCircle className="w-4 h-4" />
                      <strong className="text-slate-700">{report.user?.username || 'Unknown'}</strong>
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">
                      {new Date(report.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
                    className="px-4 py-2 bg-[#042C71] text-white rounded-lg hover:bg-[#031f4d] transition-all font-medium text-sm shadow-sm hover:shadow-md"
                  >
                    Kelola
                  </button>
                </div>
              </div>

              <p className="text-slate-600 mb-3 whitespace-pre-wrap leading-relaxed">
                {report.description}
              </p>

              {/* Display uploaded image */}
              {report.imageUrl && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Bukti Kendala:
                  </p>
                  <img
                    src={`${getApiBaseUrl()}${report.imageUrl}`}
                    alt="Bukti kendala"
                    className="max-w-full max-h-48 rounded-lg border border-slate-200 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(`${getApiBaseUrl()}${report.imageUrl}`, '_blank')}
                  />
                </div>
              )}

              {report.adminNote && (
                <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#042C71] rounded-r-lg">
                  <p className="text-sm font-bold text-[#042C71] mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Tanggapan Admin
                  </p>
                  <p className="text-sm text-slate-700">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Kelola Laporan</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(selectedReport.category)}</span>
                  <h3 className="font-bold text-slate-800">{selectedReport.subject}</h3>
                </div>
                <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  <strong>{selectedReport.user?.username || 'Unknown'}</strong>
                  <span className="text-slate-400">({selectedReport.user?.email || '-'})</span>
                </p>
                <p className="text-slate-700 leading-relaxed">{selectedReport.description}</p>

                {/* Display uploaded image in modal */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Bukti Kendala
                  </p>
                  {selectedReport.imageUrl ? (
                    <img
                      src={`${getApiBaseUrl()}${selectedReport.imageUrl}`}
                      alt="Bukti kendala"
                      className="max-w-full max-h-64 rounded-lg border border-slate-200 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(`${getApiBaseUrl()}${selectedReport.imageUrl}`, '_blank')}
                    />
                  ) : (
                    <p className="text-sm text-slate-400 italic">Tidak ada bukti gambar yang dilampirkan</p>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="open">Terbuka</option>
                    <option value="in_progress">Diproses</option>
                    <option value="resolved">Selesai</option>
                    <option value="closed">Ditutup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Prioritas</label>
                  <select
                    value={updateData.priority}
                    onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="low">Rendah</option>
                    <option value="normal">Normal</option>
                    <option value="high">Tinggi</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Catatan Admin
                  </label>
                  <textarea
                    value={updateData.adminNote}
                    onChange={(e) => setUpdateData({ ...updateData, adminNote: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                    placeholder="Berikan tanggapan atau catatan untuk user..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleUpdateReport(selectedReport.id)}
                    disabled={updating}
                    className="flex-1 bg-gradient-to-r from-[#CE4912] to-[#e55a1f] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
