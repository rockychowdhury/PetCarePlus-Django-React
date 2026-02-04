import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ShieldCheck, Sparkles, Users, FileSignature, MapPin } from 'lucide-react';
import SectionCursor from '../common/SectionCursor';

const FAQSection = () => {
    const faqs = [
        {
            question: "How do I contact pet owners?",
            answer: "Directly via WhatsApp. We've integrated direct messaging so you can reach out securely, share media, and get instant updates.",
            icon: <MessageCircle className="text-[#25D366]" />,
            theme: "bg-[#25D366]/5 border-[#25D366]/10"
        },
        {
            question: "Is my personal data safe?",
            answer: "Yes. Your 'Adopter Wallet' data is encrypted. You only share sensitive details with owners once you choose to apply.",
            icon: <ShieldCheck className="text-[#1a365d]" />,
            theme: "bg-[#1a365d]/5 border-[#1a365d]/10"
        },
        {
            question: "Are adoption fees handled here?",
            answer: "We facilitate the legal agreement, but rehoming fees are paid directly between users. Our platform fee covers verification services.",
            icon: <Sparkles className="text-[#C48B28]" />,
            theme: "bg-[#C48B28]/5 border-[#C48B28]/10"
        },
        {
            question: "How is verification handled?",
            answer: "We use bank-level ID verification and community reviews to ensure every service provider and owner is a verified human.",
            icon: <Users className="text-[#1a365d]" />,
            theme: "bg-[#1a365d]/5 border-[#1a365d]/10"
        },
        {
            question: "What about legal paperwork?",
            answer: "We generate digital Adoption Agreements and Transfer of Ownership forms instantly once a match is confirmed by both parties.",
            icon: <FileSignature className="text-[#C48B28]" />,
            theme: "bg-[#C48B28]/5 border-[#C48B28]/10"
        },
        {
            question: "Can I find local vets here?",
            answer: "Absolutely. Our verified service directory includes local clinics, groomers, and boarders to support your pet's life journey.",
            icon: <MapPin className="text-[#1a365d]" />,
            theme: "bg-[#1a365d]/5 border-[#1a365d]/10"
        }
    ];

    return (
        <section className="py-24 bg-[#FEF9ED] relative overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <SectionCursor label="GENERAL INQUIRIES" icon={<MessageCircle size={14} />}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24 relative"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-[#402E11] mb-6 tracking-tight relative inline-block">
                            Frequently Asked <span className="text-[#C48B28]">Questions</span>
                        </h2>
                        <p className="text-[#402E11]/60 text-lg max-w-2xl mx-auto font-bold leading-relaxed">
                            Transparent answers for your peace of mind.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`p-10 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl group h-full flex flex-col ${faq.theme}`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform duration-500">
                                    {React.cloneElement(faq.icon, { size: 24, strokeWidth: 2 })}
                                </div>
                                <h3 className="text-xl font-black text-[#402E11] mb-4 tracking-tight leading-tight">
                                    {faq.question}
                                </h3>
                                <p className="text-[#402E11]/60 text-sm leading-relaxed font-bold">
                                    {faq.answer}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </SectionCursor>
            </div>
        </section>
    );
};

export default FAQSection;
