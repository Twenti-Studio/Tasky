"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Simulate API call
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm text-center animate-fade-in">
        <h3 className="text-xl font-bold text-white mb-2">Thank you for joining our waitlist!</h3>
        <p className="text-blue-100 mb-4">We&apos;ll notify you as soon as we launch.</p>
        <button 
          onClick={() => { setIsSubmitted(false); setEmail(""); }}
          className="text-sm text-orange-400 hover:text-orange-300 underline underline-offset-4"
        >
          Join with another email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-grow">
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE4912] transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-red-300 text-sm mt-2 ml-1">{error}</p>}
        </div>
        <button
          type="submit"
          className="bg-[#CE4912] hover:bg-[#b03d0f] text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 whitespace-nowrap shadow-lg"
        >
          Join Waitlist
        </button>
      </form>
    </div>
  );
}
