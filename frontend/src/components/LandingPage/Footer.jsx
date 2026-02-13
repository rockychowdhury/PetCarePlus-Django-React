import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink, BookOpen, Twitter, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import useAuth from '../../hooks/useAuth';

const Footer = () => {
    const { user } = useAuth();
    return (
        <footer className="bg-[#FAF3E0] text-themev2-text pt-24 pb-12 border-t border-[#EBC176]/20">
            <div className="max-w-[1400px] mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">

                    {/* Brand Column */}
                    <div className="lg:col-span-5 space-y-8">
                        <Link to="/" className="inline-block">
                            <Logo />
                        </Link>
                        <p className="text-themev2-text/60 text-sm font-bold leading-relaxed max-w-sm">
                            A warm, trusted space where pet lovers meet, share stories, and find care that feels like family.
                        </p>
                        <div className="flex space-x-4">
                            <SocialIcon icon={<Github size={18} />} href="https://github.com/rockychowdhury" />
                            <SocialIcon icon={<Linkedin size={18} />} href="https://www.linkedin.com/in/rockychowdhury1/" />
                            <SocialIcon icon={<Globe size={18} />} href="https://rocky-chowdhury.netlify.app/" />
                        </div>
                    </div>

                    {/* Navigate */}
                    <div className="lg:col-span-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-themev2-text mb-8">Navigate</h4>
                        <ul className="space-y-4 text-[13px] font-bold text-[#C48B28]">
                            {/* Show 'Find a pet' & 'Rehome' only for Guests or Pet Owners */}
                            {(!user || (user.role !== 'service_provider' && user.role !== 'admin')) && (
                                <>
                                    <li><FooterLink to="/pets">Find a pet</FooterLink></li>
                                    <li><FooterLink to="/rehoming">Rehome a pet</FooterLink></li>
                                </>
                            )}
                            <li><FooterLink to="/services">Pet services</FooterLink></li>
                            <li><FooterLink to="/about">About Us</FooterLink></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="lg:col-span-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-themev2-text mb-8">Resources</h4>
                        <ul className="space-y-4 text-[13px] font-bold text-[#C48B28]">
                            <li><FooterLink to="/how-it-works">How it works</FooterLink></li>
                            <li><FooterLink to="/faq">FAQ & Help</FooterLink></li>
                            <li><FooterLink to="/contact">Contact Us</FooterLink></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="lg:col-span-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-themev2-text mb-8">Legal</h4>
                        <ul className="space-y-4 text-[13px] font-bold text-[#C48B28]">
                            <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
                            <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
                            <li><FooterLink to="/cookies">Cookie Policy</FooterLink></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-themev2-text/5 pt-8">
                    <p className="text-themev2-text/40 text-[10px] font-bold">
                        &copy; {new Date().getFullYear()} PetCarePlus. Crafted with ♥ for all companions.
                    </p>
                </div>
            </div>
        </footer>
    );
};

// Helper Components
const SocialIcon = ({ icon, href }) => (
    <a
        href={href}
        className="w-10 h-10 rounded-full bg-white border border-[#EBC176]/20 flex items-center justify-center text-themev2-text hover:bg-[#FEF9ED] hover:text-[#C48B28] transition-all duration-300 shadow-sm"
    >
        {icon}
    </a>
);

const FooterLink = ({ to, children }) => (
    <Link to={to} className="transition-all duration-300 hover:text-themev2-text">
        {children}
    </Link>
);

export default Footer;
