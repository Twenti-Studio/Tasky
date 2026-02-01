'use client';

import {
  CheckCircle,
  ChevronRight,
  Clock,
  Coins,
  FileText,
  Gift,
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
          console.log('[Tasks] BitLabs surveys loaded:', response.surveys.length);
        } else if (response.error) {
          console.warn('[Tasks] BitLabs API returned error:', response.error);
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

  // Static providers (Ads and existing networks)
  const staticProviders = [
    {
      id: 'monetag',
      name: 'Ad Network',
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
      name: 'Survey Network',
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
          points: 0,
          pointsDisplay: 'High rewards',
          isOfferwall: true,
        },
      ],
    },
    {
      id: 'timewall',
      name: 'Task Platform',
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
      name: 'Entertainment Hub',
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
      name: 'Multi-Task Hub',
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
        id: `bitlabs-${group.type}`,
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
          isBitLabs: true
        }))
      };
    });
  };

  const allProviders = [...staticProviders, ...createDynamicProviders()];

  const categories = [
    { id: 'all', label: 'All Tasks' },
    { id: 'ads', label: 'Ads' },
    { id: 'surveys', label: 'Surveys' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'offers', label: 'Offers' },
  ];

  const filteredProviders = activeCategory === 'all'
    ? allProviders
    : allProviders.filter(p => p.category === activeCategory);

  const handleTask = async (provider, task) => {
    const taskKey = `${provider.id}-${task.id}`;
    if (processingTask) return;

    setProcessingTask(taskKey);

    try {
      if (task.isBitLabs) {
        // Open dynamic survey link directly
        window.open(task.link, '_blank', 'width=800,height=600');
      } else if (task.isOfferwall) {
        openOfferwall(provider.id);
      } else {
        // Direct tasks (Monetag)
        if (task.id === 'push') {
          await handlePushNotification(provider, task);
        } else {
          const result = await api.completeTask(provider.id, task.id, task.points);
          if (result.success) {
            setCompletedTasks(prev => new Set([...prev, taskKey]));
            await refreshUser();
            alert(`🎉 Task completed! +${result.earned} points earned!`);

            // Open Monetag link
            const monetagUrl = `https://otieu.com/4/10505263?subid=${user.id}&type=${task.id}`;
            window.open(monetagUrl, '_blank');
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
        }
      }
    } catch (error) {
      console.error('Push notification error:', error);
    }
  };

  const openOfferwall = (provider) => {
    const urls = {
      cpx: `https://offers.cpx-research.com/index.php?app_id=${process.env.NEXT_PUBLIC_CPX_APP_ID}&ext_user_id=${user.id}`,
      timewall: `https://timewall.io/offer?pub=${process.env.NEXT_PUBLIC_TIMEWALL_PUB_ID}&user_id=${user.id}`,
      lootably: `https://wall.lootably.com/?placementID=${process.env.NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID}&userID=${user.id}`,
      revlum: `https://revlum.com/offerwall/${process.env.NEXT_PUBLIC_REVLUM_APP_ID}?user_id=${user.id}`,
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
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Earn Points</h1>
          <p className="text-sm text-gray-500">Complete tasks to earn rewards</p>
        </div>

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

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Points are credited after task completion.
            Tasks are categorized by type for your convenience.
          </p>
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
                    const isProcessing = processingTask === taskKey;

                    return (
                      <button
                        key={task.id}
                        onClick={() => handleTask(provider, task)}
                        disabled={isCompleted || isProcessing}
                        className="w-full p-4 flex items-center justify-between transition hover:bg-blue-50/30 text-left disabled:opacity-60"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{task.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                              <CheckCircle size={16} />
                              Done
                            </span>
                          ) : isProcessing ? (
                            <span className="text-sm text-gray-500 animate-pulse">Processing...</span>
                          ) : (
                            <>
                              <span className="text-sm font-bold text-[#042C71]">{task.pointsDisplay}</span>
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
    </div>
  );
}
