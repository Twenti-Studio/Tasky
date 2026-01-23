# Tasky - Micro Task Platform

Platform mikrotask yang memungkinkan user mendapatkan penghasilan dengan menyelesaikan task sederhana seperti menonton iklan, mengisi survey, dan aktivitas lainnya.

## 🎯 Features

- ✅ User Authentication (Register/Login)
- ✅ Dashboard untuk tracking earnings
- ✅ **Unified Postback System** (Secure & Scalable)
  - Anti-fraud protection (IP whitelist, hash verification)
  - Idempotency (prevent double-credit)
  - Modular architecture for multiple providers
  - Comprehensive audit trail
- ✅ **Monetag Integration** (Flat Rate Rewards)
  - Push Notifications: 10 points
  - SmartLink/Direct Link: 50 points
  - Pop-under Ads: 30 points
- ✅ **CPX Research Integration** (Ready to Use)
  - Survey wall with revenue tracking
  - Hash verification & IP whitelisting
  - Chargeback/fraud handling
- ✅ Real-time balance updates (Points System)
- ✅ Withdrawal system (Min: 5,000 points = Rp 5,000)
- ✅ Points to Rupiah conversion (1,000 points = Rp 1,000)
- 🚧 BitLabs integration (template ready)
- 🚧 TimeWall integration (template ready)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Language**: JavaScript

### Backend
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Authentication**: JWT

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm atau yarn

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd Tasky
```

2. **Setup Frontend**
```bash
# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Run development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

3. **Setup Backend**
```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env sesuai kebutuhan

# Setup database
npm run prisma:generate
npm run prisma:migrate

# Run backend server
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

## 📁 Project Structure

```
Tasky/
├── app/                        # Next.js frontend
│   ├── components/            # React components
│   │   ├── FeatureSection.js
│   │   ├── Footer.js
│   │   ├── MontagAds.js      # Monetag integration
│   │   └── WaitlistForm.js
│   ├── context/              # React context
│   │   └── AuthContext.js
│   ├── lib/                  # Utilities
│   │   └── api.js            # API client
│   ├── dashboard/            # Dashboard page
│   ├── login/                # Login page
│   ├── register/             # Register page
│   ├── privacy/              # Privacy policy
│   ├── terms/                # Terms of service
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── server/                    # Express.js backend
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   └── index.js
│   └── package.json
├── public/
│   ├── sw.js                 # Monetag service worker
│   └── ...
└── package.json
```

## 🔒 Unified Postback System

Tasky menggunakan **Unified Postback System** yang robust untuk menangani reward signals dari berbagai provider secara aman dan scalable.

### Security Features
- ✅ **Idempotency** - Mencegah double-credit dengan unique transaction tracking
- ✅ **Hash Verification** - MD5/SHA256 signature validation untuk CPX Research
- ✅ **IP Whitelisting** - Hanya menerima request dari IP resmi provider
- ✅ **Rate Limiting** - Proteksi terhadap spam/abuse
- ✅ **Audit Trail** - Semua transaksi tercatat di database

### Supported Providers

#### 1. **CPX Research** (Survey Provider)
- **Postback URL**: `https://yourdomain.com/api/v1/callback/cpx`
- **Security**: IP Whitelist + MD5 Hash Verification
- **Features**: Success & Chargeback handling

#### 2. **Monetag** (Ad Network)
- **Postback URL**: `https://yourdomain.com/api/v1/callback/monetag`
- **Rewards**: Flat rate (10-50 points per task)
- **Features**: Push, SmartLink, Pop-under

#### 3. **Generic Provider** (Template)
- Ready-to-use template for BitLabs, TimeWall, dan provider lainnya
- Copy & customize sesuai dokumentasi provider

### Documentation

Untuk dokumentasi lengkap Postback System, lihat:
📚 **[server/POSTBACK_SYSTEM.md](server/POSTBACK_SYSTEM.md)**

## 🔌 API Documentation

Lihat [server/README.md](server/README.md) untuk dokumentasi lengkap API.

### Main Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/user/profile` - Get user profile
- `POST /api/monetag/track` - Track ad impression
- `POST /api/monetag/complete` - Complete ad task

## 🎨 Pages

### Public Pages
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### Protected Pages
- `/dashboard` - User dashboard (requires authentication)

## 🔐 Authentication Flow

1. User register dengan email, username, dan password
2. Backend hash password menggunakan bcrypt
3. User login dan menerima JWT token
4. Token disimpan di localStorage dan cookie
5. Setiap request ke protected endpoint menyertakan token
6. Backend verify token dan return user data

## 💰 Monetization Flow

### Monetag Integration

1. User login dan masuk dashboard
2. Monetag script dimuat (hanya untuk authenticated users)
3. User memilih task yang tersedia
4. Backend track impression saat task dimulai
5. User menyelesaikan task (view ad, click, subscribe, dll)
6. Backend update status impression dan tambah balance
7. User bisa withdraw balance ke rekening

### Revenue Model

- Push Notification: Rp 10 per completion
- Pop-under Ad: Rp 15 per completion
- Native Ad: Rp 8 per completion
- Banner Ad: Rp 5 per completion

*Note: Nilai dapat disesuaikan berdasarkan actual revenue dari Monetag*

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend (server/.env)**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=5000
FRONTEND_URL="http://localhost:3000"
MONETAG_ZONE_ID="10501305"
MONETAG_DOMAIN="5gvci.com"
```

## 📝 TODO

- [ ] Implement CPX Research integration
- [ ] Implement BitLabs integration
- [ ] Add withdrawal processing system
- [ ] Add admin panel
- [ ] Add email verification
- [ ] Add forgot password feature
- [ ] Add user profile editing
- [ ] Add referral system
- [ ] Add leaderboard
- [ ] Implement actual payment gateway (GoPay, OVO, Dana)

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Railway/Render/Heroku)

1. Push code ke GitHub
2. Connect repository ke platform pilihan
3. Set environment variables
4. Deploy

**Important**: Ubah DATABASE_URL ke PostgreSQL untuk production:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

## 📄 License

Private - Twenti Studio

## 👥 Team

Developed by Twenti Studio

## 📧 Support

Untuk pertanyaan dan dukungan, hubungi: [your-email@example.com]

---

**Note**: Aplikasi ini masih dalam tahap development. Beberapa fitur mungkin belum sepenuhnya berfungsi.
