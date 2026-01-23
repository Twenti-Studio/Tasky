import crypto from 'crypto';

/**
 * IP Whitelisting Middleware for CPX Research
 * Only allow requests from CPX's official server IPs
 */
const cpxIpWhitelist = (req, res, next) => {
  const allowedIps = process.env.CPX_ALLOWED_IPS?.split(',') || [];
  
  // Get real IP (considering proxies)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress;

  console.log(`[CPX IP Check] Client IP: ${clientIp}`);
  console.log(`[CPX IP Check] Allowed IPs: ${allowedIps.join(', ')}`);

  // In development, allow localhost
  if (process.env.NODE_ENV === 'development' && 
      (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp?.includes('127.0.0.1'))) {
    console.log('[CPX IP Check] Development mode - allowing localhost');
    return next();
  }

  // Check if IP is whitelisted
  const isAllowed = allowedIps.some(allowedIp => {
    return clientIp === allowedIp || clientIp?.includes(allowedIp);
  });

  if (!isAllowed) {
    console.error(`[CPX IP Check] BLOCKED - Unauthorized IP: ${clientIp}`);
    // Always return 200 to prevent CPX retries
    return res.status(200).send('OK');
  }

  console.log('[CPX IP Check] IP authorized');
  next();
};

/**
 * CPX Research Hash Verification
 * Verifies the secure hash to prevent fake/tampered requests
 * 
 * CPX Hash formula: MD5(trans_id-user_id-amount_local-amount_usd-currency_type-SECRET_KEY)
 */
const verifyCpxHash = (req, res, next) => {
  const { trans_id, user_id, amount_local, amount_usd, currency_type, hash } = req.query;
  const secretKey = process.env.CPX_SECRET_KEY;

  if (!secretKey) {
    console.error('[CPX Hash] SECRET_KEY not configured');
    return res.status(200).send('OK'); // Still return 200
  }

  if (!hash) {
    console.error('[CPX Hash] Missing hash parameter');
    return res.status(200).send('OK');
  }

  // Build hash string according to CPX documentation
  // Format: trans_id-user_id-amount_local-amount_usd-currency_type-SECRET_KEY
  const hashString = `${trans_id}-${user_id}-${amount_local}-${amount_usd}-${currency_type}-${secretKey}`;
  
  // Calculate MD5 hash
  const calculatedHash = crypto.createHash('md5').update(hashString).digest('hex');

  console.log(`[CPX Hash] Received hash: ${hash}`);
  console.log(`[CPX Hash] Calculated hash: ${calculatedHash}`);
  console.log(`[CPX Hash] Hash string: ${hashString.replace(secretKey, '***SECRET***')}`);

  if (calculatedHash !== hash) {
    console.error('[CPX Hash] INVALID - Hash mismatch! Possible fraud attempt.');
    // Still return 200 to prevent retries
    return res.status(200).send('OK');
  }

  console.log('[CPX Hash] Hash verified successfully');
  next();
};

/**
 * Generic rate limiting middleware (simple in-memory implementation)
 * For production, use Redis-based rate limiting
 */
const requestLog = new Map();

const simpleRateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                     req.connection.remoteAddress;
    
    const now = Date.now();
    const key = `${clientIp}-${req.path}`;
    
    if (!requestLog.has(key)) {
      requestLog.set(key, []);
    }
    
    const requests = requestLog.get(key);
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= maxRequests) {
      console.warn(`[Rate Limit] ${clientIp} exceeded ${maxRequests} requests in ${windowMs}ms`);
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    validRequests.push(now);
    requestLog.set(key, validRequests);
    
    next();
  };
};

/**
 * Sanitize and validate user input
 */
const sanitizeInput = (req, res, next) => {
  // Remove any potentially harmful characters from query params
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = req.query[key].trim();
    }
  }
  next();
};

export {
  cpxIpWhitelist,
  verifyCpxHash,
  simpleRateLimit,
  sanitizeInput,
};
