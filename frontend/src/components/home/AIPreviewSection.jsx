import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { Sparkles, ShieldAlert, HeartHandshake, Zap, Info, ShieldCheck, ArrowRight, Stethoscope, Brain, MapPin } from 'lucide-react'

export const AIPreviewSection = () => {
  const { language } = useLanguage()

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
                ? 'এআই পশু চিকিৎসা সহকারী'
                : 'AI Veterinary Diagnostic Assistant'}
            </h2>

            <p className="text-xs md:text-sm text-pcp-text-secondary leading-relaxed font-semibold">
              {language === 'bn'
                ? 'আপনার পশু অসুস্থ বা আচরণে অস্বাভাবিকতা দেখাচ্ছে? সমস্যা বিস্তারিত লিখুন। এআই একবারেই রোগ নির্ণয়, চিকিৎসা পরামর্শ, সতর্কতা সংকেত, নিকটতম ডাক্তার ও প্রাসঙ্গিক তথ্য প্রদান করবে।'
                : 'Is your pet or farm animal acting strange? Describe the problem once and get a full diagnostic — diagnosis, care advice, warning signs, local provider suggestions, and related resources — all in one go.'}
            </p>

            {/* Platform Feature Curation Guide Card */}
            <div className="p-4 bg-card border border-primary/10 rounded-2xl shadow-sm text-left space-y-4">
              <h4 className="text-xs font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-pcp-green-accent" />
                {language === 'bn' ? 'কী কী পাবেন' : 'What You\'ll Get'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] sm:text-xs">
                <div className="space-y-1">
                  <span className="font-extrabold text-pcp-text-primary block">
                    {language === 'bn' ? '১. রোগ নির্ণয় ও পরামর্শ' : '1. Diagnosis & Care Advice'}
                  </span>
                  <p className="text-pcp-text-muted leading-relaxed">
                    {language === 'bn' 
                      ? 'সম্ভাব্য রোগ, প্রাথমিক চিকিৎসা, এবং যত্নের বিস্তারিত নির্দেশনা।'
                      : 'Possible diseases, first aid steps, and detailed care instructions.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-extrabold text-pcp-text-primary block">
                    {language === 'bn' ? '২. সতর্কতা ও আশার সংকেত' : '2. Warning & Hope Signs'}
                  </span>
                  <p className="text-pcp-text-muted leading-relaxed">
                    {language === 'bn' 
                      ? 'কখন চিন্তিত হবেন, কখন নিরাপদ, এবং সুস্থতার লক্ষণ।'
                      : 'When to worry, when it\'s safe, and recovery indicators.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-extrabold text-pcp-text-primary block">
                    {language === 'bn' ? '৩. নিকটস্থ ডাক্তার' : '3. Local Providers'}
                  </span>
                  <p className="text-pcp-text-muted leading-relaxed">
                    {language === 'bn' 
                      ? 'আপনার এলাকার সেরা রেটিংযুক্ত পশু চিকিৎসকের স্বয়ংক্রিয় তালিকা।'
                      : 'Auto-ranked veterinarians near your location based on ratings.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-extrabold text-pcp-text-primary block">
                    {language === 'bn' ? '৪. প্রাসঙ্গিক তথ্য' : '4. Related Resources'}
                  </span>
                  <p className="text-pcp-text-muted leading-relaxed">
                    {language === 'bn' 
                      ? 'সম্পর্কিত গাইডলাইন, সরকারি তথ্য ও রিসোর্স।'
                      : 'Related guidelines, government info, and educational resources.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature highlights */}
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
                      ? 'এআই রিপোর্টের সাথে লাল, হলুদ বা সবুজ রঙের ইন্ডিকেটর দিয়ে বিপদ পরিমাপ করে।'
                      : 'Interactive color-coded badges instantly show whether an emergency clinic is needed.'}
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
                      ? 'খামারির বোঝার সুবিধার্থে বাংলায় উত্তর লেখার দক্ষ প্রোগ্রামিং করা আছে।'
                      : 'Optimized language modeling outputs guidance in native Bangla and English.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: CTA Card linking to AI page */}
          <div className="lg:col-span-7 flex justify-center w-full max-w-lg mx-auto relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl group-hover:bg-primary/10 transition-all duration-500" />
            <div className="w-full relative z-10 border border-primary/20 rounded-3xl shadow-xl overflow-hidden bg-card/60 backdrop-blur-md">
              <div className="p-8 md:p-10 text-center space-y-6">
                {/* Animated icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/20 flex items-center justify-center relative">
                    <Brain className="w-10 h-10 text-primary" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-extrabold text-foreground">
                    {language === 'bn' ? 'এখনই আপনার পশুর সমস্যা বিশ্লেষণ করুন' : 'Analyze Your Animal\'s Problem Now'}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {language === 'bn'
                      ? 'শুধু সমস্যা লিখুন — এআই একবারেই সম্পূর্ণ রোগ নির্ণয় রিপোর্ট, ডাক্তার সাজেশন ও প্রাসঙ্গিক তথ্য দেবে।'
                      : 'Just describe the problem — AI will provide a complete diagnostic report, doctor suggestions, and relevant resources in one go.'}
                  </p>
                </div>

                {/* Quick feature badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { icon: <Stethoscope className="w-3 h-3" />, label: language === 'bn' ? 'রোগ নির্ণয়' : 'Diagnosis' },
                    { icon: <ShieldAlert className="w-3 h-3" />, label: language === 'bn' ? 'সতর্কতা' : 'Warnings' },
                    { icon: <MapPin className="w-3 h-3" />, label: language === 'bn' ? 'ডাক্তার খুঁজুন' : 'Find Doctors' },
                    { icon: <ShieldCheck className="w-3 h-3" />, label: language === 'bn' ? 'আশার সংকেত' : 'Hope Signs' },
                  ].map((badge, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[10px] font-bold border border-primary/15">
                      {badge.icon}
                      {badge.label}
                    </span>
                  ))}
                </div>

                <Link
                  to="/ai-assistant"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 text-white text-sm font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'bn' ? 'এআই সহকারী ব্যবহার করুন' : 'Use AI Assistant'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIPreviewSection
