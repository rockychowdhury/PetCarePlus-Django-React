import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import {
    Shield,
    Lock,
    Eye,
    Cookie,
    Info,
    Settings,
    ShieldCheck,
    Download,
    Mail,
    AlertCircle,
    CheckCircle2,
    MousePointer2
} from 'lucide-react';

const CookiePolicyPage = () => {
    const [activeSection, setActiveSection] = useState('what-are-cookies');
    const contentRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const hasTriggeredDownload = useRef(false);

    const sections = [
        { id: 'what-are-cookies', title: '1. What are Cookies' },
        { id: 'how-we-use', title: '2. How We Use Cookies' },
        { id: 'types-of-cookies', title: '3. Types of Cookies We Use' },
        { id: 'third-party', title: '4. Third-Party Cookies' },
        { id: 'your-choices', title: '5. Your Choices' },
        { id: 'retention', title: '6. Retention Period' },
        { id: 'updates', title: '7. Policy Updates' },
        { id: 'contact', title: '8. Contact Us' },
    ];

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
        }
    };

    const handleDownloadPDF = () => {
        setIsDownloading(true);
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('download', 'true');
        window.location.href = currentUrl.toString();
    };

    const triggerDownload = () => {
        if (hasTriggeredDownload.current) return;
        hasTriggeredDownload.current = true;
        setIsDownloading(true);

        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

        const element = contentRef.current;
        const opt = {
            margin: [10, 10, 15, 10],
            filename: 'PetCarePlus_Cookie_Policy.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
        });
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('download') === 'true') {
            triggerDownload();
        }

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 160;
            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-[#FEF9ED] min-h-screen text-themev2-text pt-20">
            {/* Header */}
            <div className="bg-[#C48B28] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <p className="text-white/80 font-bold uppercase tracking-widest mb-3 text-sm flex items-center gap-2">
                                <Cookie size={16} className="text-white" /> Privacy & Technology
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white">
                                Cookie Policy
                            </h1>
                            <p className="text-white/80 text-lg font-medium">
                                Last Updated: February 03, 2026
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-[#C48B28] rounded-full transition-all font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                <Download size={16} />
                                {isDownloading ? 'Generating...' : 'Download PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Sidebar */}
                    <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24">
                            <h3 className="text-sm font-bold text-themev2-text/40 uppercase tracking-wider mb-6 px-4">
                                Policy Navigation
                            </h3>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 ${activeSection === section.id
                                            ? 'bg-[#C48B28]/10 text-[#C48B28] border-[#C48B28]'
                                            : 'text-themev2-text/60 hover:bg-[#FAF3E0] border-transparent hover:text-themev2-text'
                                            }`}
                                    >
                                        {section.title}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-16" ref={contentRef}>

                        {/* 1. What are Cookies */}
                        <section id="what-are-cookies" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-themev2-text">
                                <div className="p-2 bg-white rounded-lg text-[#C48B28] border border-[#EBC176]/20">
                                    <Info size={24} />
                                </div>
                                1. What are Cookies
                            </h2>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#EBC176]/20 space-y-4">
                                <p className="text-themev2-text/70 leading-relaxed">
                                    Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                                </p>
                                <p className="text-themev2-text/70 leading-relaxed">
                                    Cookies set by the website owner (in this case, PetCarePlus) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies".
                                </p>
                            </div>
                        </section>

                        {/* 2. How We Use */}
                        <section id="how-we-use" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text">2. How We Use Cookies</h2>
                            <div className="space-y-4 text-themev2-text/70 leading-relaxed">
                                <p>We use cookies for several reasons. Some cookies are required for technical reasons in order for our Platform to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Platform.</p>
                                <div className="grid md:grid-cols-2 gap-4 mt-6">
                                    <div className="flex items-start gap-3 p-4 bg-[#FAF3E0] rounded-xl border border-[#EBC176]/20">
                                        <ShieldCheck className="text-[#C48B28] shrink-0" size={18} />
                                        <span className="text-sm font-bold">Authentication & Security</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-[#FAF3E0] rounded-xl border border-[#EBC176]/20">
                                        <Settings className="text-[#C48B28] shrink-0" size={18} />
                                        <span className="text-sm font-bold">Preferences & Settings</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-[#FAF3E0] rounded-xl border border-[#EBC176]/20">
                                        <MousePointer2 className="text-[#C48B28] shrink-0" size={18} />
                                        <span className="text-sm font-bold">Performance & Analytics</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-[#FAF3E0] rounded-xl border border-[#EBC176]/20">
                                        <CheckCircle2 className="text-[#C48B28] shrink-0" size={18} />
                                        <span className="text-sm font-bold">Feature functionality</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Types */}
                        <section id="types-of-cookies" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-8 text-themev2-text">3. Types of Cookies We Use</h2>
                            <div className="space-y-8">
                                <div className="bg-white p-8 rounded-2xl border border-[#EBC176]/20">
                                    <h3 className="text-lg font-black text-[#C48B28] mb-3">Essential Cookies</h3>
                                    <p className="text-themev2-text/70 text-sm mb-4">These cookies are strictly necessary to provide you with services available through our Platform and to use some of its features, such as access to secure areas.</p>
                                    <ul className="list-disc pl-5 text-sm text-themev2-text/60 space-y-1">
                                        <li>Login status maintenance</li>
                                        <li>Security monitoring and fraud prevention</li>
                                        <li>CSRF protection for forms</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-8 rounded-2xl border border-[#EBC176]/20 text-themev2-text/60">
                                    <h3 className="text-lg font-black text-[#C48B28] mb-3 opacity-80">Performance & Analytics</h3>
                                    <p className="text-sm mb-4">These cookies collect information that is used either in aggregate form to help us understand how our Platform is being used or how effective our marketing campaigns are.</p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>Page view tracking</li>
                                        <li>Source and referral identification</li>
                                        <li>Loading speed monitoring</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 4. Third Party */}
                        <section id="third-party" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text">4. Third-Party Cookies</h2>
                            <p className="text-themev2-text/70 leading-relaxed">
                                Some features on our Platform use third-party applications and services to enhance the experience for visitors (e.g., Google Analytics for usage tracking, or Stripe for payment processing). These third parties may set their own cookies to track your interaction with their services.
                            </p>
                        </section>

                        {/* 5. Your Choices */}
                        <section id="your-choices" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text flex items-center gap-3">
                                <Settings className="text-[#C48B28]" size={24} />
                                5. Your Choices
                            </h2>
                            <div className="bg-[#FAF3E0] p-8 rounded-2xl border border-[#EBC176]/20">
                                <p className="text-themev2-text/70 mb-4">
                                    You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
                                </p>
                                <p className="text-themev2-text/70">
                                    As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information.
                                </p>
                            </div>
                        </section>

                        {/* 6. Retention */}
                        <section id="retention" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text">6. Retention Period</h2>
                            <p className="text-themev2-text/70 leading-relaxed">
                                The length of time a cookie will stay on your browsing device depends on whether it is a "persistent" or "session" cookie. Session cookies will only stay on your device until you stop browsing. Persistent cookies stay on your browsing device until they expire or are deleted.
                            </p>
                        </section>

                        {/* 7. Updates */}
                        <section id="updates" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text">7. Policy Updates</h2>
                            <p className="text-themev2-text/70 leading-relaxed">
                                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                            </p>
                        </section>

                        {/* 8. Contact */}
                        <section id="contact" className="scroll-mt-32 mb-20">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text">8. Contact Us</h2>
                            <p className="text-themev2-text/70 mb-6">
                                If you have any questions about our use of cookies or other technologies, please contact us.
                            </p>
                            <div className="flex items-center gap-3 text-themev2-text bg-white px-8 py-5 rounded-2xl border border-[#EBC176]/20 inline-flex shadow-sm">
                                <Mail className="text-[#C48B28]" size={20} />
                                <span className="font-black text-[#402E11]">support@petcareplus.com</span>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicyPage;
