/**
 * REVENUE SHARING SYSTEM
 * 
 * Platform takes 30%, User receives 70%
 * 
 * Example:
 * - Provider pays $1.00 (15,000 points)
 * - Platform keeps: 4,500 points (30%)
 * - User receives: 10,500 points (70%)
 */

// Revenue share percentages
const PLATFORM_SHARE = 0.30; // 30%
const USER_SHARE = 0.70;     // 70%

// Conversion rates (1 USD = X Points)
const CONVERSION_RATES = {
  USD: 15000,  // 1 USD = 15,000 points (= Rp 15,000)
  IDR: 1,      // 1 IDR = 1 point
  EUR: 16500,
  GBP: 19000,
};

/**
 * Calculate user's share from provider payment
 * @param {number} amount - Amount from provider
 * @param {string} currency - Currency code (USD, IDR, etc.)
 * @param {boolean} isInCents - If amount is in cents (for USD, EUR, GBP)
 * @returns {object} { userShare, platformShare, totalPoints, originalAmount }
 */
export const calculateRevenueShare = (amount, currency = 'USD', isInCents = true) => {
  const amountFloat = parseFloat(amount) || 0;
  
  // Convert cents to dollars if needed
  const baseAmount = isInCents && ['USD', 'EUR', 'GBP'].includes(currency) 
    ? amountFloat / 100 
    : amountFloat;
  
  // Get conversion rate
  const rate = CONVERSION_RATES[currency] || CONVERSION_RATES.USD;
  
  // Calculate total points from provider payment
  const totalPoints = Math.floor(baseAmount * rate);
  
  // Calculate shares
  const platformShare = Math.floor(totalPoints * PLATFORM_SHARE);
  const userShare = Math.floor(totalPoints * USER_SHARE);
  
  // Minimum user share (ensure user always gets something)
  const finalUserShare = Math.max(userShare, 1);
  
  return {
    userShare: finalUserShare,
    platformShare,
    totalPoints,
    originalAmount: baseAmount,
    currency,
    rate,
    percentages: {
      user: USER_SHARE * 100,
      platform: PLATFORM_SHARE * 100,
    }
  };
};

/**
 * Calculate user's share from fixed amount in points
 * Used for flat rate rewards (Monetag push, smartlink, etc.)
 * @param {number} fixedPoints - Fixed amount in points
 * @returns {object} { userShare, platformShare }
 */
export const calculateFixedRevenueShare = (fixedPoints) => {
  const totalPoints = parseInt(fixedPoints) || 0;
  
  const platformShare = Math.floor(totalPoints * PLATFORM_SHARE);
  const userShare = Math.floor(totalPoints * USER_SHARE);
  
  return {
    userShare: Math.max(userShare, 1),
    platformShare,
    totalPoints,
    percentages: {
      user: USER_SHARE * 100,
      platform: PLATFORM_SHARE * 100,
    }
  };
};

/**
 * Convert USD to Points (before revenue share)
 * @param {number} usd - Amount in USD
 * @returns {number} Points
 */
export const usdToPoints = (usd) => {
  return Math.floor((parseFloat(usd) || 0) * CONVERSION_RATES.USD);
};

/**
 * Convert Points to IDR
 * @param {number} points - Points amount
 * @returns {number} IDR equivalent
 */
export const pointsToIdr = (points) => {
  // 1,000 points = Rp 1,000
  return parseInt(points) || 0;
};

export default {
  calculateRevenueShare,
  calculateFixedRevenueShare,
  usdToPoints,
  pointsToIdr,
  PLATFORM_SHARE,
  USER_SHARE,
  CONVERSION_RATES,
};
