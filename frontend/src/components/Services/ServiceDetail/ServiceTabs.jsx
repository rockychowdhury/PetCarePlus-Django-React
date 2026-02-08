import React from 'react';

const ServiceTabs = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'services', label: 'Services & Pricing' },
        { id: 'reviews', label: 'Reviews' },
        { id: 'about', label: 'About' },
    ];

    return (
        <div className="sticky top-[72px] z-30 bg-[#FEF9ED]/80 backdrop-blur-md border-b border-[#EBC176]/10">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
                <nav className="flex space-x-6 sm:space-x-10 overflow-x-auto no-scrollbar" aria-label="Tabs" id="service-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                whitespace-nowrap py-5 px-1 border-b-2 font-black text-[11px] uppercase tracking-widest transition-all duration-300 outline-none
                                ${activeTab === tab.id
                                    ? 'border-[#C48B28] text-themev2-text'
                                    : 'border-transparent text-themev2-text/30 hover:text-themev2-text hover:border-[#EBC176]/30'
                                }
                            `}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                            id={`tab-${tab.id}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default ServiceTabs;
