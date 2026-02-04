import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    ArrowRight,
    Heart,
    DollarSign,
    Calendar,
    Sparkles,
    Briefcase,
    ShieldCheck,
    Users,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const BecomeProviderPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleStart = () => {
        navigate('/service-provider/register');
    };

    const benefits = [
        {
            title: "Do What You Love",
            desc: "Whether it's fostering, grooming, or training, build a career around caring for animals.",
            icon: Heart,
            color: "text-[#C48B28]",
            bg: "bg-[#C48B28]/10"
        },
        {
            title: "Earn on Your Terms",
            desc: "Set your own rates and services. Keep 100% of your earnings (we take 0% commission).",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            title: "Flexible Schedule",
            desc: "Manage your availability with our easy tools. Work when you want, where you want.",
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-50"
        }
    ];

    const steps = [
        { title: "Quick Sign Up", desc: "Verify your identity and email to join our trusted community." },
        { title: "Business Profile", desc: "Showcase your expertise, services, and high-quality portfolio." },
        { title: "Set Availability", desc: "Define your working hours and service radius for clients." },
        { title: "Get Approved", desc: "Our team reviews profiles to maintain premium service standards." },
        { title: "Start Earning", desc: "Accept bookings directly and manage your schedule with ease." }
    ];

    return (
        <div className="min-h-screen bg-[#FEF9ED]">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-28">
                {/* Decorative Elements - Simplified to maintain background integrity */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#EBC176]/5 rounded-full -mr-96 -mt-96 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#EBC176]/5 rounded-full -ml-72 -mb-72 blur-3xl" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full border border-[#EBC176]/20 shadow-sm mb-8"
                        >
                            <Sparkles size={16} className="text-[#C48B28] animate-pulse" />
                            <span className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-[0.3em]">Join the Professional Circle</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-[#402E11] tracking-tighter leading-[0.95] mb-8"
                        >
                            Turn Your Passion <br />
                            <span className="text-[#C48B28]">Into a Profession</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-base md:text-lg text-[#402E11]/60 font-bold max-w-xl mx-auto mb-12 leading-relaxed"
                        >
                            Join our network of trusted pet service providers. Connect with thousands of pet owners, set your rates, and grow your business today.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-6"
                        >
                            <button
                                onClick={handleStart}
                                className="w-full sm:w-auto px-10 py-5 bg-[#C48B28] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#C48B28]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Start Your Application <ArrowRight size={16} strokeWidth={3} />
                            </button>
                            <Link to="/how-it-works" className="text-sm font-black text-[#402E11]/40 hover:text-[#402E11] uppercase tracking-[0.2em] transition-colors">
                                Learn More
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Stats/Social Proof Section */}
            <div className="container mx-auto px-6 pb-32">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: 'Verified Partners', value: '500+', icon: ShieldCheck },
                        { label: 'Happy Customers', value: '12k+', icon: Users },
                        { label: 'Commission Fee', value: '0%', icon: DollarSign },
                        { label: 'Average Growth', value: '45%', icon: ArrowUpRight },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/40 backdrop-blur-sm p-8 rounded-[3rem] border border-[#EBC176]/10 shadow-xl shadow-[#402E11]/5 text-center group hover:bg-white transition-all">
                            <stat.icon size={24} strokeWidth={2.5} className="text-[#C48B28] mx-auto mb-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <div className="text-4xl font-black text-[#402E11] tracking-tighter leading-none mb-2">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#402E11]/30">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-[#FAF9F6]/50 py-24 border-y border-[#EBC176]/10">
                <div className="container mx-auto px-6">
                    <div className="max-w-xl mb-20">
                        <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-4 block">Our Advantage</span>
                        <h2 className="text-4xl font-black text-[#402E11] tracking-tight leading-none">
                            Everything you need <br /> to succeed.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white p-10 rounded-[3.5rem] border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5 flex flex-col group"
                            >
                                <div className={`w-16 h-16 rounded-3xl ${benefit.bg} ${benefit.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                    <benefit.icon size={32} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#402E11] tracking-tight mb-4">{benefit.title}</h3>
                                <p className="text-[#402E11]/50 font-bold text-base leading-relaxed">
                                    {benefit.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works - Visual Stepper */}
            <div className="py-32 container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-20">
                    <div className="lg:w-1/3">
                        <div className="sticky top-32">
                            <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-4 block">Onboarding</span>
                            <h2 className="text-5xl font-black text-[#402E11] tracking-tight leading-none mb-8">
                                How it works.
                            </h2>
                            <p className="text-[#402E11]/40 font-bold text-lg leading-relaxed mb-12">
                                We've streamlined the application process to get you live as quickly as possible without sacrificing quality.
                            </p>
                            <div className="p-8 bg-white rounded-[2.5rem] border border-[#EBC176]/20 shadow-xl shadow-[#402E11]/5">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#C48B28]/10 text-[#C48B28] flex items-center justify-center">
                                        <Briefcase size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Application Help</p>
                                        <p className="text-sm font-black text-[#402E11]">support@pcp.com</p>
                                    </div>
                                </div>
                                <p className="text-xs text-[#402E11]/40 font-bold italic">"PCP has helped me reach more clients than any other platform."</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-2/3 space-y-6">
                        {steps.map((step, i) => (
                            <div key={i} className="group relative bg-white p-10 rounded-[3rem] border border-[#EBC176]/10 hover:border-[#C48B28]/40 transition-all flex items-start gap-10 hover:shadow-2xl hover:shadow-[#402E11]/5">
                                <span className="text-7xl font-black text-[#FAF3E0] group-hover:text-[#EBC176]/20 transition-colors leading-none tracking-tighter">
                                    0{i + 1}
                                </span>
                                <div className="pt-2">
                                    <h4 className="text-2xl font-black text-[#402E11] mb-2">{step.title}</h4>
                                    <p className="text-[#402E11]/50 font-bold text-base leading-relaxed">{step.desc}</p>
                                </div>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 rounded-full border border-[#EBC176]/20 flex items-center justify-center text-[#C48B28]">
                                        <CheckCircle2 size={24} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom CTA Section */}
            <div className="container mx-auto px-6 pb-24">
                <div className="bg-[#402E11] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
                    {/* Decorative Shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-[45deg] -translate-x-full group-hover:translate-x-[200%] transition-transform duration-[2000ms] pointer-events-none" />

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-tight">
                            Ready to take <br /> the next step?
                        </h2>
                        <p className="text-white/40 font-bold text-lg mb-12">
                            Our team is ready to help you grow your pet care business. Join the PCP professional circle today.
                        </p>
                        <button
                            onClick={handleStart}
                            className="inline-flex items-center gap-4 px-12 py-[24px] bg-[#C48B28] text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#C48B28]/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            Become a Provider Now <ChevronRight size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BecomeProviderPage;
