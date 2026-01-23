'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { 
  Bell, 
  ExternalLink, 
  FileText, 
  Gift, 
  ChevronRight,
  Star,
  Zap,
  Clock,
  DollarSign
} from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#042C71]"></div>
      </div>
    );
  }

  // Offerwall providers data
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
          points: '~10 pts',
          action: () => handlePushNotification(),
        },
        {
          id: 'smartlink',
          name: 'Direct Link',
          description: 'Visit sponsored page',
          points: '~49 pts',
          action: () => handleDirectLink(),
        },
        {
          id: 'popunder',
          name: 'Pop Ad',
          description: 'View ad content',
          points: '~31 pts',
          action: () => handlePopunder(),
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
      payout: '$0.20 - $5.00',
      tasks: [
        {
          id: 'survey',
          name: 'Surveys',
          description: 'Complete market research',
          points: 'High rewards',
          action: () => openOfferwall('cpx'),
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
      payout: '$0.20 - $3.00',
      tasks: [
        {
          id: 'offerwall',
          name: 'Offerwall',
          description: 'Surveys and app offers',
          points: 'Varies',
          action: () => openOfferwall('bitlabs'),
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
      payout: '$0.05 - $0.50',
      tasks: [
        {
          id: 'microtask',
          name: 'Micro Tasks',
          description: 'Web visits, follows, signups',
          points: 'Medium rewards',
          action: () => openOfferwall('timewall'),
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
      payout: '$0.10 - $1.00',
      tasks: [
        {
          id: 'offers',
          name: 'Offers',
          description: 'Videos, surveys, offers',
          points: 'Varies',
          action: () => openOfferwall('lootably'),
        },
      ],
    },
    {
      id: 'revlum',
      name: 'Revlum',
      category: 'offers',
      icon: DollarSign,
      color: 'bg-teal-500',
      description: 'Multi-task platform',
      payout: '$0.50 - $10.00',
      tasks: [
        {
          id: 'multitask',
          name: 'Multi Tasks',
          description: 'Surveys, quizzes, app installs',
          points: 'High rewards',
          action: () => openOfferwall('revlum'),
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

  // Monetag handlers
  const handlePushNotification = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await trackTask('monetag', 'push');
          alert('Push notification enabled! Points will be credited.');
        }
      }
    } catch (error) {
      console.error('Push notification error:', error);
    }
  };

  const handleDirectLink = () => {
    const monetagUrl = `https://otieu.com/4/10505263?subid=${user.id}`;
    trackTask('monetag', 'smartlink');
    window.open(monetagUrl, '_blank');
  };

  const handlePopunder = () => {
    const monetagUrl = `https://otieu.com/4/10505263?subid=${user.id}`;
    trackTask('monetag', 'popunder');
    window.open(monetagUrl, '_blank');
  };

  const trackTask = async (provider, taskType) => {
    try {
      await api.trackImpression(taskType, { provider });
    } catch (error) {
      console.error('Track error:', error);
    }
  };

  const openOfferwall = (provider) => {
    // Open offerwall in new window/iframe
    // You'll need to get the actual URLs from each provider's dashboard
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
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeCategory === cat.id
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
            <span className="font-semibold">💡 Tip:</span> You receive 70% of all earnings. 
            Points are credited automatically after task completion.
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
                  {provider.tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={task.action}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{task.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#042C71]">{task.points}</span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </button>
                  ))}
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
            Minimum withdrawal: 5,000 points (Rp 5,000)
          </p>
        </div>
      </div>
    </div>
  );
}
