'use client';

import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useToast } from './Toast';

export default function MontagAds({ onAdComplete }) {
  const { user } = useAuth();
  const toast = useToast();
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      loadMontagScript();
    }
  }, [user]);

  const loadMontagScript = () => {
    // Check if script already loaded
    if (document.getElementById('monetag-script')) {
      setAdLoaded(true);
      return;
    }

    // Load Monetag service worker for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {
          console.log('Monetag service worker registered');
          setAdLoaded(true);
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    }
  };

  const handleDirectLink = () => {
    if (!user) return;

    // Track impression
    api.trackImpression({
      adFormat: 'direct_link',
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    }).catch(err => console.error('Failed to track:', err));

    // Redirect to Monetag Direct Link with user ID
    const monetagUrl = `https://otieu.com/4/10505263?subid=${user.id}`;
    window.open(monetagUrl, '_blank');
  };

  const handlePopunder = () => {
    if (!user) return;

    // Track impression
    api.trackImpression({
      adFormat: 'popunder',
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    }).catch(err => console.error('Failed to track:', err));

    // Redirect to Monetag SmartLink with user ID
    const monetagUrl = `https://otieu.com/4/10505263?subid=${user.id}`;
    window.open(monetagUrl, '_blank');
  };

  const handlePushNotification = async () => {
    if (!user) return;

    try {
      // Request notification permission
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          // Track impression
          await api.trackImpression({
            adFormat: 'push',
            metadata: {
              timestamp: new Date().toISOString(),
              permission: 'granted',
            },
          });

          toast.success('You will earn points when you receive notifications.', {
            title: '🔔 Push Notifications Enabled!',
            duration: 5000,
          });

          if (onAdComplete) {
            onAdComplete();
          }
        } else {
          toast.warning('Please enable notifications to complete this task.', {
            title: 'Permission Required',
          });
        }
      } else {
        toast.error('Your browser does not support push notifications.', {
          title: 'Not Supported',
        });
      }
    } catch (error) {
      console.error('Failed to enable push:', error);
      toast.error('Failed to enable push notifications. Please try again.', {
        title: 'Oops! Something went wrong',
      });
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please login to view available tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Task Cards - Simple Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Push Notification */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-[#042C71] transition">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-800 text-sm mb-1">Push Notification</h3>
            <p className="text-xs text-gray-500">Enable notifications</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-[#042C71]">1,000</span>
            <span className="text-xs text-gray-500">points</span>
          </div>
          <button
            onClick={handlePushNotification}
            className="w-full bg-[#042C71] text-white py-2 rounded-lg hover:bg-blue-800 transition text-sm font-medium"
          >
            Enable
          </button>
        </div>

        {/* Direct Link */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-[#042C71] transition">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-800 text-sm mb-1">Direct Link</h3>
            <p className="text-xs text-gray-500">Visit page</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-[#042C71]">500</span>
            <span className="text-xs text-gray-500">points</span>
          </div>
          <button
            onClick={handleDirectLink}
            className="w-full bg-[#042C71] text-white py-2 rounded-lg hover:bg-blue-800 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <ExternalLink size={14} />
            Visit
          </button>
        </div>

        {/* Pop-under */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-[#042C71] transition">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-800 text-sm mb-1">Pop-under Ad</h3>
            <p className="text-xs text-gray-500">View content</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-[#042C71]">750</span>
            <span className="text-xs text-gray-500">points</span>
          </div>
          <button
            onClick={handlePopunder}
            className="w-full bg-[#042C71] text-white py-2 rounded-lg hover:bg-blue-800 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <ExternalLink size={14} />
            Open
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          <strong className="text-gray-800">Note:</strong> Click any task button to start. Points will be credited automatically after completion. Allow pop-ups for best experience.
        </p>
      </div>
    </div>
  );
}
