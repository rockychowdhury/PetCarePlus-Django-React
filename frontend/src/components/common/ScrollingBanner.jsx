import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';

const ScrollingBanner = () => {
    const { scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState(true);

    useMotionValueEvent(scrollY, "change", (latest) => {
        // Fade out earlier (50% of viewport) so it's gone by the time FeatureSection appears
        const threshold = window.innerHeight * 0.5;
        if (latest > threshold && isVisible) {
            setIsVisible(false);
        } else if (latest <= threshold && !isVisible) {
            setIsVisible(true);
        }
    });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.8, delay: 0.2 }} // Reduced delay for re-appearance suitability
                    className="fixed bottom-10 left-0 w-full z-50 pointer-events-none"
                >
                    <div className="bg-[#C48B28] text-white py-4 overflow-hidden shadow-2xl pointer-events-auto">
                        <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="flex items-center gap-12 text-[10px] font-black tracking-[0.4em] uppercase">
                                    <span>EXPERT SERVICES</span>
                                    <span className="opacity-30">•</span>
                                    <span>VERIFIED PROVIDERS</span>
                                    <span className="opacity-30">•</span>
                                    <span>RESPONSIBLE REHOMING</span>
                                    <span className="opacity-30">•</span>
                                    <span>TRUSTED CARE</span>
                                    <span className="opacity-30">•</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScrollingBanner;
