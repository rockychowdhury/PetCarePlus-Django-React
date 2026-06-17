import React from 'react'
import AIChatWidget from '../ai/AIChatWidget'
import { useLanguage } from '../../hooks/useLanguage'
import { Sparkles, ShieldAlert, HeartHandshake, Zap, Info, ShieldCheck, HelpCircle } from 'lucide-react'

export const AIPreviewSection = () => {
  const { language, t } = useLanguage()

  return (
    <section className="py-16 bg-gradient-to-br from-pcp-green-bg via-background to-pcp-green-bg/30 border-b border-pcp-green-light/20 relative overflow-hidden">
      {/* Decorative vector */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-pcp-green-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Side: Rich AI Feature Curation & Rules */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pcp-green-accent/10 text-primary text-xs font-bold border border-pcp-green-accent/30">
              <Sparkles className="w-3.5 h-3.5 fill-current text-pcp-green-accent animate-pulse" />
              <span className="tracking-wide">
                {language === 'bn' ? 'এআই চালিত ভেটেরিনারি অ্যাসিস্ট্যান্ট' : 'AI-Powered Veterinary Guide'}
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold text-pcp-text-primary tracking-tight leading-snug">
              {language === 'bn'
                ? 'স্মার্ট ভেটেরিনারি এআই সহকারীর সাথে কথা বলুন'
                : 'Consult Our Intelligent AI Vet Assistant'}
            </h2>

            <p className="text-xs md:text-sm text-pcp-text-secondary leading-relaxed font-semibold">
              {language === 'bn'
                ? 'আপনার পশু অসুস্থ বা আচরণে অস্বাভাবিকতা দেখাচ্ছে? লক্ষণগুলো চ্যাটে লিখুন। আমাদের এআই লক্ষণ বিশ্লেষণ করে তাৎক্ষণিক সমাধান এবং নিকটস্থ ডাক্তারের হদিস দেবে।'
                : 'Is your pet or farm animal acting strange? Just describe the symptoms. Our customized Gemini AI asks clarifying questions, assesses condition severity, and suggest matching local doctors.'}
            </p>

            {/* Platform Feature Curation Guide Card */}
            <div className="p-4 bg-card border border-primary/10 rounded-2xl shadow-sm text-left space-y-4">
              <h4 className="text-xs font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-pcp-green-accent" />
                {language === 'bn' ? 'ব্যবহার নির্দেশিকা ও এআই নিয়মসমূহ' : 'AI Operational Rules & Guide'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] sm:text-xs">
                {/* Rule 1: Diagnostic and Urgency */}
                <div className="space-y-1">
                  <span className="font-extrabold text-pcp-text-primary block">
                    {language === 'bn' ? '১. রোগ ও সতর্কতা নির্ণয়' : '1. Diagnosis & Urgency'}
                  </span>
                  <p className="text-pcp-text-muted leading-relaxed">
                    {language === 'bn' 
                      ? 'এআই ৪টি ধাপে সতর্কতা স্তর নির্ধারণ করে: Mild (মৃদু), Moderate (মাঝারি), Severe (মারাত্মক), এবং Critical (জরুরি)।'
                      : 'Categorizes symptom severity into 4 distinct urgency tiers: Mild, Moderate, Severe, and Critical.'}
                  </p>
                </div>

                {/* Rule 2: Doctor recommendations */}
                <div className="space-y-1">
                  <span className="font-extrabold text-pcp-text-primary block">
                    {language === 'bn' ? '২. লোকাল ডাক্তার ম্যাপিং' : '2. Ranked Doctor Routing'}
                  </span>
                  <p className="text-pcp-text-muted leading-relaxed">
                    {language === 'bn' 
                      ? 'রোগের ধরনের সাথে মিলিয়ে আপনার জেলার শ্রেষ্ঠ রেটযুক্ত ডাক্তারদের স্বয়ংক্রিয় তালিকা প্রদান করবে।'
                      : 'Weighted ranking algorithm maps the AI summary to certified clinics in your district.'}
                  </p>
                </div>

                {/* Rule 3: Rate limits */}
                <div className="space-y-1">
                  <span className="font-extrabold text-pcp-text-primary block">
                    {language === 'bn' ? '৩. গেস্ট ইউজার লিমিট' : '3. Anonymous Rate Limits'}
                  </span>
                  <p className="text-pcp-text-muted leading-relaxed">
                    {language === 'bn' 
                      ? 'নিবন্ধন ছাড়া ৩ বার চ্যাট করতে পারবেন। আনলিমিটেড আলাপ ও রিপোর্ট হিস্ট্রি সংরক্ষণ করতে দ্রুত লগইন করুন।'
                      : 'Anonymous visitors have a strict limit of 3 turns per session. Log in to keep diagnostic history.'}
                  </p>
                </div>

                {/* Rule 4: Actionable Home Care */}
                <div className="space-y-1">
                  <span className="font-extrabold text-pcp-text-primary block">
                    {language === 'bn' ? '৪. তাৎক্ষণিক ফার্স্ট এইড' : '4. Immediate First Aid'}
                  </span>
                  <p className="text-pcp-text-muted leading-relaxed">
                    {language === 'bn' 
                      ? 'ডাক্তার আসার আগ পর্যন্ত বাড়িতে নিরাপদে কী খাওয়াবেন বা কী করবেন তার নিরাপদ পরামর্শ।'
                      : 'Safe home remedies and nutritional recommendations you can safely perform right now.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Compact feature highlight bullets */}
            <div className="space-y-4 pt-2">
              <div className="flex gap-3 text-left">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-pcp-green-accent/15 text-primary flex items-center justify-center">
                  <ShieldAlert className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                    {language === 'bn' ? 'জরুরি স্তর প্রদর্শন' : 'Urgency Scoring Visualized'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-pcp-text-secondary">
                    {language === 'bn'
                      ? 'এআই রিপোর্টের সাথে সাথে লাল, হলুদ বা সবুজ রঙের ইন্ডিকেটর দিয়ে বিপদ পরিমাপ করে।'
                      : 'Interactive color-coded UI badges instantly show whether an emergency clinic is needed.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 text-left">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <HeartHandshake className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                    {language === 'bn' ? 'বাংলা এবং ইংরেজিতে পরামর্শ' : 'Bilingual Comprehension'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-pcp-text-secondary">
                    {language === 'bn'
                      ? 'খামারির বোঝার সুবিধার্থে বাংলায় উত্তর লেখার দক্ষ প্রোগ্রামিং করা আছে।'
                      : 'Optimized language modeling outputs guidance in native Bangla and English based on selection.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Glassmorphic Embedded Widget Container */}
          <div className="lg:col-span-7 flex justify-center w-full max-w-lg mx-auto relative group">
            {/* Soft backdrop glow behind chat widget */}
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl group-hover:bg-primary/10 transition-all duration-500" />
            <div className="w-full relative z-10 border border-primary/20 rounded-3xl shadow-xl overflow-hidden bg-card/60 backdrop-blur-md">
              <AIChatWidget isMini={true} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIPreviewSection
