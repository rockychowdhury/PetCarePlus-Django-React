import React from 'react';
import { Mail, Phone, Clock, MapPin, Upload, Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

const ContactPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("Form Submitted:", data);
        alert("Thanks for contacting us! We'll respond shortly.");
    };

    return (
        <div className="bg-[#FEF9ED] min-h-screen text-themev2-text py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-themev2-text">Contact Us</h1>
                    <p className="text-lg text-themev2-text/60">
                        We're here to help! Send us a message and we'll respond within 24 hours.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Contact Form */}
                    <div className="bg-white rounded-[2rem] shadow-sm p-8 md:p-12 border border-[#EBC176]/20">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-bold text-themev2-text mb-2">Full Name</label>
                                <input
                                    type="text"
                                    className={`w-full h-12 px-4 rounded-xl border ${errors.fullName ? 'border-status-error' : 'border-[#EBC176]/30'} bg-[#FEF9ED] focus:outline-none focus:ring-2 focus:ring-[#C48B28]/20 focus:border-[#C48B28] transition font-medium text-themev2-text`}
                                    placeholder="Enter your name"
                                    {...register("fullName", { required: true })}
                                />
                                {errors.fullName && <span className="text-status-error text-xs mt-1">Required</span>}
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-sm font-bold text-themev2-text mb-2">Email Address</label>
                                <input
                                    type="email"
                                    className={`w-full h-12 px-4 rounded-xl border ${errors.email ? 'border-status-error' : 'border-[#EBC176]/30'} bg-[#FEF9ED] focus:outline-none focus:ring-2 focus:ring-[#C48B28]/20 focus:border-[#C48B28] transition font-medium text-themev2-text`}
                                    placeholder="you@example.com"
                                    {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                                />
                                {errors.email && <span className="text-status-error text-xs mt-1">Valid email required</span>}
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-bold text-themev2-text mb-2">Subject</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-12 px-4 rounded-xl border border-[#EBC176]/30 bg-[#FEF9ED] focus:outline-none focus:ring-2 focus:ring-[#C48B28]/20 focus:border-[#C48B28] transition appearance-none cursor-pointer font-medium text-themev2-text"
                                        {...register("subject")}
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Adoption Support">Adoption Support</option>
                                        <option value="Rehoming Help">Rehoming Help</option>
                                        <option value="Technical Issue">Technical Issue</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-bold text-themev2-text mb-2">Message</label>
                                <textarea
                                    className={`w-full p-4 rounded-xl border ${errors.message ? 'border-status-error' : 'border-[#EBC176]/30'} bg-[#FEF9ED] focus:outline-none focus:ring-2 focus:ring-[#C48B28]/20 focus:border-[#C48B28] transition h-40 resize-none font-medium text-themev2-text`}
                                    placeholder="How can we help you today? (Min 50 characters)"
                                    {...register("message", { required: true, minLength: 50 })}
                                ></textarea>
                                {errors.message && <span className="text-status-error text-xs mt-1">Message is too short</span>}
                            </div>

                            {/* Attachment (Optional) */}
                            <div>
                                <label className="block text-sm font-bold text-themev2-text mb-2">Attachment (Optional)</label>
                                <div className="border-2 border-dashed border-[#EBC176]/40 rounded-xl bg-[#FEF9ED]/50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#FEF9ED] transition-colors group">
                                    <div className="w-10 h-10 mb-3 text-[#C48B28] group-hover:scale-110 transition-transform">
                                        <Upload size={40} strokeWidth={1.5} />
                                    </div>
                                    <span className="text-sm font-medium text-[#C48B28]">Click to upload or drag and drop</span>
                                    <span className="text-xs text-[#C48B28]/70 mt-1">Max file size: 5MB</span>
                                    <input type="file" className="hidden" {...register("attachment")} />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-themev2-text text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                            >
                                <span className="text-lg">Send Message</span>
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Info & Map */}
                    <div className="space-y-6">
                        {/* Contact Info Card */}
                        <div className="bg-white rounded-[2rem] shadow-sm p-8 md:p-10 border border-[#EBC176]/20 space-y-8">

                            {/* Email */}
                            <ContactItem
                                icon={<Mail size={20} />}
                                label="Email Us"
                                content={<a href="mailto:support@petcircle.com" className="hover:text-[#C48B28] transition-colors">support@petcircle.com</a>}
                            />

                            {/* Call */}
                            <ContactItem
                                icon={<Phone size={20} />}
                                label="Call Us"
                                content={<a href="tel:5551234567" className="hover:text-[#C48B28] transition-colors">(555) 123-4567</a>}
                            />

                            {/* Office Hours */}
                            <ContactItem
                                icon={<Clock size={20} />}
                                label="Office Hours"
                                content={
                                    <>
                                        <p>Mon - Fri: 9am - 5pm EST</p>
                                        <p>Sat - Sun: Closed</p>
                                    </>
                                }
                            />

                            {/* Location */}
                            <ContactItem
                                icon={<MapPin size={20} />}
                                label="Location"
                                content="Dhaka, Bangladesh"
                            />

                            {/* Divider */}
                            <div className="h-px bg-border my-6"></div>

                            {/* Follow Us */}
                            <div>
                                <h4 className="font-bold text-themev2-text mb-4">Follow Us</h4>
                                <div className="flex gap-4">
                                    <SocialButton icon={<Facebook size={18} />} />
                                    <SocialButton icon={<Twitter size={18} />} />
                                    <SocialButton icon={<Instagram size={18} />} />
                                    <SocialButton icon={<Linkedin size={18} />} />
                                </div>
                            </div>
                        </div>

                        {/* Map Card */}
                        <div className="bg-white rounded-[2rem] shadow-sm p-2 border border-[#EBC176]/20 h-64 overflow-hidden relative">
                            <iframe
                                title="Map of Dhaka"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233667.8223908687!2d90.27923710646989!3d23.780887456212758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1715000000000!5m2!1sen!2sbd"
                                width="100%"
                                height="100%"
                                style={{ border: 0, borderRadius: '1.5rem', opacity: 0.8 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const ContactItem = ({ icon, label, content }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-[#FEF9ED] rounded-full flex items-center justify-center text-[#C48B28]">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-themev2-text text-lg mb-1">{label}</h4>
            <div className="text-themev2-text/60 text-sm leading-relaxed font-medium">
                {content}
            </div>
        </div>
    </div>
);

const SocialButton = ({ icon }) => (
    <a href="#" className="w-10 h-10 rounded-full border border-[#EBC176]/30 flex items-center justify-center text-themev2-text/60 hover:bg-[#C48B28]/10 hover:text-[#C48B28] hover:border-[#C48B28] transition-all">
        {icon}
    </a>
);

export default ContactPage;

