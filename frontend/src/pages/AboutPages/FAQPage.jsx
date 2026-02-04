import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
    const faqs = [
        {
            category: "Adoption",
            items: [
                {
                    q: "How much does it cost to adopt?",
                    a: "Adoption fees vary depending on the pet owner. We recommend charging a small rehoming fee to ensure the adopter is serious. PetCircle does not take a commission."
                },
                {
                    q: "Do I need a home check?",
                    a: "Many pet owners will request a home check (virtual or in-person) to ensure their pet is going to a safe environment. We provide guidelines on how to conduct these safely."
                },
                {
                    q: "Can I adopt if I live in an apartment?",
                    a: "Absolutely! Many pets, especially cats and smaller dogs, thrive in apartments. Check the pet's profile for specific housing requirements."
                }
            ]
        },
        {
            category: "Rehoming",
            items: [
                {
                    q: "Is it free to list my pet?",
                    a: "Yes, creating a standard listing on PetCircle is completely free. We believe financial barriers shouldn't prevent you from finding the best home for your pet."
                },
                {
                    q: "How do I know the adopter is good?",
                    a: "We provide comprehensive adopter profiles, verification badges (ID check), and a messaging system so you can vet candidates thoroughly before making a decision."
                },
                {
                    q: "What if it doesn't work out?",
                    a: "We recommend signing our Adoption Agreement which includes a return policy, ensuring the pet comes back to you if the adoption doesn't work out within the first 30 days."
                }
            ]
        },
        {
            category: "Trust & Safety",
            items: [
                {
                    q: "How does PetCircle verify users?",
                    a: "Users can opt-in to verify their identity by uploading a government ID. Look for the 'Verified Badge' on profiles for added trust."
                },
                {
                    q: "Is my data safe?",
                    a: "Yes, we use industry-standard encryption and never share your personal contact details publicly. You control who sees your information."
                }
            ]
        }
    ];

    return (
        <div className="bg-[#FEF9ED] min-h-screen text-themev2-text py-12">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-12">
                    <p className="text-[#C48B28] font-bold uppercase tracking-widest mb-2 text-sm">Support</p>
                    <h1 className="text-4xl font-bold mb-4 font-serif">Frequently Asked Questions</h1>
                    <p className="text-themev2-text/60">Find answers to common questions about adopting and rehoming.</p>
                </div>

                <div className="space-y-8">
                    {faqs.map((section, idx) => (
                        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-[#EBC176]/20 overflow-hidden">
                            <div className="bg-[#FEF9ED]/50 px-6 py-4 border-b border-[#EBC176]/20">
                                <h2 className="font-bold text-lg text-themev2-text">{section.category}</h2>
                            </div>
                            <div className="divide-y divide-[#EBC176]/10">
                                {section.items.map((item, i) => (
                                    <FAQItem key={i} question={item.q} answer={item.a} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center bg-[#C48B28]/5 rounded-2xl p-8 border border-[#C48B28]/10">
                    <HelpCircle className="mx-auto text-[#C48B28] mb-4" size={40} />
                    <h3 className="text-xl font-bold mb-2 text-themev2-text">Still have questions?</h3>
                    <p className="text-themev2-text/60 mb-6">We're here to help you every step of the way.</p>
                    <Link to="/contact" className="px-6 py-3 bg-[#C48B28] text-white rounded-lg font-bold hover:bg-[#B07212] transition inline-block">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#FEF9ED]/30 transition focus:outline-none"
            >
                <span className="font-medium text-themev2-text pr-4">{question}</span>
                {isOpen ? <ChevronUp size={20} className="text-[#C48B28]" /> : <ChevronDown size={20} className="text-[#C48B28]/40" />}
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-6 pb-4 pt-0 text-themev2-text/70 leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
