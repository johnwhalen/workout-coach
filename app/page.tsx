"use client";

import { useEffect, useState } from "react";

import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

import { ArrowRight, BarChart3, Brain, Calendar, MessageCircle, TrendingUp, Zap, Anchor, Dumbbell } from "lucide-react";
import { GoldenHarborCrest } from "@/components/GoldenHarborCrest";

const Home = () => {
    const [prompt, setPrompt] = useState("");
    const [user, setUser] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const adduser = async () => {
        try {
            const response = await axios.post("/api/user/createuser");
            if (response.data?.data?.user_id) {
                setUser(response.data.data.user_id);
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        } catch (error: any) {
            setIsLoggedIn(false);
            toast.error("");
        }
    };
    const runprocessor = async () => {
        try {
            const resp = await axios.post("/api/handler", { prompt, user });
            console.log(resp);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        adduser();
    }, []);
    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative">
            {/* Dynamic background elements - gold/navy theme */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-900/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl animate-pulse delay-700"></div>
                <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-blue-800/20 rounded-full blur-2xl animate-pulse delay-300"></div>
            </div>
            {/* Navigation */}
            <nav className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <GoldenHarborCrest size={44} />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-amber-400">Golden Harbor</span>
                            <span className="text-xs text-gray-400 -mt-1">Workout Coach</span>
                        </div>
                    </div>
                    <Link
                        href={isLoggedIn ? "/chat" : "/login"}
                        className="group px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-full transition-all duration-300 shadow-lg font-medium flex items-center space-x-2"
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
                        <div className="inline-flex items-center space-x-2 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-2 mb-8">
                            <Anchor className="w-4 h-4 text-amber-400" />
                            <span className="text-sm text-amber-200">Your Personal Training Harbor</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 lg:mb-6 leading-tight">
                            <span className="text-amber-400">Golden Harbor</span>
                            <br />
                            <span className="text-white">Workout Coach</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-300 mb-6 lg:mb-8 max-w-lg leading-relaxed">
                            Your AI-powered personal training companion. Progressive overload recommendations,
                            adaptive workouts based on how you're feeling, and smart tracking that learns your patterns.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-8">
                            <Link
                                href={isLoggedIn ? "/chat" : "/login"}
                                className="group px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl lg:rounded-2xl transition-all duration-300 shadow-xl lg:shadow-2xl font-semibold text-base lg:text-lg flex items-center justify-center space-x-2 lg:space-x-3"
                            >
                                <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
                                <span>Start Your Workout</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-6 text-gray-400">
                            <div className="flex items-center space-x-2">
                                <Dumbbell className="w-5 h-5 text-amber-400" />
                                <span className="text-sm">135 sets imported</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                <span className="text-sm">Progress tracking</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-center">
                        <GoldenHarborCrest size={320} className="opacity-80" />
                    </div>
                </div>
            </section>

            {/* Features with Real Benefits */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
                <div className="text-center mb-10 lg:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 text-white">
                        Your <span className="text-amber-400">Personal</span> Training System
                    </h2>
                    <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
                        AI-powered coaching that adapts to your energy, tracks your progress, and helps you build strength
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {[
                        {
                            icon: Brain,
                            title: "Pre-Workout Check-In",
                            description:
                                'Tell your coach how you\'re feeling - tired, energized, or somewhere in between. Intensity adjusts automatically.',
                            benefit: "Workouts that match your energy",
                        },
                        {
                            icon: TrendingUp,
                            title: "Progressive Overload",
                            description: 'Smart weight recommendations based on your last performance. +2.5-5 lbs when you\'re ready.',
                            benefit: "Build strength systematically",
                        },
                        {
                            icon: Zap,
                            title: "Return-to-Training Mode",
                            description:
                                "Coming back after a break? Start at 50% and build back safely with guided progression.",
                            benefit: "Safe comeback protocol",
                        },
                        {
                            icon: Calendar,
                            title: "Superset Structure",
                            description: "Full-body workouts with efficient superset pairings: Bench + Rows, Squats + RDLs, and more.",
                            benefit: "Efficient 2-3x per week training",
                        },
                        {
                            icon: BarChart3,
                            title: "Progress Charts",
                            description: "Visual weight progression, personal records, and consistency tracking over time.",
                            benefit: "See your gains clearly",
                        },
                        {
                            icon: MessageCircle,
                            title: "Natural Conversation",
                            description: '"Did 3 sets of bench at 25 lbs, felt easy" - your coach understands and logs everything.',
                            benefit: "Just talk, don't fill forms",
                        },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-xl lg:rounded-2xl p-6 lg:p-8 hover:bg-slate-800/60 transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10"
                        >
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                            </div>
                            <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 text-white">{feature.title}</h3>
                            <p className="text-gray-300 text-sm lg:text-base mb-3 lg:mb-4 leading-relaxed">
                                {feature.description}
                            </p>
                            <div className="text-xs lg:text-sm text-amber-400 font-medium">→ {feature.benefit}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Equipment Section */}
            <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
                <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Your Equipment</h3>
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-3xl mb-2">🚣</div>
                            <div className="text-amber-400 font-medium">Hydrow</div>
                            <div className="text-gray-400 text-sm">Rowing warm-up</div>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">🏋️</div>
                            <div className="text-amber-400 font-medium">Dumbbells</div>
                            <div className="text-gray-400 text-sm">Up to 55 lbs</div>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">🛋️</div>
                            <div className="text-amber-400 font-medium">Adj. Bench</div>
                            <div className="text-gray-400 text-sm">Incline & Decline</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
                <div className="bg-gradient-to-br from-slate-800/60 to-blue-900/30 backdrop-blur-lg border border-amber-500/20 rounded-2xl lg:rounded-3xl p-8 lg:p-12 text-center">
                    <GoldenHarborCrest size={80} className="mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 text-white">
                        Ready to <span className="text-amber-400">Train</span>?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 mb-6 lg:mb-8 max-w-2xl mx-auto">
                        Your workout history is loaded. Your coach is ready. Let's build some strength.
                    </p>
                    <Link
                        href={isLoggedIn ? "/chat" : "/login"}
                        className="inline-flex items-center space-x-2 lg:space-x-3 px-6 lg:px-10 py-3 lg:py-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl lg:rounded-2xl transition-all duration-300 shadow-xl lg:shadow-2xl font-bold text-lg lg:text-xl group"
                    >
                        <Dumbbell className="w-6 h-6 lg:w-7 lg:h-7 group-hover:scale-110 transition-transform" />
                        <span>Start Today's Workout</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-800 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-3 mb-6 md:mb-0">
                            <GoldenHarborCrest size={32} />
                            <span className="text-xl font-bold text-amber-400">Golden Harbor</span>
                        </div>
                        <p className="text-gray-400 text-sm text-center md:text-right">
                            © 2026 Golden Harbor Workout Coach
                            <br />
                            <span className="text-amber-400">Center Harbor Road</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
