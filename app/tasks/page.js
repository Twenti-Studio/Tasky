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

  const filteredProviders = activeCategory === 'all'
    ? allProviders
    : allProviders.filter(p => p.category === activeCategory);

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
        // Open dynamic survey link directly
        window.open(task.link, '_blank', 'width=800,height=600');
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

              // Open Monetag link
              const monetagUrl = `https://otieu.com/4/10505263?subid=${user.id}&type=${task.id}`;
              window.open(monetagUrl, '_blank');
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
    const urls = {
      cpx: `https://offers.cpx-research.com/index.php?app_id=${process.env.NEXT_PUBLIC_CPX_APP_ID}&ext_user_id=${user.id}`,
      timewall: `https://timewall.io/offer?pub=${process.env.NEXT_PUBLIC_TIMEWALL_PUB_ID}&user_id=${user.id}`,
      lootably: `https://wall.lootably.com/?placementID=${process.env.NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID}&userID=${user.id}`,
      revlum: `https://revlum.com/offerwall/${process.env.NEXT_PUBLIC_REVLUM_APP_ID}?user_id=${user.id}`,
      theoremreach: `https://theoremreach.com/respondent_entry/direct?api_key=${process.env.NEXT_PUBLIC_THEOREMREACH_APP_ID}&user_id=${user.id}&transaction_id=${Date.now()}`,
    };

    if (urls[provider]) {
      window.open(urls[provider], '_blank', 'width=800,height=600');
      toast.info('Survey wall opened in a new window', {
        title: 'Opening Task...',
        duration: 3000,
      });
    } else {
      toast.warning('This task is not available right now. Please try again later.', {
        title: 'Task Unavailable',
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

          <div className="space-y-4">
            {filteredProviders.map((provider) => {
              const Icon = provider.icon;
              return (
                <div key={provider.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${provider.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{provider.name}</h3>
                        <p className="text-xs text-gray-500">{provider.description}</p>
                      </div>
                      <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {provider.payout}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {provider.tasks.map((task) => {
                      const taskKey = `${provider.id}-${task.id}`;
                      const isCompleted = completedTasks.has(taskKey);
                      const isCompletedToday = dailyCompletedTasks.has(taskKey);
                      const isProcessing = processingTask === taskKey;
                      const isDailyMission = !task.isOfferwall && !task.isDynamicSurvey;
                      const TaskIcon = task.taskIcon || ChevronRight;

                      return (
                        <button
                          key={task.id}
                          onClick={() => handleTask(provider, task)}
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

          {filteredProviders.length === 0 && !loadingSurveys && (
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
    </>
  );
}
