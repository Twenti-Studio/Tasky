/**
 * Prevent Redirect Protection
 * Blocks any attempts to redirect the parent window from iframes
 */

let isProtectionActive = false;
let originalOpen = null;

export function activateRedirectProtection() {
  if (isProtectionActive) return;
  
  console.log('[Protection] Activating redirect protection');
  isProtectionActive = true;

  // Prevent window.location changes
  const currentLocation = window.location.href;
  let locationChangeAttempts = 0;

  // Monitor location changes
  const checkLocation = setInterval(() => {
    if (window.location.href !== currentLocation && isProtectionActive) {
      locationChangeAttempts++;
      console.warn(`[Protection] Blocked location change attempt #${locationChangeAttempts}`);
      
      // Try to prevent the navigation
      if (window.history && window.history.back) {
        window.history.replaceState(null, '', currentLocation);
      }
    }
  }, 100);

  // Store for cleanup
  window._redirectProtectionInterval = checkLocation;

  // Override window.open to log and control
  originalOpen = window.open;
  window.open = function(...args) {
    const url = args[0];
    console.log('[Protection] window.open called with URL:', url);
    
    // Allow popups but log them
    if (url && !url.includes(window.location.hostname)) {
      console.log('[Protection] External URL opened in popup:', url);
    }
    
    return originalOpen.apply(window, args);
  };

  // Prevent top navigation via href
  try {
    const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
    
    Object.defineProperty(window.location, 'href', {
      get: function() {
        return originalHref.get.call(this);
      },
      set: function(value) {
        if (isProtectionActive && value !== currentLocation) {
          console.warn('[Protection] Blocked attempt to set location.href to:', value);
          return false;
        }
        return originalHref.set.call(this, value);
      },
      configurable: true
    });
  } catch (err) {
    console.warn('[Protection] Could not override location.href:', err.message);
  }

  // Intercept iframe attempts to access top
  try {
    Object.defineProperty(window, 'top', {
      get: function() {
        console.log('[Protection] Iframe attempted to access window.top');
        return window.self;
      },
      configurable: true
    });

    Object.defineProperty(window, 'parent', {
      get: function() {
        console.log('[Protection] Iframe attempted to access window.parent');
        return window.self;
      },
      configurable: true
    });
  } catch (err) {
    console.warn('[Protection] Could not override window.top/parent:', err.message);
  }
}

export function deactivateRedirectProtection() {
  if (!isProtectionActive) return;
  
  console.log('[Protection] Deactivating redirect protection');
  isProtectionActive = false;

  // Clear location monitoring
  if (window._redirectProtectionInterval) {
    clearInterval(window._redirectProtectionInterval);
    delete window._redirectProtectionInterval;
  }

  // Restore window.open
  if (originalOpen) {
    window.open = originalOpen;
    originalOpen = null;
  }

  // Note: We don't restore location.href, top, parent descriptors
  // as they may cause issues. They'll reset on page reload.
}

export function isProtectionEnabled() {
  return isProtectionActive;
}
