import React, { useState } from 'react';
import { Search, FileText, MessageCircle, Heart, UserPlus, ClipboardCheck, Camera, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
    const [activeTab, setActiveTab] = useState('adopter');

    const adopterSteps = [
        {
            icon: Search,
            title: "1. Search for a Pet",
            description: "Browse our extensive database of pets available for adoption. Filter by species, breed, age, and location to find your perfect match."
        },
        {
            icon: FileText,
            title: "2. Submit an Application",
            description: "Fill out a detailed adopter profile. This helps pet owners understand your lifestyle and home environment to ensure a good fit."
        },
        {
            icon: MessageCircle,
            title: "3. Connect & Meet",
            description: "Chat directly with the current owner. Ask questions, schedule a meet-and-greet, and see if there's a connection."
        },
        {
            icon: Heart,
            title: "4. Welcome Home",
            description: "If it's a match, finalize the adoption! We provide guidance on the transfer process to make it smooth for everyone."
        }
    ];

    const ownerSteps = [
        {
            icon: UserPlus,
            title: "1. Create a Profile",
            description: "Sign up and create a detailed profile for the pet you need to rehome. Include photos, medical history, and personality quirks."
        },
        {
            icon: ClipboardCheck,
            title: "2. Review Applications",
            description: "Receive applications from verified adopters. We help you screen candidates by providing key compatibility insights."
        },
        {
            icon: MessageCircle,
            title: "3. Chat & Vet Candidates",
            description: "Talk to potential adopters safely through our platform. Arrange meetings in neutral locations to gauge compatibility."
        },
        {
            icon: Home,
            title: "4. Rehome with Confidence",
            description: "Select the best home for your pet. Our tools help you manage the handover ensuring your pet goes to a loving forever home."
        }
    ];

    return (
        <div className="bg-[#FEF9ED] min-h-screen text-themev2-text pt-20">
            {/* Hero */}
            <section className="bg-[#C48B28] text-white py-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">How PetCircle Works</h1>
                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                    We've simplified the journey for both pet seekers and owners, ensuring a safe, transparent, and loving process for every animal.
                </p>
            </section>

            {/* Steps Section */}
            <section className="py-20 max-w-7xl mx-auto px-6">
                {/* Tabs */}
                <div className="flex justify-center mb-16">
                    <div className="bg-white p-2 rounded-full shadow-md border border-[#EBC176]/20 inline-flex">
                        <button
                            onClick={() => setActiveTab('adopter')}
                            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'adopter'
                                ? 'bg-[#C48B28] text-white shadow-sm'
                                : 'text-themev2-text/60 hover:bg-[#FEF9ED] hover:text-themev2-text'
                                }`}
                        >
                            I want to Adopt
                        </button>
                        <button
                            onClick={() => setActiveTab('owner')}
                            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'owner'
                                ? 'bg-[#5A3C0B] text-white shadow-sm'
                                : 'text-themev2-text/60 hover:bg-[#FEF9ED] hover:text-themev2-text'
                                }`}
                        >
                            I need to Rehome
                        </button>
                    </div>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {(activeTab === 'adopter' ? adopterSteps : ownerSteps).map((step, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl border border-[#EBC176]/20 shadow-sm hover:shadow-md transition-shadow group">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${activeTab === 'adopter' ? 'bg-[#C48B28]/10 text-[#C48B28]' : 'bg-[#5A3C0B]/10 text-[#5A3C0B]'
                                }`}>
                                <step.icon size={32} />
                            </div>
                            <h3 className={`text-xl font-bold mb-4 transition-colors ${activeTab === 'adopter' ? 'group-hover:text-[#C48B28]' : 'group-hover:text-[#5A3C0B]'}`}>{step.title}</h3>
                            <p className="text-themev2-text/70 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-white border-t border-[#EBC176]/20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-8 text-themev2-text">Ready to start your journey?</h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/pets" className="px-8 py-4 bg-[#C48B28] text-white rounded-full font-bold hover:bg-[#B07212] transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Browse Pets
                        </Link>
                        <Link to="/register" className="px-8 py-4 bg-white border-2 border-[#C48B28] text-[#C48B28] rounded-full font-bold hover:bg-[#FEF9ED] transition">
                            Create Account
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HowItWorksPage;
