# Tasky Feature Implementation Plan

## 🎯 Goals
1. Remove all currency/dollar displays - only show points
2. Improve withdrawal page with DANA option and end-of-month processing info
3. Create admin panel with user management and payout approval
4. Create account settings for user and admin
5. Fix task logic - points should be credited when completing tasks

## 📋 Implementation Order

### Phase 1: Fix Task Logic (CRITICAL)
- [ ] Update `trackImpression` to also credit points immediately for testing
- [ ] Add `completeTask` API endpoint that credits points directly
- [ ] Update frontend to call completeTask after user interaction

### Phase 2: Remove Currency Displays
- [ ] Update tasks/page.js - remove all $ and Rp displays
- [ ] Update dashboard/page.js - show only points
- [ ] Update withdraw/page.js - show points only
- [ ] Update history/page.js - show points only

### Phase 3: Improve Withdrawal Page
- [ ] Simplify to DANA only for now
- [ ] Add DANA number and DANA name fields
- [ ] Add end-of-month processing notice

### Phase 4: Database Schema Updates
- [ ] Add `isAdmin` and `isActive` to User model
- [ ] Add `transferredAt` and `adminNote` to Withdrawal model
- [ ] Run prisma migration

### Phase 5: Admin Panel
- [ ] Create /admin route with admin-only access
- [ ] Create admin layout component
- [ ] User Management page (list, activate/deactivate, view points)
- [ ] Withdrawal Management page (approve/reject, mark as transferred)
- [ ] Admin dashboard with stats

### Phase 6: Account Settings
- [ ] Create /settings page for users
- [ ] Create /admin/settings page for admin
- [ ] Change password, update profile

## 🗂️ Files to Create/Modify

### New Files:
- `app/admin/layout.js`
- `app/admin/page.js` (admin dashboard)
- `app/admin/users/page.js`
- `app/admin/withdrawals/page.js`
- `app/admin/settings/page.js`
- `app/settings/page.js`
- `server/src/routes/admin.js`
- `server/src/controllers/adminController.js`
- `server/src/middleware/adminAuth.js`

### Modified Files:
- `server/prisma/schema.prisma`
- `app/tasks/page.js`
- `app/withdraw/page.js`
- `app/dashboard/page.js`
- `app/lib/api.js`
