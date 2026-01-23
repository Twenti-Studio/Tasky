# Tasky Backend Server

Backend API untuk platform mikrotask Tasky menggunakan Express.js dan Prisma ORM.

## 🚀 Setup

### Option 1: Using Docker (Recommended)

**Super Easy - One Command:**

```bash
# From root project directory
docker-compose up -d
```

Docker akan otomatis:
- ✅ Start PostgreSQL database
- ✅ Run Prisma migrations
- ✅ Start backend server
- ✅ Setup everything!

Server akan berjalan di `http://localhost:5000`

**Docker Commands:**
```bash
# View logs
docker-compose logs -f backend

# Restart
docker-compose restart backend

# Stop
docker-compose down

# Open Prisma Studio
docker-compose --profile studio up
```

---

### Option 2: Manual Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env` dan sesuaikan konfigurasi:

```bash
cp .env.example .env
```

Edit file `.env`:
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/tasky"
JWT_SECRET="your-secret-key-here"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### 3. Setup Database

**Note**: Make sure PostgreSQL is installed and running!

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio untuk melihat database
npm run prisma:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## 📁 Struktur Folder

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── monetagController.js
│   ├── middleware/            # Express middleware
│   │   └── auth.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── user.js
│   │   └── monetag.js
│   └── index.js               # Entry point
├── .env                       # Environment variables
└── package.json
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### User

- `GET /api/user/profile` - Get user profile (protected)
- `GET /api/user/earnings` - Get user earnings history (protected)
- `GET /api/user/withdrawals` - Get withdrawal history (protected)
- `POST /api/user/withdraw` - Request withdrawal (protected)

### Monetag

- `POST /api/monetag/track` - Track ad impression (protected)
- `POST /api/monetag/complete` - Complete ad impression (protected)
- `GET /api/monetag/impressions` - Get user impressions (protected)
- `POST /api/monetag/callback` - Monetag callback endpoint (public)

## 🗄️ Database Schema

### User
- id, email, username, password, name, balance
- Relations: adImpressions, earnings, withdrawals

### AdImpression
- id, userId, adType, adFormat, revenue, status, metadata
- Tracks setiap ad yang ditampilkan/diklik user

### Earning
- id, userId, amount, source, description
- History penghasilan user

### Withdrawal
- id, userId, amount, method, accountNumber, status
- Request penarikan saldo

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk authentication:
- Token dikirim via Authorization header: `Bearer <token>`
- Token juga disimpan di HTTP-only cookie
- Token expire dalam 7 hari (configurable)

## 🛠️ Development

### Prisma Commands

```bash
# Generate Prisma Client setelah mengubah schema
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Reset database (DANGER: akan hapus semua data)
npx prisma migrate reset

# Open Prisma Studio
npm run prisma:studio
```

### Testing API

Gunakan tools seperti:
- Postman
- Insomnia
- Thunder Client (VS Code extension)
- curl

Contoh request:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"testuser","password":"password123"}'
```

## 📝 Notes

- Default database menggunakan SQLite untuk kemudahan development
- Untuk production, disarankan menggunakan PostgreSQL atau MySQL
- Pastikan JWT_SECRET di production menggunakan string yang aman dan random
- Implementasi Monetag callback perlu disesuaikan dengan dokumentasi Monetag
