import React, { useState, useEffect } from 'react';

/**
 * FeatureCarousel - Auto-rotating carousel for auth pages
 * 3 slides showcasing PetCircle features
 * Refactored to use Tailwind CSS utility classes
 */

const FeatureCarousel = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const slides = [
        {
            id: 1,
            headline: 'Premium Pet Services',
            subheading: 'Book verified vets, expert trainers, and professional groomers instantly.',
            image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2086&auto=format&fit=crop",
            tags: ['Expert Vets', 'Grooming']
        },
        {
            id: 2,
            headline: 'Ethical Pet Adoption',
            subheading: 'Discover healthy, happy pets from a community of responsible owners.',
            image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop",
            tags: ['Verified', 'Safe Adoption']
        },
        {
            id: 3,
            headline: 'Expert Pet Support',
            subheading: 'Access industry-leading specialists for your pet\'s health and happiness.',
            image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop",
            tags: ['24/7 Care', 'Specialists']
        }
    ];

    useEffect(() => {
        if (!isPaused) {
            const timer = setInterval(() => {
                setActiveSlide((prev) => (prev + 1) % slides.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [isPaused, slides.length]);

    return (
        <div
            className="relative w-full h-full overflow-hidden bg-gray-900 rounded-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                        }`}
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src={slide.image}
                            alt={slide.headline}
                            className="w-full h-full object-cover transition-transform duration-[4000ms] hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 w-full p-12 text-left z-10">
                        <div className="mb-6 flex gap-2.5">
                            {slide.tags.map(tag => (
                                <span key={tag} className="px-3.5 py-1 bg-black/20 backdrop-blur-md rounded-full text-[9px] font-black text-white border border-white/10 uppercase tracking-[0.2em]">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 leading-[1.1] tracking-tighter drop-shadow-sm max-w-xs">
                            {slide.headline}
                        </h2>
                        <p className="text-sm text-white/80 font-bold max-w-xs leading-relaxed drop-shadow-sm">
                            {slide.subheading}
                        </p>
                    </div>
                </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-12 right-12 flex gap-2.5 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 ease-out ${index === activeSlide ? 'w-10 bg-white shadow-lg' : 'w-1.5 bg-white/30 hover:bg-white/50'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default FeatureCarousel;
