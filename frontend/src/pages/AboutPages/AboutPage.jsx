import React from 'react';
import { Heart, Home, Activity, Clock, CheckCircle2, Shield, Star, Lightbulb, TrendingUp, ArrowRight, Globe, Mail, Award, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Buttons/Button';
import SectionCursor from '../../components/common/SectionCursor';

// Using placeholders for now, but in a real scenario we'd use optimized assets
import aboutImage1 from '../../assets/about1.png';

const AboutPage = () => {
    const stats = [
        { label: 'Pets Adopted', value: '15k+', icon: Heart },
        { label: 'Partner Rescues', value: '500+', icon: Home },
        { label: 'Success Rate', value: '98%', icon: Activity },
        { label: 'Support', value: '24/7', icon: Clock },
    ];

    const values = [
        {
            title: 'Compassion',
            description: 'We approach every situation with empathy, understanding that life can be unpredictable.',
            icon: Heart,
        },
        {
            title: 'Transparency',
            description: 'Honesty builds trust. We ensure full disclosure in medical and behavioral histories.',
            icon: Shield,
        },
        {
            title: 'Reliability',
            description: 'We connect you with verified service providers who treat your pets like family.',
            icon: CheckCircle2,
        },
        {
            title: 'Excellence',
            description: 'We hold ourselves to the highest standards of animal welfare and digital safety.',
            icon: Star,
        },
        {
            title: 'Innovation',
            description: 'Using technology to solve timeless problems in pet adoption and care.',
            icon: Lightbulb,
        },
        {
            title: 'Impact',
            description: 'We measure our success not in profits, but in lives saved and families created.',
            icon: TrendingUp,
        },
    ];

    const team = [
        {
            name: 'Amelia Stone',
            role: 'Co-founder & CEO',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            description: 'Former shelter director focused on building ethical, adoption-first technology.',
            social: { linkedin: '#', email: '#' }
        },
        {
            name: 'Ravi Patel',
            role: 'Head of Product',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
            description: 'Designs flows that make it easy to adopt, book services, and manage pet care.',
            social: { linkedin: '#', email: '#' }
        },
        {
            name: 'Maria Lopez',
            role: 'Rescue Partnerships',
            image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
            description: 'Supports rescues with dashboards, training, and heart-centered onboarding.',
            social: { linkedin: '#', email: '#' }
        },
        {
            name: 'Leo Kim',
            role: 'Engineering Lead',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
            description: 'Builds reliable infrastructure for seamless bookings and secure rehoming processes.',
            social: { linkedin: '#', email: '#' }
        },
    ];

    const testimonials = [
        {
            text: "The rehoming process was transparent and simple. We felt supported every step of the way before Milo came home.",
            author: "Jordan & Sam",
            role: "Adopted Milo, 2 y/o mixed breed",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
        },
        {
            text: "Managing our pets and applications in one dashboard means we can spend more time caring for animals, not on spreadsheets.",
            author: "Bright Paws Rescue",
            role: 'Rescue partner since 2021',
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
        },
        {
            text: "Finding a trusted vet and groomer on the platform has been a game-changer. It's now our one-stop shop for everything.",
            author: "The Chen Family",
            role: "Loyal Users",
            image: "https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&w=100&q=80"
        }
    ];

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="bg-[#FEF9ED] min-h-screen text-themev2-text overflow-x-hidden">

            {/* Hero Section */}
            <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-5xl mx-auto space-y-8">
                        <SectionCursor text="Our Mission" className="bg-[#C48B28] mx-auto" />

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-black font-logo tracking-tighter text-themev2-text leading-[0.9]"
                        >
                            Connecting Hearts,<br /> Saving Lives
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="text-xl md:text-2xl text-text-secondary font-medium max-w-3xl mx-auto leading-relaxed"
                        >
                            Building a world where every pet has a loving home and every owner has the support they need.
                        </motion.p>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#C48B28]/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#EBC176]/5 rounded-full blur-[120px]" />
                </div>
            </section>

            {/* Stats Section */}
            <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-xl border border-[#EBC176]/20 relative overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative z-10">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center group"
                            >
                                <div className="w-16 h-16 mx-auto bg-[#FEF9ED] rounded-2xl flex items-center justify-center text-[#C48B28] mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <stat.icon size={28} strokeWidth={2} />
                                </div>
                                <div className="text-3xl md:text-4xl font-black font-logo text-themev2-text mb-2 tracking-tight">{stat.value}</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-themev2-text/40">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-700">
                                <img
                                    src={aboutImage1}
                                    alt="Founder with dog"
                                    className="w-full h-[600px] object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            {/* Floating Card */}
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="absolute -bottom-12 -right-12 z-20 bg-white p-8 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-[#EBC176]/20 max-w-sm hidden md:block"
                            >
                                <div className="flex gap-4 mb-4">
                                    <div className="w-12 h-12 bg-[#EBC176]/20 rounded-full flex items-center justify-center text-[#C48B28]">
                                        <Heart size={24} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-themev2-text/40 uppercase tracking-wider">Compassion First</p>
                                        <p className="text-3xl font-black font-logo text-themev2-text">Since 2021</p>
                                    </div>
                                </div>
                                <p className="text-[#6B7280] font-medium leading-relaxed">
                                    "We believe that compassion is a verb. Every feature we build is designed to make kindness easier."
                                </p>
                            </motion.div>

                            <div className="absolute top-12 -left-12 w-64 h-64 bg-dots-pattern opacity-20 -z-10 rounded-full" />
                        </div>

                        <div className="order-1 lg:order-2 space-y-8">
                            <div>
                                <SectionCursor text="Our Story" className="bg-[#C48B28] mb-6" />
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-logo text-themev2-text tracking-tight leading-none mb-4">
                                    From a Neighborhood Network to a Nationwide Movement.
                                </h2>
                            </div>
                            <div className="space-y-6 text-xl text-[#6B7280] leading-relaxed font-medium">
                                <p>
                                    PetCircle began with a simple observation: too many beloved pets were ending up in shelters simply because their owners hit a rough patch and had nowhere else to turn. We set out to change that system entirely.
                                </p>
                                <p>
                                    What started as a small local network has grown into a nationwide movement. We're not just a platform; we're a safety net, a comprehensive service hub, and a trusted partner for ethical rehoming and quality pet care.
                                </p>
                            </div>

                            <div className="pt-8">
                                <Link to="/contact">
                                    <Button variant="outline" className="px-10 py-6 rounded-full text-lg border-2">
                                        Get in Touch <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl -z-10" />
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                        <SectionCursor text="Our Principles" className="bg-[#C48B28] mx-auto" />
                        <h2 className="text-3xl md:text-5xl font-black font-logo text-themev2-text tracking-tight">What Drives Us Forward</h2>
                        <p className="text-lg text-themev2-text/60">Core values that guide every decision we make, from code to community.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-10 rounded-[2.5rem] bg-white border border-[#EBC176]/20 hover:border-[#C48B28]/40 shadow-sm hover:shadow-xl transition-all duration-500"
                            >
                                <div className="w-14 h-14 bg-[#FEF9ED] rounded-2xl flex items-center justify-center text-[#C48B28] mb-8 group-hover:scale-110 transition-transform duration-500 border border-[#EBC176]/20">
                                    <value.icon size={26} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-black font-logo text-themev2-text mb-3 group-hover:text-[#C48B28] transition-colors">{value.title}</h3>
                                <p className="text-sm text-themev2-text/60 font-medium leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                        <div className="max-w-2xl space-y-4">
                            <SectionCursor text="The People" className="bg-[#C48B28]" />
                            <h2 className="text-3xl md:text-5xl font-black font-logo text-themev2-text tracking-tight">Meet Our Team</h2>
                        </div>
                        <Button variant="secondary" className="px-8 py-4 rounded-full border-[#C48B28] text-[#C48B28] hover:bg-[#C48B28] hover:text-white font-bold tracking-widest text-xs uppercase">See All Positions</Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member, index) => (
                            <div key={index} className="group bg-white p-4 rounded-[2.5rem] shadow-sm hover:shadow-xl border border-[#EBC176]/20 transition-all duration-500">
                                <div className="relative mb-6 rounded-[2rem] overflow-hidden aspect-[4/5] bg-gray-100">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <div className="flex gap-3">
                                            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors">
                                                <Globe size={18} />
                                            </button>
                                            <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors">
                                                <Mail size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-2 pb-4">
                                    <h3 className="text-xl font-bold text-[#1F2937] mb-1">{member.name}</h3>
                                    <p className="text-[#C48B28] font-black text-[10px] uppercase tracking-widest mb-3">{member.role}</p>
                                    <p className="text-sm text-[#6B7280] leading-relaxed font-medium">{member.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials (Newly styled) */}
            <section className="py-24 bg-[#5A3C0B] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <SectionCursor text="Testimonials" className="bg-white/20 text-white backdrop-blur-sm" />
                            <h2 className="text-4xl md:text-5xl font-black font-logo tracking-tight">Stories from Our Community</h2>
                            <p className="text-white/60 text-lg">See how PetCircle is changing lives, one connection at a time.</p>
                        </div>
                        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                            {testimonials.map((t, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors">
                                    <div className="flex gap-1 mb-4 text-[#EBC176]">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                    </div>
                                    <p className="text-lg leading-relaxed mb-6 font-medium">"{t.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <img src={t.image} alt={t.author} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20" />
                                        <div>
                                            <p className="font-bold text-sm">{t.author}</p>
                                            <p className="text-xs text-white/50 uppercase tracking-wider">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1600px] mx-auto bg-white rounded-[3rem] p-12 lg:p-24 relative overflow-hidden text-center shadow-2xl border border-[#EBC176]/20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C48B28]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#EBC176]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black font-logo text-themev2-text tracking-tighter leading-none">
                            Ready to Make a Difference?
                        </h2>
                        <p className="text-xl text-themev2-text/60 max-w-2xl mx-auto font-medium">
                            Whether you're looking to adopt, share a pet's story, or support as a partner, PetCircle gives you everything you need.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                            <Link to="/pets">
                                <button className="px-10 py-5 bg-[#C48B28] text-white rounded-full font-black uppercase tracking-widest text-sm hover:bg-[#A9761F] hover:scale-105 transition-all duration-300 shadow-xl shadow-[#C48B28]/20">
                                    Browse Pets
                                </button>
                            </Link>
                            <Link to="/register?type=provider">
                                <button className="px-10 py-5 bg-white border-2 border-[#EBC176]/50 text-[#C48B28] rounded-full font-black uppercase tracking-widest text-sm hover:bg-[#FEF9ED] transition-all duration-300">
                                    Join as Provider
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
