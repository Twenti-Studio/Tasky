# BitLabs Integration - Setup Guide

## ✅ Konfigurasi API Keys (SUDAH DIKONFIGURASI)

### API Token
`3cbd4dde-42bf-4dfb-8463-58146b64cc51`

### Secret Key  
`UFjEUIUbXkXwNfPWgw5rkFg5tEFn6Gfp`

### Server to Server Key
`9F8skJoGz55IOqEe2nyE0GcKc5yf5Cdy`

---

## 🔗 Callback URL Configuration (PENTING!)

Masukkan URL callback berikut di BitLabs dashboard:

### Reward Callback URL
```
https://your-domain.com/api/v1/callback/bitlabs
```

Untuk development (localhost):
```
http://localhost:5000/api/v1/callback/bitlabs
```

**Note**: BitLabs mungkin tidak bisa kirim callback ke localhost. Untuk testing, gunakan ngrok atau deploy ke server production.

### Survey Redirect URLs

**After screenout**: 
```
https://your-domain.com/tasks?status=screenout
```

**After complete**:
```
https://your-domain.com/tasks?status=complete
```

**After initial profiler**:
```
https://your-domain.com/tasks?status=profiler
```

**After click termination**:
```
https://your-domain.com/tasks?status=terminated
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
4. Check console browser untuk log: `[Tasks] Loaded X dynamic surveys`
5. Surveys akan muncul dikategorikan sebagai:
   - **Premium Surveys** (≥500 pts)
   - **Standard Surveys** (≥200 pts)
   - **Quick Tasks** (<200 pts)

---

## 🔍 Testing Callback (Production Only)

Untuk test callback system:

1. Deploy backend ke server production atau gunakan ngrok
2. Update Reward Callback URL di BitLabs dashboard
3. Enable "Enable Advanced Callback System" toggle
4. Complete survey di aplikasi
5. Check backend logs untuk callback notification
6. Verify points masuk ke user balance

### Using ngrok for localhost testing:
```bash
# Install ngrok
ngrok http 5000

# Use the ngrok URL as callback URL:
https://xxxx-xxx-xxx-xxx.ngrok.io/api/v1/callback/bitlabs
```

---

## 📊 Callback Flow

```
User completes survey
       ↓
BitLabs sends callback to your server
       ↓
POST/GET /api/v1/callback/bitlabs
  - user_id
  - tx (transaction ID)
  - value (reward in cents)
  - status (1=credit, 2=chargeback)
  - hash (SHA1 verification)
       ↓
Server verifies hash with Secret Key
       ↓
Points auto-credited to user balance (70%)
Platform gets 30%
       ↓
User sees updated balance
```

---

## ✅ Status Integrasi

- ✅ API Token configured
- ✅ Secret Key configured  
- ✅ Server-to-Server Key configured
- ✅ Frontend fetch surveys endpoint ready
- ✅ Backend BitLabs controller ready
- ✅ Dynamic task categorization ready
- ✅ Callback handler ready (hash verification enabled)
- ⚠️ Callback URL needs to be added in BitLabs dashboard

---

## 🔐 Security

Hash verification menggunakan SHA1:
```
hash = SHA1(user_id + tx + value + SECRET_KEY)
```

Server akan reject callback jika hash tidak valid.

---

## 💡 Important Notes

1. **Brand Hiding**: Tasks tidak menyebutkan "BitLabs" di UI
2. **Auto-Categorization**: Tasks dikategorikan berdasarkan reward amount
3. **Real-time Sync**: Surveys selalu up-to-date dari BitLabs API
4. **Revenue Share**: 70% user, 30% platform
5. **Callback**: Points auto-credited via callback (user tidak perlu claim manual)

---

## 📞 Support

Jika ada error:
1. Check server logs: `cd server && npm run dev`
2. Check browser console
3. Verify all environment variables di `server/.env`
4. Test endpoint: `GET /api/callback/bitlabs/surveys` (requires auth)

---

**Status**: ✅ READY TO USE  
**Last Updated**: 2026-02-02
