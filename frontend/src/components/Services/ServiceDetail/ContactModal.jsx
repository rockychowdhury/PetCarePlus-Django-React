import React from 'react';
import { X, Phone, Mail, Globe, MapPin, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../common/Buttons/Button';
import { toast } from 'react-hot-toast';

const ContactModal = ({ isOpen, onClose, provider }) => {
    if (!isOpen || !provider) return null;

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard!`);
    };

    const handleWhatsApp = () => {
        if (provider.phone) {
            // Remove non-digit characters
            const phone = provider.phone.replace(/\D/g, '');
            window.open(`https://wa.me/${phone}`, '_blank');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold font-merriweather text-gray-900">
                            Contact {provider.business_name}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <p className="text-gray-600 text-sm">
                            Get in touch directly with {provider.business_name} using the information below.
                        </p>

                        <div className="space-y-4">
                            {/* Phone */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-brand-primary/20 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-brand-primary">
                                    <Phone size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-gray-500 uppercase">Phone</div>
                                    <div className="font-medium text-gray-900">{provider.phone}</div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopy(provider.phone, 'Phone number')}
                                >
                                    Copy
                                </Button>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-brand-primary/20 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-brand-primary">
                                    <Mail size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-gray-500 uppercase">Email</div>
                                    <div className="font-medium text-gray-900 break-all">{provider.email}</div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopy(provider.email, 'Email')}
                                >
                                    Copy
                                </Button>
                            </div>

                            {/* Website */}
                            {provider.website && (
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-brand-primary/20 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-brand-primary">
                                        <Globe size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-gray-500 uppercase">Website</div>
                                        <a
                                            href={provider.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-brand-secondary hover:underline truncate block max-w-[200px]"
                                        >
                                            {provider.website}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-brand-primary/20 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-brand-primary">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-gray-500 uppercase">Location</div>
                                    <div className="font-medium text-gray-900">
                                        {provider.address?.city || provider.city || 'N/A'}, {provider.address?.state || provider.state || ''}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp CTA */}
                        <div className="pt-4 border-t border-gray-100">
                            <Button
                                className="w-full justify-center bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-lg shadow-green-500/20"
                                onClick={handleWhatsApp}
                                icon={MessageCircle}
                            >
                                Chat on WhatsApp
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ContactModal;
