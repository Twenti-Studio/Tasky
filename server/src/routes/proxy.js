import axios from 'axios';
import express from 'express';

const router = express.Router();

/**
 * Proxy endpoint untuk render offerwall dalam aplikasi
 * Ini akan fetch content dari provider dan inject tracking script
 */
router.get('/offerwall/:provider', async (req, res) => {
  const { provider } = req.params;
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID required' });
  }

  try {
    let targetUrl;
    let providerName;

    // Build provider URLs dengan proper credentials
    switch (provider) {
      case 'cpx':
        targetUrl = `https://offers.cpx-research.com/index.php?app_id=${process.env.NEXT_PUBLIC_CPX_APP_ID}&ext_user_id=${user_id}`;
        providerName = 'CPX Research';
        break;
      case 'timewall':
        targetUrl = `https://timewall.io/offer?pub=${process.env.NEXT_PUBLIC_TIMEWALL_PUB_ID}&user_id=${user_id}`;
        providerName = 'Timewall';
        break;
      case 'lootably':
        targetUrl = `https://wall.lootably.com/?placementID=${process.env.NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID}&userID=${user_id}`;
        providerName = 'Lootably';
        break;
      case 'revlum':
        targetUrl = `https://revlum.com/offerwall/${process.env.NEXT_PUBLIC_REVLUM_APP_ID}?user_id=${user_id}`;
        providerName = 'Revlum';
        break;
      case 'theoremreach':
        targetUrl = `https://theoremreach.com/respondent_entry/direct?api_key=${process.env.NEXT_PUBLIC_THEOREMREACH_APP_ID}&user_id=${user_id}&transaction_id=${Date.now()}`;
        providerName = 'TheoremReach';
        break;
      case 'adgem':
        targetUrl = `https://api.adgem.com/v1/wall?appid=${process.env.ADGEM_POSTBACK_KEY}&player_id=${user_id}`;
        providerName = 'AdGem';
        break;
      case 'kiwiwall':
        targetUrl = `https://www.kiwiwall.com/wall/${process.env.KIWIWALL_APP_ID}/iframe?s1=${user_id}`;
        providerName = 'Kiwiwall';
        break;
      default:
        return res.status(404).json({ error: 'Provider not found' });
    }

    console.log(`[Proxy] Fetching ${providerName} for user ${user_id}`);

    // Fetch content dari provider
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': process.env.FRONTEND_URL || 'http://localhost:3000'
      },
      timeout: 15000, // 15 second timeout
      maxRedirects: 5
    });

    let html = response.data;

    // Inject tracking script untuk monitor engagement dan completion
    const trackingScript = `
      <script>
        (function() {
          console.log('[Mita Tracker] Task tracking initialized for ${providerName}');
          
          // Kirim heartbeat setiap 30 detik untuk track engagement
          const heartbeatInterval = setInterval(function() {
            fetch('${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/callback/track-engagement', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: '${user_id}',
                provider: '${provider}',
                timestamp: Date.now()
              })
            }).catch(err => console.log('[Mita Tracker] Heartbeat failed:', err));
          }, 30000);

          // Monitor clicks untuk analytics
          document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (target && target.href) {
              fetch('${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/callback/track-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: '${user_id}',
                  provider: '${provider}',
                  url: target.href,
                  timestamp: Date.now()
                })
              }).catch(err => console.log('[Mita Tracker] Click tracking failed:', err));
            }
          }, true);

          // Cleanup on unload
          window.addEventListener('beforeunload', function() {
            clearInterval(heartbeatInterval);
          });

          // Notify parent that content is ready
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'TASK_CONTENT_READY', provider: '${provider}' }, '*');
          }
        })();
      </script>
    `;

    // Inject script sebelum closing </body> atau </html>
    if (html.includes('</body>')) {
      html = html.replace('</body>', trackingScript + '</body>');
    } else if (html.includes('</html>')) {
      html = html.replace('</html>', trackingScript + '</html>');
    } else {
      html += trackingScript;
    }

    // Replace absolute URLs untuk keep navigation dalam proxy
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Note: Ini optional, bisa di-comment jika provider komplain
    // html = html.replace(/href="https?:\/\//g, `href="${baseUrl}/api/proxy/redirect?url=https://`);

    // Set proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Allow dalam iframe aplikasi kita
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    res.send(html);

    console.log(`[Proxy] Successfully served ${providerName} content`);

  } catch (error) {
    console.error('[Proxy] Error fetching offerwall:', error.message);

    // Fallback: Return HTML yang akan redirect ke URL asli
    // Ini untuk handle case dimana provider block server-side fetching
    const fallbackHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Loading Task...</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #042C71 0%, #1e40af 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
            .loader {
              width: 50px;
              height: 50px;
              border: 5px solid rgba(255,255,255,0.3);
              border-top-color: white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .message {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            .submessage {
              font-size: 14px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <div class="message">Provider requires direct connection</div>
          <div class="submessage">Opening in secure mode...</div>
          <script>
            // Notify parent that proxy failed
            if (window.parent !== window) {
              window.parent.postMessage({ 
                type: 'PROXY_FAILED', 
                provider: '${provider}',
                error: '${error.message}'
              }, '*');
            }
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(fallbackHtml);
  }
});

/**
 * Redirect handler untuk navigasi dalam proxy
 * (Optional - untuk advanced use case)
 */
router.get('/redirect', (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL required');
  }

  // Simple redirect
  res.redirect(url);
});

export default router;
