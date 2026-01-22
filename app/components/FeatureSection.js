import { ClipboardList, Wallet, Zap } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col items-center text-center">
    <div className="bg-blue-50 p-4 rounded-full mb-4">
      <Icon className="w-8 h-8 text-[#042C71]" />
    </div>
    <h3 className="text-xl font-bold text-[#042C71] mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function FeatureSection() {
  const features = [
    {
      icon: ClipboardList,
      title: "High-Paying Surveys",
      description: "Participate in premium market research and get rewarded for your valuable opinions."
    },
    {
      icon: Wallet,
      title: "Fast E-Wallet Withdrawals",
      description: "Quick payouts directly to your favorite local e-wallets. No hidden fees."
    },
    {
      icon: Zap,
      title: "Daily Bonus Points",
      description: "Get rewarded just for checking in every day. Consistency pays off."
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#042C71] mb-4">What to Expect</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We are building a platform that values your time and effort. Here is a sneak peek at what&apos;s coming.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
