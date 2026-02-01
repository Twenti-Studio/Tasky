'use client';

import {
  CheckCircle,
  ChevronRight,
  Clock,
  Coins,
  FileText,
  Gift,
  Star,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function TasksPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [processingTask, setProcessingTask] = useState(null);
  const [bitlabsSurveys, setBitlabsSurveys] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);

  // Fetch BitLabs surveys from API
  useEffect(() => {
    const fetchBitlabsSurveys = async () => {
      if (!user || authLoading) return;

      try {
        setLoadingSurveys(true);
        const response = await api.getBitlabsSurveys();
        if (response.success && response.surveys) {
          setBitlabsSurveys(response.surveys);
          console.log('[BitLabs] Loaded', response.surveys.length, 'surveys');
        }
      } catch (error) {
        console.error('[BitLabs] Error fetching surveys:', error);
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

  // Offerwall providers data - only points, no currency
  const providers = [
    {
      id: 'monetag',
      name: 'Monetag',
      category: 'ads',
      icon: Zap,
      color: 'bg-blue-500',
      description: 'Quick ad tasks',
      payout: '10-50 pts',
      tasks: [
        {
          id: 'push',
          name: 'Push Notification',
          description: 'Enable notifications',
          points: 10,
          pointsDisplay: '~10 pts',
        },
        {
          id: 'smartlink',
          name: 'Direct Link',
          description: 'Visit sponsored page',
          points: 49,
          pointsDisplay: '~49 pts',
        },
        {
          id: 'popunder',
          name: 'Pop Ad',
          description: 'View ad content',
          points: 31,
          pointsDisplay: '~31 pts',
        },
      ],
    },
    {
      id: 'cpx',
      name: 'CPX Research',
      category: 'surveys',
      icon: FileText,
      color: 'bg-purple-500',
      description: 'Premium surveys',
      payout: '200-5000 pts',
      tasks: [
        {
          id: 'survey',
          name: 'Surveys',
          description: 'Complete market research',
          points: 0, // Variable, handled by callback
          pointsDisplay: 'High rewards',
          isOfferwall: true,
        },
      ],
    },
    {
      id: 'bitlabs',
      name: 'BitLabs',
      category: 'surveys',
      icon: Star,
      color: 'bg-orange-500',
      description: 'Surveys & offers',
      payout: '200-3000 pts',
      tasks: [
        {
          id: 'offerwall',
          name: 'Offerwall',
          description: 'Surveys and app offers',
          points: 0,
          pointsDisplay: 'Varies',
          isOfferwall: true,
        },
      ],
    },
    {
      id: 'timewall',
      name: 'TimeWall',
      category: 'tasks',
      icon: Clock,
      color: 'bg-green-500',
      description: 'Micro tasks',
      payout: '50-500 pts',
      tasks: [
        {
          id: 'microtask',
          name: 'Micro Tasks',
          description: 'Web visits, follows, signups',
          points: 0,
          pointsDisplay: 'Medium rewards',
          isOfferwall: true,
        },
      ],
    },
    {
      id: 'lootably',
      name: 'Lootably',
      category: 'offers',
      icon: Gift,
      color: 'bg-pink-500',
      description: 'Video & offers',
      payout: '100-1000 pts',
      tasks: [
        {
          id: 'offers',
          name: 'Offers',
          description: 'Videos, surveys, offers',
          points: 0,
          pointsDisplay: 'Varies',
          isOfferwall: true,
        },
      ],
    },
    {
      id: 'revlum',
      name: 'Revlum',
      category: 'offers',
      icon: Coins,
      color: 'bg-teal-500',
      description: 'Multi-task platform',
      payout: '500-10000 pts',
      tasks: [
        {
          id: 'multitask',
          name: 'Multi Tasks',
          description: 'Surveys, quizzes, app installs',
          points: 0,
          pointsDisplay: 'High rewards',
          isOfferwall: true,
        },
      ],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Tasks' },
    { id: 'ads', label: 'Ads' },
    { id: 'surveys', label: 'Surveys' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'offers', label: 'Offers' },
  ];

  const filteredProviders = activeCategory === 'all'
    ? providers
    : providers.filter(p => p.category === activeCategory);

  // Handle task completion with points crediting
  const handleTask = async (provider, task) => {
    const taskKey = `${provider.id}-${task.id}`;

    if (processingTask) return; // Prevent double-click

    setProcessingTask(taskKey);

    try {
      if (task.isOfferwall) {
        // Open offerwall (points credited via server callback)
        openOfferwall(provider.id);
      } else {
        // For Monetag direct tasks - credit points immediately
        if (task.id === 'push') {
          await handlePushNotification(provider, task);
        } else {
          // Track and complete the task (smartlink and popunder)
          console.log(`[Task] Starting task: ${task.id} with ${task.points} points`);

          const result = await api.completeTask(provider.id, task.id, task.points);

          if (result.success) {
            console.log(`[Task] Success! Earned ${result.earned} points`);
            setCompletedTasks(prev => new Set([...prev, taskKey]));
            await refreshUser();

            // Show success notification
            alert(`🎉 Task completed! +${result.earned} points earned!`);

            // Open the ad link
            const monetagUrl = `https://otieu.com/4/10505263?subid=${user.id}&type=${task.id}`;
            window.open(monetagUrl, '_blank');
          } else {
            console.error('[Task] Failed - no success in result');
            alert('Task completion failed. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Task error:', error);
      alert(error.message || 'Failed to complete task');
    } finally {
      setProcessingTask(null);
    }
  };

  // Handle push notification task
  const handlePushNotification = async (provider, task) => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const result = await api.completeTask(provider.id, task.id, task.points);
          if (result.success) {
            setCompletedTasks(prev => new Set([...prev, `${provider.id}-${task.id}`]));
            await refreshUser();
            alert(`🎉 Task completed! +${task.points} points earned!`);
          }
        } else {
          alert('Please enable notifications to complete this task');
        }
      } else {
        alert('Notifications not supported in this browser');
      }
    } catch (error) {
      console.error('Push notification error:', error);
    }
  };

  const openOfferwall = (provider) => {
    const urls = {
      cpx: `https://offers.cpx-research.com/index.php?app_id=${process.env.NEXT_PUBLIC_CPX_APP_ID || 'YOUR_CPX_APP_ID'}&ext_user_id=${user.id}`,
      bitlabs: `https://web.bitlabs.ai/?token=${process.env.NEXT_PUBLIC_BITLABS_TOKEN || 'YOUR_BITLABS_TOKEN'}&uid=${user.id}`,
      timewall: `https://timewall.io/offer?pub=${process.env.NEXT_PUBLIC_TIMEWALL_PUB_ID || 'YOUR_TIMEWALL_PUB_ID'}&user_id=${user.id}`,
      lootably: `https://wall.lootably.com/?placementID=${process.env.NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID || 'YOUR_LOOTABLY_PLACEMENT_ID'}&userID=${user.id}`,
      revlum: `https://revlum.com/offerwall/${process.env.NEXT_PUBLIC_REVLUM_APP_ID || 'YOUR_REVLUM_APP_ID'}?user_id=${user.id}`,
    };

    if (urls[provider]) {
      window.open(urls[provider], '_blank', 'width=800,height=600');
    } else {
      alert(`${provider} offerwall coming soon!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Earn Points</h1>
          <p className="text-sm text-gray-500">Complete tasks to earn rewards</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === cat.id
                ? 'bg-[#042C71] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#042C71]'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Points are credited after task completion.
            For offerwalls, points arrive via provider callback.
          </p>
        </div>

        {/* Provider Cards */}
        <div className="space-y-4">
          {filteredProviders.map((provider) => {
            const Icon = provider.icon;
            return (
              <div
                key={provider.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Provider Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${provider.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{provider.name}</h3>
                      <p className="text-xs text-gray-500">{provider.description}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {provider.payout}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="divide-y divide-gray-100">
                  {provider.tasks.map((task) => {
                    const taskKey = `${provider.id}-${task.id}`;
                    const isCompleted = completedTasks.has(taskKey);
                    const isProcessing = processingTask === taskKey;

                    return (
                      <button
                        key={task.id}
                        onClick={() => handleTask(provider, task)}
                        disabled={isCompleted || isProcessing}
                        className={`w-full p-4 flex items-center justify-between transition text-left ${isCompleted
                          ? 'bg-green-50'
                          : isProcessing
                            ? 'bg-gray-50 cursor-wait'
                            : 'hover:bg-gray-50'
                          }`}
                      >
                        <div>
                          <p className="font-medium text-gray-800">{task.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle size={16} />
                              Done
                            </span>
                          ) : isProcessing ? (
                            <span className="text-sm text-gray-500">Processing...</span>
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

        {/* Bottom Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Points are credited after provider confirms task completion.
            <br />
            Minimum withdrawal: 5,000 points
          </p>
        </div>
      </div>
    </div>
  );
}
