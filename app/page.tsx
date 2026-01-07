"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ArrowRight, BarChart3, Brain, MessageCircle, TrendingUp, Dumbbell } from "lucide-react";
import { GoldenHarborCrest } from "@/components/branding/GoldenHarborCrest";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch("/api/users", { method: "POST" });
      const data = await response.json();
      if (data?.data?.user_id) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);
  return (
    <div className="min-h-screen bg-navy-900 text-white overflow-hidden relative">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <GoldenHarborCrest size={44} />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gold">Golden Harbor</span>
              <span className="text-xs text-slate-400 -mt-1">Workout Coach</span>
            </div>
          </div>
          <Link
            href={isLoggedIn ? "/chat" : "/login"}
            className="group px-6 py-3 bg-gold hover:bg-gold/90 text-navy-900 rounded-full transition-all duration-200 font-medium flex items-center space-x-2"
          >
            <span>Start Training</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 mb-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="mt-16 lg:mt-32">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 leading-tight">
              <span className="text-gold">Golden Harbor</span>
              <br />
              <span className="text-white">Workout Coach</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-6 lg:mb-8 max-w-lg leading-relaxed">
              AI-powered training companion. Progressive overload, adaptive workouts, smart
              tracking.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-8">
              <Link
                href={isLoggedIn ? "/chat" : "/login"}
                className="group px-6 lg:px-8 py-3 lg:py-4 bg-gold hover:bg-gold/90 text-navy-900 rounded-xl transition-all duration-200 font-semibold text-base lg:text-lg flex items-center justify-center space-x-2 lg:space-x-3"
              >
                <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                <span>Start Your Workout</span>
              </Link>
            </div>

            <div className="flex items-center space-x-6 text-slate-400">
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-5 h-5 text-gold" />
                <span className="text-sm">Progress tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm">Strength gains</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <GoldenHarborCrest size={280} className="opacity-90" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="text-center mb-10 lg:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Your <span className="text-gold">Training</span> System
          </h2>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto">
            Coaching that adapts to you
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              icon: Brain,
              title: "Check-In",
              description: "Intensity adjusts to how you feel",
            },
            {
              icon: TrendingUp,
              title: "Progressive Overload",
              description: "Smart weight recommendations",
            },
            {
              icon: BarChart3,
              title: "Progress Charts",
              description: "Visual tracking over time",
            },
            {
              icon: MessageCircle,
              title: "Natural Language",
              description: "Just talk, no forms",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative bg-navy-700/60 border border-slate-700/30 rounded-xl p-6 hover:border-gold/30 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-navy-900" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="bg-navy-700/60 border border-slate-700/30 rounded-2xl p-8 lg:p-12 text-center">
          <GoldenHarborCrest size={64} className="mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            Ready to <span className="text-gold">Train</span>?
          </h2>
          <p className="text-lg text-slate-400 mb-6 max-w-xl mx-auto">
            Your coach is ready. Let&apos;s build some strength.
          </p>
          <Link
            href={isLoggedIn ? "/chat" : "/login"}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gold hover:bg-gold/90 text-navy-900 rounded-xl transition-all duration-200 font-semibold text-lg"
          >
            <Dumbbell className="w-5 h-5" />
            <span>Start Workout</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <GoldenHarborCrest size={24} />
              <span className="text-lg font-semibold text-gold">Golden Harbor</span>
            </div>
            <p className="text-slate-400 text-sm">© 2026 Golden Harbor Workout Coach</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
