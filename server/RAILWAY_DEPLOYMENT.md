# Panduan Deploy ke Railway - Tasky Backend

## Masalah yang Sudah Diperbaiki ✅

### 1. **Konflik Konfigurasi File**
- ❌ **Sebelumnya**: Ada 2 file konfigurasi (`railway.json` di root dan `railways.json` di `/server`)
- ✅ **Sekarang**: Hanya ada 1 file `railway.json` di folder `/server`

### 2. **Typo Nama File**
- ❌ **Sebelumnya**: `railways.json` (salah)
- ✅ **Sekarang**: `railway.json` (benar)

### 3. **Root Directory Redundan**
- ❌ **Sebelumnya**: Railway settings menggunakan Root Directory `/server` + command `cd server`
- ✅ **Sekarang**: Hanya menggunakan Root Directory `/server` tanpa `cd server`

### 4. **Build Command**
- ❌ **Sebelumnya**: `npm install && npx prisma generate`
- ✅ **Sekarang**: `npm ci && npx prisma generate` (lebih cepat dan konsisten)

### 5. **Start Command**
- ❌ **Sebelumnya**: `npx prisma db push && npm start` (tidak aman untuk production)
- ✅ **Sekarang**: `npx prisma migrate deploy && npm start` (proper migration)

### 6. **Health Check**
- ✅ **Ditambahkan**: Health check endpoint `/api/health` dengan timeout 300s

### 7. **Nixpacks Configuration**
- ✅ **Ditambahkan**: File `nixpacks.toml` untuk build configuration yang lebih baik

---

## Langkah-Langkah Deploy di Railway 🚀

### **Opsi 1: Menggunakan Railway.json (RECOMMENDED)**

1. **Pastikan Root Directory sudah diset ke `/server`**
   - Buka Railway Dashboard → Project → Service → Settings
   - Di bagian "Source", set **Root Directory** = `/server`
   - Klik "Save Changes"

2. **Hapus Custom Build & Start Command**
   - Di bagian "Build", pastikan **TIDAK ADA** custom build command
   - Di bagian "Deploy", pastikan **TIDAK ADA** custom start command
   - Railway akan otomatis membaca dari `railway.json`

3. **Set Environment Variables**
   Tambahkan variable berikut di Railway Dashboard → Variables:
   ```
   DATABASE_URL=<your-postgres-url-from-railway>
   JWT_SECRET=<your-secret-key>
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=<your-frontend-url>
   PORT=5000
   
   # Monetag
   MONETAG_ZONE_ID=10501305
   MONETAG_DOMAIN=5gvci.com
   MONETAG_PUSH_REWARD=10
   MONETAG_SMARTLINK_REWARD=50
   MONETAG_POPUNDER_REWARD=30
   
   # CPX Research
   CPX_SECRET_KEY=<your-cpx-secret>
   CPX_APP_ID=<your-cpx-app-id>
   CPX_ALLOWED_IPS=188.40.3.73,157.90.97.92
   ```

4. **Deploy**
   - Push code ke GitHub
   - Railway akan otomatis deploy
   - Atau klik "Deploy Now" di Railway Dashboard

---

### **Opsi 2: Menggunakan Dockerfile**

Jika Anda ingin menggunakan Dockerfile:

1. **Set Dockerfile Path**
   - Railway Dashboard → Settings → Build
   - Set **Dockerfile Path** = `/server/Dockerfile`
   - Set **Root Directory** = `/server`

2. **Hapus railway.json** (opsional jika pakai Dockerfile)
   ```bash
   rm server/railway.json
   ```

3. **Set Environment Variables** (sama seperti Opsi 1)

4. **Deploy**

---

## Verifikasi Deployment ✓

Setelah deploy berhasil, cek:

1. **Health Check**
   ```bash
   curl https://your-app.railway.app/api/health
   ```
   Response: `{"status":"ok","message":"Tasky API is running"}`

2. **Database Connection**
   - Cek logs di Railway Dashboard
   - Pastikan tidak ada error "DATABASE_URL is missing"
   - Pastikan migration berhasil: "Applied X migrations"

3. **API Endpoints**
   Test endpoint lain seperti:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/user/profile`

---

## Troubleshooting 🔧

### Error: "DATABASE_URL is missing"
- Pastikan environment variable `DATABASE_URL` sudah diset
- Cek di Railway Dashboard → Variables

### Error: "Migration failed"
- Pastikan database PostgreSQL sudah running
- Cek connection string di `DATABASE_URL`
- Coba manual migration: `npx prisma migrate deploy`

### Error: "Port already in use"
- Railway otomatis set PORT via environment variable
- Pastikan code Anda menggunakan `process.env.PORT`

### Build Timeout
- Cek apakah `npm ci` terlalu lama
- Pastikan `package-lock.json` sudah di-commit
- Coba hapus `node_modules` dan rebuild

---

## File-File Penting yang Sudah Diperbaiki 📁

1. ✅ `/server/railway.json` - Konfigurasi Railway
2. ✅ `/server/nixpacks.toml` - Build configuration
3. ✅ `/server/Dockerfile` - Docker configuration
4. ✅ `/server/Procfile` - Process configuration
5. ✅ `/server/.dockerignore` - Docker ignore rules
6. ✅ `/server/src/index.js` - Health check endpoint

---

## Rekomendasi Settings Railway 🎯

**Settings → Build:**
- Builder: `NIXPACKS` (recommended) atau `DOCKERFILE`
- Root Directory: `/server`
- Build Command: *kosongkan* (biarkan railway.json yang handle)
- Dockerfile Path: `/server/Dockerfile` (jika pakai Dockerfile)

**Settings → Deploy:**
- Start Command: *kosongkan* (biarkan railway.json yang handle)
- Restart Policy: `ON_FAILURE`
- Health Check Path: `/api/health`
- Health Check Timeout: `300` seconds

**Settings → Networking:**
- Public Networking: ✅ Enabled
- Custom Domain: (opsional)

---

## Next Steps 🎉

Setelah deployment berhasil:

1. **Test semua API endpoints**
2. **Setup monitoring** (Railway sudah provide metrics)
3. **Setup custom domain** (opsional)
4. **Enable auto-deploy** dari GitHub branch
5. **Setup staging environment** (opsional)

---

**Catatan**: Pastikan Anda sudah push semua perubahan ke GitHub sebelum deploy!

```bash
git add .
git commit -m "fix: railway deployment configuration"
git push origin main
```
