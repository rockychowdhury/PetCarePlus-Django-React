import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import {
    Shield,
    Lock,
    Eye,
    Database,
    Globe,
    Server,
    FileKey,
    AlertCircle,
    UserCheck,
    Cookie,
    Mail,
    Download,
    CreditCard
} from 'lucide-react';

const PrivacyPolicyPage = () => {
    const [activeSection, setActiveSection] = useState('collection');
    const contentRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const hasTriggeredDownload = useRef(false);

    const sections = [
        { id: 'collection', title: '1. Information We Collect' },
        { id: 'usage', title: '2. How We Use Your Data' },
        { id: 'sharing', title: '3. Data Sharing & Disclosure' },
        { id: 'security', title: '4. Data Security' },
        { id: 'rights', title: '5. Your Rights (GDPR/CCPA)' },
        { id: 'retention', title: '6. Data Retention' },
        { id: 'cookies', title: '7. Cookies & Tracking' },
        { id: 'children', title: '8. Children\'s Privacy' },
        { id: 'international', title: '9. International Transfers' },
        { id: 'changes', title: '10. Changes to Policy' },
        { id: 'contact', title: '11. Contact Us' },
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
        // Refresh with a download flag to ensure fresh server-side data
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('download', 'true');
        window.location.href = currentUrl.toString();
    };

    const triggerDownload = () => {
        if (hasTriggeredDownload.current) return;
        hasTriggeredDownload.current = true;

        setIsDownloading(true);

        // Clean up URL immediately to prevent multiple triggers
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

        const element = contentRef.current;
        const opt = {
            margin: [10, 10, 15, 10],
            filename: 'PetCircle_Privacy_Policy.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
        });
    };

    // Update active section on scroll
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
                                <Lock size={16} className="text-white" /> Data Protection
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 font-logo tracking-tight text-white">
                                Privacy Policy
                            </h1>
                            <p className="text-white/80 text-lg font-medium">
                                Last Updated: December 16, 2025
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

                    {/* Left Sidebar (Sticky) */}
                    <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24">
                            <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-6 px-4">
                                Table of Contents
                            </h3>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 ${activeSection === section.id
                                            ? 'bg-[#C48B28]/10 text-[#C48B28] border-[#C48B28]'
                                            : 'text-themev2-text/60 hover:bg-[#FEF9ED] border-transparent hover:text-themev2-text'
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

                        {/* 1. Collection */}
                        <section id="collection" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-themev2-text">
                                <div className="p-2 bg-[#FEF9ED] rounded-lg text-[#C48B28] border border-[#EBC176]/20">
                                    <Database size={24} />
                                </div>
                                1. Information We Collect
                            </h2>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#EBC176]/20 space-y-6">
                                <p className="text-themev2-text/70">
                                    We collect information necessary to facilitate responsible rehoming and ensure platform safety. This includes:
                                </p>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-themev2-text mb-2">Personal Identity</h4>
                                        <p className="text-sm text-themev2-text/70">Name, email address, phone number, and government ID (for identity verification).</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-themev2-text mb-2">Pet Data</h4>
                                        <p className="text-sm text-themev2-text/70">Photos, medical records (vaccinations, vet history), and behavioral profiles.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-themev2-text mb-2">Adopter Profile</h4>
                                        <p className="text-sm text-themev2-text/70">Housing details, family composition, lifestyle information, and references.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-themev2-text mb-2">Communications</h4>
                                        <p className="text-sm text-themev2-text/70">Messages sent between users are encrypted and stored for safety monitoring.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Usage */}
                        <section id="usage" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text">2. How We Use Your Data</h2>
                            <ul className="space-y-4 text-themev2-text/70">
                                <li className="flex items-start gap-3">
                                    <UserCheck className="text-[#C48B28] mt-1 shrink-0" size={18} />
                                    <span>To facilitate adoption connections and verify user identities.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <UserCheck className="text-[#C48B28] mt-1 shrink-0" size={18} />
                                    <span>To process rehoming applications and generate adoption agreements.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <UserCheck className="text-[#C48B28] mt-1 shrink-0" size={18} />
                                    <span>To detect and prevent fraud, scams, and animal welfare violations.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <UserCheck className="text-[#C48B28] mt-1 shrink-0" size={18} />
                                    <span>To send critical notifications (e.g., application updates, safety alerts).</span>
                                </li>
                            </ul>
                        </section>

                        {/* 3. Sharing */}
                        <section id="sharing" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text">3. Data Sharing & Disclosure</h2>
                            <div className="prose max-w-none text-themev2-text/70 leading-relaxed">
                                <p className="mb-4">
                                    <strong>We do NOT sell your personal data.</strong> Your information is shared only in specific contexts:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>With Other Users:</strong> Only when you actively engage in a rehoming process (e.g., submitting an application shares your profile with the pet owner). Exact addresses are hidden until later stages.</li>
                                    <li><strong>Service Providers:</strong> Trusted vendors who assist with hosting, email delivery, and ID verification (bound by strict confidentiality).</li>
                                    <li><strong>Legal Compliance:</strong> If required by law (e.g., subpoena) or to protect animal welfare (e.g., reporting abuse to authorities).</li>
                                </ul>
                            </div>
                        </section>

                        {/* 4. Security */}
                        <section id="security" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-themev2-text">
                                <Shield className="text-[#C48B28]" size={24} />
                                4. Data Security
                            </h2>
                            <div className="bg-white p-8 rounded-2xl border border-[#C48B28]/20">
                                <p className="text-themev2-text/70 mb-6">
                                    We employ industry-standard security measures to protect your sensitive information:
                                </p>
                                <div className="grid gap-4">
                                    <div className="flex items-center gap-3 bg-[#FEF9ED] p-4 rounded-xl border border-[#EBC176]/20">
                                        <Lock className="text-[#C48B28]" size={20} />
                                        <span className="text-themev2-text/80 text-sm"><strong>Encryption:</strong> Data is encrypted in transit (TLS) and at rest (AES-256).</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-[#FEF9ED] p-4 rounded-xl border border-[#EBC176]/20">
                                        <FileKey className="text-[#C48B28]" size={20} />
                                        <span className="text-themev2-text/80 text-sm"><strong>Sensitive Data:</strong> Vet records and IDs are stored in secure, restricted buckets.</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-[#FEF9ED] p-4 rounded-xl border border-[#EBC176]/20">
                                        <CreditCard className="text-[#C48B28]" size={20} />
                                        <span className="text-themev2-text/80 text-sm"><strong>Payments:</strong> Payment info is tokenized via Stripe; we never store card numbers.</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 5. Rights */}
                        <section id="rights" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text">5. Your Rights (GDPR/CCPA)</h2>
                            <div className="space-y-6 text-themev2-text/70">
                                <p>Whether you are in the EU, California, or elsewhere, we respect your data rights:</p>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-[#FEF9ED] rounded-xl border border-[#EBC176]/20">
                                        <h4 className="font-bold text-themev2-text mb-2">Access & Portability</h4>
                                        <p className="text-sm">Request a copy of your personal data in a portable (JSON) format.</p>
                                    </div>
                                    <div className="p-6 bg-[#FEF9ED] rounded-xl border border-[#EBC176]/20">
                                        <h4 className="font-bold text-themev2-text mb-2">Right to Erasure</h4>
                                        <p className="text-sm">Request deletion of your account. Note: Some legal records (adoption contracts) must be retained for 7 years.</p>
                                    </div>
                                    <div className="p-6 bg-[#FEF9ED] rounded-xl border border-[#EBC176]/20">
                                        <h4 className="font-bold text-themev2-text mb-2">Correction</h4>
                                        <p className="text-sm">Update or correct inaccurate information directly from your profile settings.</p>
                                    </div>
                                    <div className="p-6 bg-[#FEF9ED] rounded-xl border border-[#EBC176]/20">
                                        <h4 className="font-bold text-themev2-text mb-2">CCPA Notice</h4>
                                        <p className="text-sm">We do not sell personal information. You have the right to non-discrimination for exercising your privacy rights.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 6. Retention */}
                        <section id="retention" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text">6. Data Retention</h2>
                            <p className="text-themev2-text/70 leading-relaxed">
                                We retain personal data only as long as an account is active or as needed to provide services. Upon account deletion, identifiers are pseudonymized immediately. However, financial records and signed adoption agreements are retained for 7 years as required by law.
                            </p>
                        </section>

                        {/* 7. Cookies */}
                        <section id="cookies" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-themev2-text">
                                <Cookie size={24} className="text-[#C48B28]" /> 7. Cookies & Tracking
                            </h2>
                            <p className="text-themev2-text/70 leading-relaxed">
                                We use essential cookies to maintain your session and security. We may use analytics cookies (with your consent) to understand platform usage. You can control cookie preferences through your browser settings.
                            </p>
                        </section>

                        {/* 8. Children */}
                        <section id="children" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6">8. Children's Privacy</h2>
                            <p className="text-text-secondary leading-relaxed">
                                PetCircle is not intended for users under 18. We do not knowingly collect data from children. If we discover a user is underage, their account and data will be deleted immediately.
                            </p>
                        </section>

                        {/* 9. International */}
                        <section id="international" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6">9. International Transfers</h2>
                            <p className="text-text-secondary leading-relaxed">
                                Your information may be transferred to and maintained on computers located outside of your state or country where data protection laws may differ. By using PetCircle, you consent to this transfer.
                            </p>
                        </section>

                        {/* 10. Changes */}
                        <section id="changes" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-6">10. Changes to Policy</h2>
                            <p className="text-text-secondary leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or a prominent notice on our Platform.
                            </p>
                        </section>

                        {/* 11. Contact */}
                        <section id="contact" className="scroll-mt-32 mb-20">
                            <h2 className="text-2xl font-bold mb-6 text-themev2-text">11. Contact Us</h2>
                            <p className="text-themev2-text/70 leading-relaxed mb-6">
                                If you have questions about your data privacy or wish to exercise your rights, please contact our Data Protection Officer (DPO).
                            </p>
                            <div className="flex items-center gap-3 text-themev2-text/80 bg-[#FEF9ED] px-6 py-4 rounded-xl border border-[#EBC176]/20 inline-flex">
                                <Mail className="text-[#C48B28]" size={20} />
                                <span className="font-medium">privacy@petcircle.com</span>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
