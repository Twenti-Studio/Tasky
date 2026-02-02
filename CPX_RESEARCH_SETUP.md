# CPX Research Integration - Setup Guide

## ✅ Konfigurasi API Keys (SUDAH DIKONFIGURASI)

### App ID
`31226`

### Security Hash
`oqsZwoFgVxMzsHl06qqsj1GgzmJkywtB`

### IP Whitelist (dari server CPX - jangan diubah)
- `188.40.3.73`
- `157.90.97.92`
- `2a01:4f8:d0a:30ff:2`

---

## 🔧 SETTINGS DI CPX DASHBOARD

### Buka Dashboard CPX: https://publisher.cpx-research.com/

---

### 📋 TAB: POSTBACK SETTINGS (Screenshot 1 & 2)

#### **Main Postback URL** (WAJIB DIISI!)
Masukkan URL ini di field "Main Postback URL":

**Untuk Production/Live:**
```
https://your-domain.com/api/callback/cpx?status={status}&trans_id={trans_id}&user_id={user_id}&amount_local={amount_local}&amount_usd={amount_usd}&hash={secure_hash}&ip={ip_click}
```

**Untuk Development (dengan ngrok):**
```
https://xxxx.ngrok.io/api/callback/cpx?status={status}&trans_id={trans_id}&user_id={user_id}&amount_local={amount_local}&amount_usd={amount_usd}&hash={secure_hash}&ip={ip_click}
```

> ⚠️ **PENTING**: Ganti `your-domain.com` dengan domain production Anda, atau gunakan ngrok untuk testing.

---

#### **Postback Expert Settings** (OPSIONAL - bisa dikosongkan)

| Field | Apa yang diisi | Keterangan |
|-------|----------------|------------|
| Postback Url Screen Out | *KOSONGKAN* | URL untuk screen out (tidak perlu untuk sebagian besar kasus) |
| Postback Bonus/Rating | *KOSONGKAN* | URL untuk bonus/rating callback (opsional) |
| Postback Url Event Canceled | *KOSONGKAN* | URL untuk event yang dibatalkan (opsional) |

> **Tip**: Field "Expert Settings" boleh dikosongkan. Main Postback URL sudah cukup untuk menerima semua callback penting.

---

### 🔄 TAB: REDIRECT SETTINGS (Screenshot 3)

#### **Redirect Type**
Pilih: `Direct / I support the message ID system !!! Important read info`

#### **Redirect Url** (di bagian REDIRECT SETTINGS EXPERT)
Masukkan URL ini:

```
https://your-domain.com/tasks?cpx_status={status}&message_id={message_id}
```

**Untuk localhost development:**
```
http://localhost:3000/tasks?cpx_status={status}&message_id={message_id}
```

> Ini adalah URL dimana user akan diredirect setelah menyelesaikan atau meninggalkan survey.

---

### ⚙️ TAB: GENERAL SETTINGS (perlu dicek)

Anda perlu menemukan **App ID** di tab ini. Biasanya ada di bagian atas atau di field "Extern ID" / "App ID".

**Setelah menemukan App ID, kabari saya agar bisa diupdate di konfigurasi!**

---

### 💰 TAB: REWARD SETTINGS

Di tab ini, atur:
- **Currency**: IDR (Indonesian Rupiah) atau USD
- **Exchange Rate**: Berapa poin yang diberikan per USD

> Contoh: 1 USD = 10,000 points

---

## 📊 Bagaimana Postback Bekerja

```
User menyelesaikan survey di CPX
        ↓
CPX mengirim callback ke server Anda
        ↓
GET /api/callback/cpx?status=1&trans_id=xxx&user_id=xxx&amount_local=100&hash=xxx
        ↓
Server memverifikasi hash dengan Secret Key
        ↓
Points dikreditkan ke user (70% user, 30% platform)
        ↓
User melihat balance terupdate
```

---

## 🔐 Parameter Postback dari CPX

| Parameter | Placeholder | Keterangan |
|-----------|-------------|------------|
| status | `{status}` | 1 = completed, 2 = chargeback/canceled |
| trans_id | `{trans_id}` | Unique transaction ID |
| user_id | `{user_id}` | User ID dari aplikasi Anda |
| amount_local | `{amount_local}` | Amount in your currency |
| amount_usd | `{amount_usd}` | Amount in USD |
| hash | `{secure_hash}` | MD5 hash untuk verifikasi |
| ip | `{ip_click}` | IP address user |
| subid_1 | `{subid_1}` | Custom parameter 1 (opsional) |
| subid_2 | `{subid_2}` | Custom parameter 2 (opsional) |

---

## ✅ Checklist Konfigurasi

- [x] Security Hash sudah dikonfigurasi di server
- [x] IP Whitelist sudah dikonfigurasi
- [x] App ID sudah diisi: `31226`
- [x] Main Postback URL sudah diisi di CPX dashboard
- [ ] Redirect URL sudah diisi di CPX dashboard (opsional)

---

## 🧪 Testing Postback

1. Setelah semua setting diisi, klik tombol **"Click here to test Postback"** di CPX dashboard
2. Masukkan Test User Id (contoh: `test123`)
3. Check server logs untuk melihat apakah callback diterima
4. Jika sukses, akan muncul log: `[CPX Callback] ✅ User test123 balance updated`

---

## 💡 Tips

1. **Gunakan ngrok untuk testing lokal**:
   ```bash
   ngrok http 5000
   ```
   Kemudian gunakan URL ngrok (contoh: `https://abc123.ngrok.io`) di Postback URL

2. **Check server logs** untuk debugging:
   ```bash
   cd server && npm run dev
   ```
   Perhatikan log dengan prefix `[CPX Callback]`

3. **Hash verification** menggunakan MD5:
   ```
   hash = MD5(trans_id + your_security_hash)
   ```

---

**Status**: ✅ READY TO USE  
**Last Updated**: 2026-02-02
