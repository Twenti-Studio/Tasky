'use client';

import { AlertCircle, Camera, CheckCircle2, FileText, MessageSquare, Plus, Send, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
    description: '',
    imageUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

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
      setReports(response.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Hanya file gambar yang diperbolehkan (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file terlalu besar (maksimal 5MB)');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const result = await api.uploadImage(file);
      console.log('[UploadImage] Success, received URL:', result.imageUrl);
      setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
      setSuccess('Gambar berhasil disiapkan. Silakan kirim laporan.');
    } catch (err) {
      setError(err.message || 'Gagal mengupload gambar');
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      console.log('[SubmitReport] data:', formData);
      const res = await api.createReport(formData);
      console.log('[SubmitReport] Response:', res);

      setSuccess('Laporan berhasil dikirim!');
      setFormData({ subject: '', category: 'technical', description: '', imageUrl: '' });
      setPreviewImage(null);
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
      open: { color: 'bg-blue-100 text-blue-700 border border-blue-200', label: 'Terbuka' },
      in_progress: { color: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Diproses' },
      resolved: { color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: 'Selesai' },
      closed: { color: 'bg-slate-100 text-slate-700 border border-slate-200', label: 'Ditutup' }
    };

    const config = statusConfig[status] || statusConfig.open;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
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

  const getApiBaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return url.replace(/\/api$/, '');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#042C71] mx-auto"></div>
              <p className="mt-4 text-slate-600 font-medium">Memuat data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#042C71] to-[#0a4da8] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Laporan & Aduan</h1>
                <p className="text-slate-500 text-sm mt-0.5">Sampaikan masalah atau keluhan Anda kepada kami</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${showForm
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-gradient-to-r from-[#042C71] to-[#0a4da8] text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
                }`}
            >
              {showForm ? (
                <>
                  <X className="w-5 h-5" />
                  Batal
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Buat Laporan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Report Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-[#CE4912]/10 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-[#CE4912]" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Buat Laporan Baru</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subjek Laporan
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#042C71]/20 focus:border-[#042C71] focus:bg-white transition-all duration-200"
                  placeholder="Contoh: Poin tidak masuk setelah menyelesaikan tugas"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#042C71]/20 focus:border-[#042C71] focus:bg-white transition-all duration-200 cursor-pointer"
                >
                  <option value="technical">Teknis</option>
                  <option value="payment">Pembayaran</option>
                  <option value="task">Tugas</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Deskripsi Masalah
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#042C71]/20 focus:border-[#042C71] focus:bg-white transition-all duration-200 resize-none"
                  placeholder="Jelaskan masalah Anda secara detail. Sertakan informasi seperti waktu kejadian, langkah yang sudah dilakukan, dll."
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Bukti Kendala (Opsional)
                </label>
                <div className="space-y-3">
                  {previewImage || formData.imageUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={previewImage || `${getApiBaseUrl()}${formData.imageUrl}`}
                        alt="Preview"
                        className="max-w-full max-h-48 rounded-lg border border-slate-200 object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-[#042C71] hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium">
                        {uploading ? 'Mengupload...' : 'Klik untuk upload gambar'}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        JPEG, PNG, GIF, WEBP (Maks. 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#CE4912] to-[#e55a1f] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setPreviewImage(null);
                    setFormData({ subject: '', category: 'technical', description: '', imageUrl: '' });
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Belum Ada Laporan
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Anda belum memiliki laporan. Klik tombol &quot;Buat Laporan&quot; di atas untuk menyampaikan masalah atau keluhan.
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      {report.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">
                        {getCategoryLabel(report.category)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(report.status)}
                  </div>
                </div>

                <p className="text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">
                  {report.description}
                </p>

                {/* Display uploaded image */}
                {report.imageUrl && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-600 mb-2">Bukti Kendala:</p>
                    <img
                      src={`${getApiBaseUrl()}${report.imageUrl}`}
                      alt="Bukti kendala"
                      className="max-w-full max-h-64 rounded-lg border border-slate-200 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(`${getApiBaseUrl()}${report.imageUrl}`, '_blank')}
                    />
                  </div>
                )}

                {report.adminNote && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#042C71] rounded-r-xl">
                    <p className="text-sm font-bold text-[#042C71] mb-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Tanggapan Admin
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {report.adminNote}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
