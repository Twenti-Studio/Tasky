import Image from "next/image";
import FeatureSection from "./components/FeatureSection";
import WaitlistForm from "./components/WaitlistForm";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#042C71] text-white pt-24 pb-32 px-4 relative overflow-hidden">
        {/* Background Accents (optional for 'fintech' feel) */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-800/20 skew-x-12 transform translate-x-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-fade-in-up">Tasky</h1>
          <p className="text-base md:text-lg text-blue-300/90 font-medium tracking-wide animate-fade-in-up delay-150">
            Powered by Twenti Studio
          </p>

          <span className="inline-block py-1 px-3 rounded-full bg-blue-800/50 border border-blue-700 text-blue-200 text-sm font-medium mb-6 animate-fade-in-up">
            Coming Soon
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight animate-fade-in-up delay-100">
            Something Big is Coming for Your Wallet
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Join the most trusted micro-task platform in Indonesia. Earn rewards by completing simple tasks, high-paying surveys, and watching videos.
          </p>
          
          <div className="flex justify-center animate-fade-in-up delay-300">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <FeatureSection />
    </div>
  );
}
