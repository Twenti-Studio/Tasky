# TheoremReach Integration - Setup Guide

## ✅ Konfigurasi API Keys (SUDAH DIKONFIGURASI)

### API Key
`70517d47171929e0d3950c189104`

### Secret Key  
`5b7da95cfccb65ad26655afa65c576b81947eb8b`

### App ID
`24591`

---

## 🔗 Callback URL Configuration (PENTING!)

Masukkan URL callback berikut di TheoremReach dashboard:

### Reward Callback URL
```
https://your-domain.com/api/callback/theoremreach
```

Untuk development (localhost):
```
http://localhost:5000/api/callback/theoremreach
```

**Note**: TheoremReach memerlukan server callback untuk memverifikasi survey completions. Untuk testing lokal, gunakan ngrok atau deploy ke server production.

---

## 📋 Callback Parameters

TheoremReach akan mengirimkan parameter berikut:

| Parameter | Description |
|-----------|-------------|
| `reward` | Amount in-app currency yang harus dikreditkan |
| `currency` | USD amount (floating point, e.g., 0.50) |
| `user_id` | User ID dari aplikasi Anda |
| `tx_id` | Transaction ID (unique per transaksi) |
| `hash` | HMAC SHA-1 hash untuk verifikasi keamanan |
| `reversal` | (optional) `true` jika chargeback |
| `debug` | (optional) `true` = ignore callback ini (testing) |
| `offer` | (optional) `true` jika ini offer bukan survey |
| `offer_name` | (optional) Nama offer |
| `placement_id` | (optional) Placement ID |

---

## 🔐 Hash Verification

TheoremReach menggunakan HMAC SHA-1 untuk verifikasi:

1. Ambil full callback URL tanpa parameter hash
2. Generate HMAC SHA-1 dengan Secret Key
3. Encode hasil ke Base64
4. Replace karakter:
   - `+` → `-`
   - `/` → `_`
   - `=` → (hapus)

### Contoh Node.js:
```javascript
const crypto = require('crypto');

const secretKey = '5b7da95cfccb65ad26655afa65c576b81947eb8b';
const urlWithoutHash = 'https://example.com/callback?user_id=123&reward=100&tx_id=abc';

const hmac = crypto.createHmac('sha1', secretKey);
hmac.update(urlWithoutHash);
const hash = hmac.digest('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');
```

---

## 🚀 Cara Menjalankan

### 1. Start Backend
```bash
cd server
npm run dev
```

Backend akan berjalan di: `http://localhost:5000`

### 2. Start Frontend  
```bash
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

### 3. Test Integration
1. Buka: `http://localhost:3000`
2. Login ke aplikasi
3. Navigate ke `/tasks`
4. Klik "Premium Surveys" untuk membuka TheoremReach survey wall
5. Complete survey
6. Points akan otomatis dikreditkan via callback

---

## ✅ Status Integrasi

- ✅ API Key configured
- ✅ Secret Key configured  
- ✅ App ID configured
- ✅ Frontend survey wall ready
- ✅ Backend callback handler ready
- ✅ Hash verification implemented
- ⚠️ Callback URL needs to be added in TheoremReach dashboard (penting!)

---

## 💰 Revenue Share

- **User mendapat**: 70% dari reward
- **Platform mendapat**: 30% dari reward

Contoh: Jika TheoremReach membayar $1.00 (100 cents):
- Total points: ~10,000 pts
- User mendapat: 7,000 pts
- Platform mendapat: 3,000 pts

---

## 📞 Support

Jika ada error:
1. Check server logs: `cd server && npm run dev`
2. Check browser console
3. Verify all environment variables di `server/.env`
4. Test TheoremReach dashboard untuk melihat callback attempts

---

**Status**: ✅ READY TO USE  
**Last Updated**: 2026-02-02
