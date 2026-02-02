/**
 * Iframe Security Monitor
 * Monitors and logs iframe behavior to detect and prevent security issues
 */

class IframeSecurityMonitor {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.isMonitoring = false;
  }

  /**
   * Start monitoring iframe security events
   */
  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.log('🛡️ Security Monitor', 'Iframe security monitoring started');

    // Monitor for navigation attempts
    this.monitorNavigationAttempts();
    
    // Monitor for postMessage communication
    this.monitorPostMessages();
    
    // Monitor for focus/blur events
    this.monitorFocusEvents();
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isMonitoring = false;
    this.log('🛡️ Security Monitor', 'Iframe security monitoring stopped');
  }

  /**
   * Monitor navigation attempts from iframe
   */
  monitorNavigationAttempts() {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = (...args) => {
      this.log('⚠️ Navigation Attempt', 'pushState called', args[2]);
      return originalPushState.apply(window.history, args);
    };

    window.history.replaceState = (...args) => {
      this.log('⚠️ Navigation Attempt', 'replaceState called', args[2]);
      return originalReplaceState.apply(window.history, args);
    };

    // Monitor location changes
    window.addEventListener('hashchange', (e) => {
      this.log('🔗 Hash Change', `From: ${e.oldURL}`, `To: ${e.newURL}`);
    });

    window.addEventListener('popstate', (e) => {
      this.log('⬅️ Back/Forward', 'User navigated', e.state);
    });
  }

  /**
   * Monitor postMessage events for suspicious activity
   */
  monitorPostMessages() {
    window.addEventListener('message', (event) => {
      // Log all postMessage events for debugging
      this.log('📨 PostMessage Received', 
        `Origin: ${event.origin}`,
        `Data: ${typeof event.data === 'string' ? event.data : JSON.stringify(event.data).substring(0, 100)}`
      );

      // Check for suspicious patterns
      if (event.data && typeof event.data === 'string') {
        const suspicious = [
          'eval(',
          'javascript:',
          '<script',
          'document.cookie',
          'window.location',
          'top.location'
        ];

        suspicious.forEach(pattern => {
          if (event.data.includes(pattern)) {
            this.log('🚨 SUSPICIOUS ACTIVITY', 
              `Detected suspicious pattern: ${pattern}`,
              `From origin: ${event.origin}`
            );
          }
        });
      }
    });
  }

  /**
   * Monitor focus events to detect clickjacking attempts
   */
  monitorFocusEvents() {
    let lastFocusTime = Date.now();
    
    window.addEventListener('blur', () => {
      const timeSinceFocus = Date.now() - lastFocusTime;
      if (timeSinceFocus < 100) {
        this.log('⚠️ Rapid Focus Change', 
          'Potential clickjacking attempt detected',
          `Time since focus: ${timeSinceFocus}ms`
        );
      }
    });

    window.addEventListener('focus', () => {
      lastFocusTime = Date.now();
    });
  }

  /**
   * Log security event
   */
  log(category, message, details = '') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      category,
      message,
      details
    };

    this.logs.push(logEntry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${timestamp}] ${category}: ${message}`, details);
    }
  }

  /**
   * Get all logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category) {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    this.log('🗑️ Logs Cleared', 'All security logs have been cleared');
  }

  /**
   * Check if there are any suspicious activities
   */
  hasSuspiciousActivity() {
    return this.logs.some(log => 
      log.category.includes('SUSPICIOUS') || 
      log.category.includes('⚠️')
    );
  }

  /**
   * Get summary of security events
   */
  getSummary() {
    const categories = {};
    this.logs.forEach(log => {
      categories[log.category] = (categories[log.category] || 0) + 1;
    });

    return {
      totalEvents: this.logs.length,
      categories,
      hasSuspicious: this.hasSuspiciousActivity(),
      firstEvent: this.logs[0]?.timestamp,
      lastEvent: this.logs[this.logs.length - 1]?.timestamp
    };
  }
}

// Create singleton instance
const iframeSecurityMonitor = typeof window !== 'undefined' 
  ? new IframeSecurityMonitor() 
  : null;

export default iframeSecurityMonitor;

/**
 * Usage in React component:
 * 
 * import iframeSecurityMonitor from '@/app/lib/iframeSecurityMonitor';
 * 
 * useEffect(() => {
 *   iframeSecurityMonitor?.start();
 *   return () => iframeSecurityMonitor?.stop();
 * }, []);
 * 
 * // View logs in console
 * console.log(iframeSecurityMonitor?.getSummary());
 * console.log(iframeSecurityMonitor?.getLogs());
 */
