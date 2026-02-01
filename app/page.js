import Link from "next/link";
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

        {/* Top Navigation */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex gap-3">
            <Link 
              href="/login"
              className="px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg font-medium transition"
            >
              Login
            </Link>
            <Link 
              href="/register"
              className="px-6 py-2 bg-[#CE4912] hover:bg-orange-600 rounded-lg font-medium transition"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-fade-in-up">Mikro Task</h1>
          <p className="text-base md:text-lg text-blue-300/90 font-medium tracking-wide animate-fade-in-up delay-150">
            Powered by Twenti Studio
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight animate-fade-in-up delay-100">
            Earn Money with Simple Tasks
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Join the most trusted micro-task platform in Indonesia. Earn rewards by completing simple tasks, surveys, and watching ads.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Link 
              href="/register"
              className="px-8 py-4 bg-[#CE4912] hover:bg-orange-600 rounded-lg font-bold text-lg transition shadow-lg"
            >
              Get Started Now
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg font-bold text-lg transition"
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <FeatureSection />
    </div>
  );
}
