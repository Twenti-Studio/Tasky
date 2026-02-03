'use client';

import {
  Award,
  Bell,
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Gift,
  Lightbulb,
  PlayCircle,
  Rocket,
  Search,
  Star,
  Target,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function TasksPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [dailyCompletedTasks, setDailyCompletedTasks] = useState(new Set());
  const [processingTask, setProcessingTask] = useState(null);
  const [bitlabsSurveys, setBitlabsSurveys] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isProduction, setIsProduction] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [taskWindow, setTaskWindow] = useState(null);

  // Helper: Get today's date string (YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  // Check if push notification was previously enabled and load daily completed tasks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pushStatus = localStorage.getItem('mita_push_enabled');
      if (pushStatus === 'true') {
        setPushEnabled(true);
      }
      // Only enable Monetag in production (not localhost)
      const hostname = window.location.hostname;
      const isProd = hostname !== 'localhost' && hostname !== '127.0.0.1';
      setIsProduction(isProd);

      // Load daily completed tasks from localStorage
      const todayKey = `mita_daily_tasks_${getTodayString()}`;
      const savedTasks = localStorage.getItem(todayKey);
      if (savedTasks) {
        try {
          const parsed = JSON.parse(savedTasks);
          setDailyCompletedTasks(new Set(parsed));
        } catch (e) {
          // Invalid data, reset
          localStorage.removeItem(todayKey);
        }
      }

      // Clean up old daily task entries (older than today)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('mita_daily_tasks_') && key !== todayKey) {
          localStorage.removeItem(key);
        }
      });
    }
  }, []);

  // Shield against top-level redirection hijacking
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (iframeUrl) {
        // This will trigger a browser confirmation dialog if a script tries to redirect the parent
        e.preventDefault();
        e.returnValue = 'Tugas sedang berjalan. Tetap di halaman ini untuk melanjutkan pengerjaan.';
        return e.returnValue;
      }
    };

    // Prevent any scripts from redirecting the parent window
    const preventTopNavigation = (e) => {
      if (iframeUrl && e.target !== window.self) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Security] Blocked navigation attempt from iframe');
      }
    };

    // Listen for messages from iframe (proxy fallback handling)
    const handleMessage = (event) => {
      // Security: Only accept messages from our domain
      if (event.origin !== window.location.origin && !event.origin.includes('localhost')) {
        return;
      }

      const { type, provider, error } = event.data;

      if (type === 'PROXY_FAILED') {
        console.warn(`[Proxy] Failed for ${provider}:`, error);
        // Auto fallback to popup after 2 seconds
        setTimeout(() => {
          if (iframeUrl && iframeUrl.includes('/api/proxy/')) {
            setIframeError(true);
            toast.info('Provider requires separate window. Click button below.', {
              title: 'Opening in New Window',
              duration: 4000,
            });
          }
        }, 2000);
      } else if (type === 'TASK_CONTENT_READY') {
        console.log(`[Proxy] Content ready for ${provider}`);
        setIframeLoading(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('hashchange', preventTopNavigation);
    window.addEventListener('popstate', preventTopNavigation);
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('hashchange', preventTopNavigation);
      window.removeEventListener('popstate', preventTopNavigation);
      window.removeEventListener('message', handleMessage);
    };
  }, [iframeUrl]);

  // Fetch BitLabs surveys from API
  useEffect(() => {
    const fetchBitlabsSurveys = async () => {
      if (!user || authLoading) return;

      try {
        setLoadingSurveys(true);
        const response = await api.getBitlabsSurveys();
        if (response.success && response.surveys) {
          setBitlabsSurveys(response.surveys);
          console.log('[Tasks] Dynamic surveys loaded:', response.surveys.length);
        } else if (response.error) {
          console.warn('[Tasks] Survey API returned error:', response.error);
        }
      } catch (error) {
        console.error('[Tasks] Error fetching dynamic surveys:', error);
      } finally {
        setLoadingSurveys(false);
      }
    };

    fetchBitlabsSurveys();
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.isAdmin) {
        router.push('/admin');
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#042C71]"></div>
      </div>
    );
  }

  // Check which providers have valid API keys configured
  const hasValidApiKey = (providerId) => {
    const keys = {
      monetag: process.env.NEXT_PUBLIC_MONETAG_ZONE_ID || true, // Monetag is always enabled (hardcoded)
      cpx: process.env.NEXT_PUBLIC_CPX_APP_ID && process.env.NEXT_PUBLIC_CPX_APP_ID !== 'your-cpx-app-id',
      timewall: process.env.NEXT_PUBLIC_TIMEWALL_PUB_ID && process.env.NEXT_PUBLIC_TIMEWALL_PUB_ID !== 'your-timewall-pub-id',
      lootably: process.env.NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID && process.env.NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID !== 'your-lootably-placement-id',
      revlum: process.env.NEXT_PUBLIC_REVLUM_APP_ID && process.env.NEXT_PUBLIC_REVLUM_APP_ID !== 'your-revlum-app-id',
      bitlabs: process.env.NEXT_PUBLIC_BITLABS_TOKEN && process.env.NEXT_PUBLIC_BITLABS_TOKEN !== 'your-bitlabs-token',
      theoremreach: process.env.NEXT_PUBLIC_THEOREMREACH_APP_ID && process.env.NEXT_PUBLIC_THEOREMREACH_APP_ID !== 'your-theoremreach-app-id',
      adgem: process.env.NEXT_PUBLIC_ADGEM_APP_ID && process.env.NEXT_PUBLIC_ADGEM_APP_ID !== 'your-adgem-app-id',
    };
    return keys[providerId] || false;
  };

  // Static providers - Clean professional design
  const allStaticProviders = [
    {
      id: 'monetag',
      name: 'Daily Rewards',
      category: 'ads',
      icon: Zap,
      color: 'bg-blue-600',
      description: 'Quick daily tasks',
      payout: '10-50 pts',
      tasks: [
        {
          id: 'push',
          name: 'Enable Notifications',
          description: 'Stay updated with new offers',
          points: 10,
          pointsDisplay: '+10 pts',
          taskIcon: Bell,
        },
        {
          id: 'smartlink',
          name: 'Visit Partner',
          description: 'Explore sponsored content',
          points: 49,
          pointsDisplay: '+49 pts',
          taskIcon: Rocket,
        },
        {
          id: 'popunder',
          name: 'View Content',
          description: 'Quick sponsored view',
          points: 31,
          pointsDisplay: '+31 pts',
          taskIcon: Eye,
        },
      ],
    },
    {
      id: 'theoremreach',
      name: 'Premium Surveys',
      category: 'surveys',
      icon: Award,
      color: 'bg-violet-600',
      description: 'High-paying opinion surveys',
      payout: '100-5000 pts',
      tasks: [
        {
          id: 'survey',
          name: 'Survey Wall',
          description: 'Share your opinions',
          points: 0,
          pointsDisplay: 'Up to 5000 pts',
          isOfferwall: true,
          taskIcon: FileText,
        },
      ],
    },
    {
      id: 'cpx',
      name: 'Research Surveys',
      category: 'surveys',
      icon: Search,
      color: 'bg-indigo-600',
      description: 'Market research studies',
      payout: '200-5000 pts',
      tasks: [
        {
          id: 'survey',
          name: 'Research Studies',
          description: 'Join paid research',
          points: 0,
          pointsDisplay: 'Up to 5000 pts',
          isOfferwall: true,
          taskIcon: FileText,
        },
      ],
    },
    {
      id: 'timewall',
      name: 'Micro Tasks',
      category: 'tasks',
      icon: Clock,
      color: 'bg-emerald-600',
      description: 'Quick simple tasks',
      payout: '50-500 pts',
      tasks: [
        {
          id: 'microtask',
          name: 'Quick Tasks',
          description: 'Simple actions, quick rewards',
          points: 0,
          pointsDisplay: 'Up to 500 pts',
          isOfferwall: true,
          taskIcon: Target,
        },
      ],
    },
    {
      id: 'lootably',
      name: 'Videos & Games',
      category: 'offers',
      icon: PlayCircle,
      color: 'bg-rose-600',
      description: 'Watch videos, play games',
      payout: '100-1000 pts',
      tasks: [
        {
          id: 'offers',
          name: 'Watch & Play',
          description: 'Entertainment rewards',
          points: 0,
          pointsDisplay: 'Up to 1000 pts',
          isOfferwall: true,
          taskIcon: PlayCircle,
        },
      ],
    },
    {
      id: 'revlum',
      name: 'Premium Offers',
      category: 'offers',
      icon: Star,
      color: 'bg-amber-600',
      description: 'High-value opportunities',
      payout: '500-10000 pts',
      tasks: [
        {
          id: 'multitask',
          name: 'Special Offers',
          description: 'App trials, signups & more',
          points: 0,
          pointsDisplay: 'Up to 10000 pts',
          isOfferwall: true,
          taskIcon: TrendingUp,
        },
      ],
    },
    {
      id: 'adgem',
      name: 'AdGem Offers',
      category: 'offers',
      icon: Gift,
      color: 'bg-purple-600',
      description: 'Diverse earning opportunities',
      payout: '100-5000 pts',
      tasks: [
        {
          id: 'offerwall',
          name: 'Other Walls',
          description: 'Surveys, apps, videos & more',
          points: 0,
          pointsDisplay: 'Up to 5000 pts',
          isOfferwall: true,
          taskIcon: Gift,
        },
      ],
    },
  ];

  // Filter static providers to only show those with valid API keys
  const staticProviders = allStaticProviders.filter(provider => hasValidApiKey(provider.id));

  // Categorize surveys based on points
  const categorizeSurvey = (survey) => {
    if (survey.points >= 500) {
      return { category: 'surveys', type: 'premium-survey', label: 'Premium Surveys' };
    } else if (survey.points >= 200) {
      return { category: 'surveys', type: 'standard-survey', label: 'Standard Surveys' };
    } else {
      return { category: 'tasks', type: 'quick-task', label: 'Quick Tasks' };
    }
  };

  // Create dynamic provider cards from BitLabs surveys
  const createDynamicProviders = () => {
    if (!bitlabsSurveys || bitlabsSurveys.length === 0) return [];

    const grouped = {};
    bitlabsSurveys.forEach(survey => {
      const { category, type, label } = categorizeSurvey(survey);
      if (!grouped[type]) {
        grouped[type] = { category, type, label, surveys: [] };
      }
      grouped[type].surveys.push(survey);
    });

    return Object.values(grouped).map((group, idx) => {
      const minPts = Math.min(...group.surveys.map(s => s.points));
      const maxPts = Math.max(...group.surveys.map(s => s.points));

      let icon = FileText;
      let color = 'bg-indigo-600';

      if (group.type === 'quick-task') {
        icon = Clock;
        color = 'bg-teal-500';
      } else if (group.type === 'premium-survey') {
        color = 'bg-violet-600';
      }

      return {
        id: `dynamic-${group.type}`,
        name: group.label,
        category: group.category,
        icon,
        color,
        description: `${group.surveys.length} Available tasks`,
        payout: `${minPts}-${maxPts} pts`,
        tasks: group.surveys.map(survey => ({
          id: `survey-${survey.id}`,
          name: `${survey.loi} minute Task`,
          description: `Earn ${survey.points} points upon completion`,
          points: survey.points,
          pointsDisplay: `${survey.points} pts`,
          link: survey.link,
          isOfferwall: false,
          isDynamicSurvey: true
        }))
      };
    });
  };

  const allProviders = [...staticProviders, ...createDynamicProviders()];

  // Clean professional category labels with icons
  const categories = [
    { id: 'all', label: 'All', icon: Target },
    { id: 'ads', label: 'Quick Earn', icon: Zap },
    { id: 'surveys', label: 'Surveys', icon: Search },
    { id: 'tasks', label: 'Tasks', icon: Clock },
    { id: 'offers', label: 'Offers', icon: Gift },
  ];

  // Create a flat list of all tasks from all providers
  const allTasks = allProviders.flatMap(provider =>
    provider.tasks.map(task => ({
      ...task,
      provider: provider,
      // For categorization: use task category if it exists (for dynamic ones), otherwise use provider category
      displayCategory: task.isDynamicSurvey ? (task.points >= 200 ? 'surveys' : 'tasks') : provider.category
    }))
  );

  // Group the flat tasks by category for display
  const displayGroups = categories.filter(c => c.id !== 'all').map(cat => {
    const tasks = allTasks.filter(t => t.displayCategory === cat.id);
    return { ...cat, tasks };
  }).filter(group => group.tasks.length > 0);

  const finalDisplay = activeCategory === 'all'
    ? displayGroups
    : displayGroups.filter(g => g.id === activeCategory);

  // Helper: Save daily completed task
  const saveDailyTask = (taskKey) => {
    const todayKey = `mita_daily_tasks_${getTodayString()}`;
    const newSet = new Set([...dailyCompletedTasks, taskKey]);
    setDailyCompletedTasks(newSet);
    localStorage.setItem(todayKey, JSON.stringify([...newSet]));
  };

  // Helper: Check if task is completed today
  const isTaskCompletedToday = (taskKey) => {
    return dailyCompletedTasks.has(taskKey);
  };

  const handleTask = async (provider, task) => {
    const taskKey = `${provider.id}-${task.id}`;
    if (processingTask) return;

    // Check if daily mission already completed (for non-offerwall tasks)
    if (!task.isOfferwall && !task.isDynamicSurvey && isTaskCompletedToday(taskKey)) {
      toast.info('You\'ve already completed this task today. Come back tomorrow!', {
        title: 'Already Claimed',
        duration: 5000,
      });
      return;
    }

    setProcessingTask(taskKey);

    try {
      if (task.isDynamicSurvey) {
        // Open dynamic survey link in-app
        setIframeLoading(true);
        setIframeUrl(task.link);
      } else if (task.isOfferwall) {
        openOfferwall(provider.id);
      } else {
        // Direct tasks (Monetag)
        if (task.id === 'push') {
          await handlePushNotification(provider, task);
        } else {
          try {
            const result = await api.completeTask(provider.id, task.id, task.points);
            if (result.success) {
              // Mark as completed for today
              saveDailyTask(taskKey);
              setCompletedTasks(prev => new Set([...prev, taskKey]));
              await refreshUser();
              toast.success(`+${result.earned} points earned!`, {
                title: 'Task Completed',
                duration: 5000,
              });

              // Open Monetag link in-app
              const monetagUrl = `https://otieu.com/4/10505263?subid=${user.id}&type=${task.id}`;
              setIframeLoading(true);
              setIframeUrl(monetagUrl);
            } else if (result.error) {
              // Check if it's a daily limit error
              if (result.dailyLimitReached) {
                saveDailyTask(taskKey); // Also save locally to prevent future attempts
                toast.info(result.error, {
                  title: 'Daily Limit Reached',
                  duration: 6000,
                });
              } else {
                toast.warning(result.error, {
                  title: 'Please Wait',
                  duration: 5000,
                });
              }
            }
          } catch (err) {
            // Handle network or thrown errors gracefully
            const errorMsg = err.message || 'Failed to complete task';
            toast.warning(errorMsg, {
              title: 'Try Again',
              duration: 5000,
            });
          }
        }
      }
    } catch (error) {
      console.error('Task error:', error);
      // Don't show another error toast if already handled
    } finally {
      setProcessingTask(null);
    }
  };

  const handlePushNotification = async (provider, task) => {
    const taskKey = `${provider.id}-${task.id}`;

    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          try {
            const result = await api.completeTask(provider.id, task.id, task.points);
            if (result.success) {
              // Mark as completed for today
              saveDailyTask(taskKey);
              setCompletedTasks(prev => new Set([...prev, taskKey]));
              await refreshUser();

              // Enable Monetag ads now that push is enabled
              setPushEnabled(true);
              localStorage.setItem('mita_push_enabled', 'true');

              toast.success(`+${task.points} points earned! More offers unlocked.`, {
                title: 'Notifications Enabled',
                duration: 5000,
              });
            } else if (result.error) {
              // Handle specific error (like already completed)
              if (result.dailyLimitReached) {
                saveDailyTask(taskKey);
              }
              toast.info(result.error, {
                title: 'Already Claimed',
                duration: 5000,
              });
              // Still enable push since permission was granted
              setPushEnabled(true);
              localStorage.setItem('mita_push_enabled', 'true');
            }
          } catch (err) {
            const errorMsg = err.message || 'Failed to complete task';
            toast.warning(errorMsg, {
              title: 'Task Status',
              duration: 5000,
            });
            // Still enable push since permission was granted
            setPushEnabled(true);
            localStorage.setItem('mita_push_enabled', 'true');
          }
        } else {
          toast.warning('Please enable notifications in your browser settings.', {
            title: 'Permission Required',
            duration: 5000,
          });
        }
      } else {
        toast.error('Your browser does not support notifications.', {
          title: 'Not Supported',
        });
      }
    } catch (error) {
      console.error('Push notification error:', error);
      toast.error('Failed to enable notifications. Please try again.', {
        title: 'Error',
      });
    }
  };

  const openOfferwall = (provider) => {
    // Original URLs untuk fallback
    const directUrls = {
      cpx: `https://offers.cpx-research.com/index.php?app_id=${process.env.NEXT_PUBLIC_CPX_APP_ID}&ext_user_id=${user.id}`,
      timewall: `https://timewall.io/offer?pub=${process.env.NEXT_PUBLIC_TIMEWALL_PUB_ID}&user_id=${user.id}`,
      lootably: `https://wall.lootably.com/?placementID=${process.env.NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID}&userID=${user.id}`,
      revlum: `https://revlum.com/offerwall/${process.env.NEXT_PUBLIC_REVLUM_APP_ID}?user_id=${user.id}`,
      theoremreach: `https://theoremreach.com/respondent_entry/direct?api_key=${process.env.NEXT_PUBLIC_THEOREMREACH_APP_ID}&user_id=${user.id}&transaction_id=${Date.now()}`,
      adgem: `https://api.adgem.com/v1/wall?appid=${process.env.NEXT_PUBLIC_ADGEM_APP_ID}&player_id=${user.id}`,
    };

    if (directUrls[provider]) {
      // Try proxy endpoint first untuk maximum in-app experience
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const proxyUrl = `${backendUrl}/api/proxy/offerwall/${provider}?user_id=${user.id}`;
      
      console.log(`[Tasks] Opening ${provider} via proxy:`, proxyUrl);
      
      setIframeLoading(true);
      setIframeError(false);
      setIframeUrl(proxyUrl);
      
      // Store direct URL untuk fallback
      window._directTaskUrl = directUrls[provider];
      window._currentProvider = provider;
      
      // Set timeout untuk auto-fallback jika proxy gagal
      setTimeout(() => {
        if (iframeLoading) {
          console.warn('[Iframe] Taking too long to load via proxy');
        }
      }, 8000);
      
      toast.info('Opening task wall via secure connection...', {
        title: 'Loading Task',
        duration: 2000,
      });
    } else {
      toast.warning('This task is not available right now. Please try again later.', {
        title: 'Task Unavailable',
      });
    }
  };

  // Function to open task in controlled popup as fallback
  const openInPopup = (url) => {
    // Close previous popup if exists
    if (taskWindow && !taskWindow.closed) {
      taskWindow.close();
    }

    // Open in popup with specific size
    const width = 800;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      url,
      'MitaTask',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,menubar=no,toolbar=no,location=no`
    );
    
    if (popup) {
      setTaskWindow(popup);
      
      // Monitor popup
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          setTaskWindow(null);
          // Refresh user balance when popup closes
          refreshUser();
          toast.info('Task window closed. Checking for updates...', {
            title: 'Task Complete',
            duration: 3000,
          });
        }
      }, 1000);
      
      toast.success('Task opened in new window. Complete the task and close when done.', {
        title: 'Task Window Opened',
        duration: 4000,
      });
    } else {
      toast.error('Please allow popups for this site to complete tasks.', {
        title: 'Popup Blocked',
        duration: 5000,
      });
    }
  };

  return (
    <>
      {/* Monetag Script - Only loaded in production after push notification is enabled */}
      {pushEnabled && isProduction && (
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="207649"
          strategy="afterInteractive"
          data-cfasync="false"
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-800">Earn Points</h1>
            <p className="text-sm text-gray-500">Complete tasks to earn rewards</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === cat.id
                    ? 'bg-[#042C71] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#042C71]'
                    }`}
                >
                  <CatIcon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Daily tasks reset at midnight. Complete all available tasks each day for maximum earnings.
              </p>
            </div>
          </div>

          {loadingSurveys && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Checking for new tasks...</p>
            </div>
          )}

          <div className="space-y-6">
            {finalDisplay.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#042C71] rounded-lg flex items-center justify-center">
                        <GroupIcon className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{group.label}</h3>
                        <p className="text-xs text-gray-500">Pilih tugas yang tersedia di bawah ini</p>
                      </div>
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {group.tasks.length} Tersedia
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {group.tasks.map((task) => {
                      const provider = task.provider;
                      const taskKey = `${provider.id}-${task.id}`;
                      const isCompleted = completedTasks.has(taskKey);
                      const isCompletedToday = dailyCompletedTasks.has(taskKey);
                      const isProcessing = processingTask === taskKey;
                      const isDailyMission = !task.isOfferwall && !task.isDynamicSurvey;
                      const TaskIcon = task.taskIcon || ChevronRight;

                      return (
                        <button
                          key={taskKey}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleTask(provider, task);
                          }}
                          disabled={isProcessing}
                          className={`w-full p-4 flex items-center gap-3 transition text-left
                            ${isCompletedToday && isDailyMission
                              ? 'bg-gray-50 opacity-60'
                              : 'hover:bg-gray-50'
                            }
                          `}
                        >
                          {/* Task Icon */}
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                            ${isCompletedToday && isDailyMission ? 'bg-gray-200' : 'bg-gray-100'}
                          `}>
                            <TaskIcon size={18} className={isCompletedToday && isDailyMission ? 'text-gray-400' : 'text-gray-600'} />
                          </div>

                          {/* Task Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800 truncate">{task.name}</p>
                              {isDailyMission && (
                                <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex-shrink-0">
                                  1x/day
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
                          </div>

                          {/* Status / Points */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isCompletedToday && isDailyMission ? (
                              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full">
                                <CheckCircle size={12} />
                                Done
                              </span>
                            ) : isCompleted ? (
                              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                                <CheckCircle size={16} />
                              </span>
                            ) : isProcessing ? (
                              <span className="text-xs text-gray-500 animate-pulse">Loading...</span>
                            ) : (
                              <>
                                <span className="text-sm font-semibold text-[#042C71]">{task.pointsDisplay}</span>
                                <ChevronRight size={16} className="text-gray-400" />
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {finalDisplay.length === 0 && !loadingSurveys && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center mt-4">
              <p className="text-gray-500">No tasks currently available in this category.</p>
              <button
                onClick={() => setActiveCategory('all')}
                className="text-blue-600 font-medium mt-2 hover:underline"
              >
                Show all categories
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Rewards are subject to verification by providers.
              <br />
              Need help? Contact support via the settings page.
            </p>
          </div>
        </div>
      </div >

      {/* In-App Task Modal */}
      {iframeUrl && (
        <div className="fixed inset-0 z-[1003] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full h-full md:max-w-4xl md:h-[90vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm z-30">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#042C71] rounded-lg flex items-center justify-center">
                  <Target className="text-white" size={14} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-xs md:text-sm">Mita Secure Task</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Verifikasi Aktif • Aman di dalam App</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIframeLoading(true);
                    // Force iframe reload by updating key
                    const currentUrl = iframeUrl;
                    setIframeUrl(null);
                    setTimeout(() => setIframeUrl(currentUrl), 100);
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                  title="Refresh Task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                </button>
                <button
                  onClick={() => {
                    setIframeUrl(null);
                    setIframeLoading(false);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                  title="Tutup Task"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Iframe Container with Shifting Logic to hide headers */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center relative overflow-hidden">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-[30] bg-white">
                  <div className="flex flex-col items-center animate-pulse">
                    <div className="w-16 h-16 bg-[#042C71]/10 rounded-2xl flex items-center justify-center mb-4">
                      <Target className="text-[#042C71]" size={32} />
                    </div>
                    <h4 className="font-bold text-gray-800">Menyiapkan Tugas...</h4>
                    <p className="text-xs text-gray-400 mt-1">Sesi terenkripsi sedang dibangun</p>
                  </div>
                </div>
              )}

              {/* Branding Overlay to mask top areas if shifting isn't enough */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#042C71] to-blue-500 z-[25]"></div>

              <div className="w-full h-full relative z-20 overflow-hidden">
                {iframeError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white p-8">
                    <div className="max-w-md text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Silahkan Klik Button Buka di Window Baru</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Task akan dibuka di window terpisah dengan tracking yang aman.
                      </p>
                      <button
                        onClick={() => {
                          // Use stored direct URL or fallback to current iframeUrl
                          const targetUrl = window._directTaskUrl || iframeUrl;
                          openInPopup(targetUrl);
                          setIframeUrl(null);
                          setIframeError(false);
                        }}
                        className="bg-[#042C71] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#042C71]/90 transition"
                      >
                        Buka di Window Baru
                      </button>
                      <p className="text-xs text-gray-500 mt-3 mb-2">
                        {/* ✓ Revenue share tetap aman<br/> */}
                        ✓ Poin otomatis masuk setelah selesai
                      </p>
                      <button
                        onClick={() => {
                          setIframeUrl(null);
                          setIframeError(false);
                          setIframeLoading(false);
                        }}
                        className="mt-2 text-sm text-gray-500 hover:text-gray-700 block w-full"
                      >
                        Kembali ke Daftar Task
                      </button>
                    </div>
                  </div>
                ) : (
                  <iframe
                    key={iframeUrl}
                    src={iframeUrl}
                    className="w-full h-full border-none"
                    title="Task Content"
                    sandbox="allow-forms allow-scripts allow-same-origin allow-modals allow-popups allow-popups-to-escape-sandbox"
                    referrerPolicy="no-referrer"
                    allow="camera; microphone; geolocation; accelerometer; gyroscope; magnetometer"
                    onLoad={(e) => {
                      try {
                        // Check if iframe content is accessible (not blocked by X-Frame-Options)
                        const iframe = e.target;
                        setTimeout(() => {
                          try {
                            // Try to access iframe content
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                            if (!iframeDoc) {
                              throw new Error('Cannot access iframe content');
                            }
                            setIframeLoading(false);
                            console.log('[Iframe] Loaded successfully');
                          } catch (err) {
                            // Iframe is blocked by X-Frame-Options or CORS
                            console.warn('[Iframe] Blocked by provider:', err.message);
                            setIframeError(true);
                            setIframeLoading(false);
                            toast.warning('Provider memblokir iframe. Gunakan popup window.', {
                              title: 'Iframe Blocked',
                              duration: 4000,
                            });
                          }
                        }, 1000);
                      } catch (err) {
                        console.error('[Iframe] Error checking load:', err);
                        setTimeout(() => setIframeLoading(false), 800);
                      }
                    }}
                    onError={(e) => {
                      console.error('[Iframe] Load error:', e);
                      setIframeError(true);
                      setIframeLoading(false);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Verification Footer */}
            <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-gray-500 font-medium">Auto-Verification Active</span>
              </div>
              <div className="text-[10px] text-gray-400">
                Poin akan ditambahkan setelah sistem mendeteksi penyelesaian tugas.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
