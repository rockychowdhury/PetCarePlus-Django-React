import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import {
  Sparkles, Stethoscope, BookOpen, Syringe, Heart, Building2,
  ArrowRight, Activity, MapPin, ShieldCheck, Zap
} from 'lucide-react'

export const FeaturesGrid = () => {
  const { language } = useLanguage()

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/3 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_50%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold border border-primary/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'প্ল্যাটফর্ম ফিচারসমূহ' : 'Platform Features'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            {language === 'bn'
              ? 'আপনার পশুর যত্নে যা যা দরকার'
              : 'Everything Your Animal Needs'}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {language === 'bn'
              ? 'এআই রোগ নির্ণয় থেকে শুরু করে টিকার সময়সূচী, নিকটস্থ ডাক্তার খোঁজা এবং নিরাপদ দত্তক — সব এক জায়গায়।'
              : 'From AI-powered diagnostics to vaccination schedules, local providers, and safe adoption — all in one platform.'}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. AI Assistant (Large Span: 2x2) */}
          <Link
            to="/ai-assistant"
            className="group relative col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-primary to-emerald-900 border border-primary/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative p-8 flex-1 flex flex-col justify-between z-10 text-white">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2">
                    {language === 'bn' ? 'এআই পশু রোগ নির্ণয়' : 'AI Veterinary Diagnosis'}
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed max-w-sm">
                    {language === 'bn'
                      ? 'একবার সমস্যা লিখুন — সম্পূর্ণ রোগ নির্ণয়, চিকিৎসা পরামর্শ, জরুরি মাত্রা এবং নিকটস্থ ডাক্তার সাজেশন পান।'
                      : 'Describe symptoms once — get a complete diagnosis, care plan, urgency score, and nearby doctor suggestions instantly.'}
                  </p>
                </div>
              </div>
              
              {/* Decorative elements for the large card */}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-[10px] font-bold text-white backdrop-blur-sm">
                  <Activity className="w-3.5 h-3.5 text-rose-300" />
                  <span>{language === 'bn' ? 'জরুরি মাত্রা' : 'Urgency Scoring'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-[10px] font-bold text-white backdrop-blur-sm">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{language === 'bn' ? 'তাৎক্ষণিক' : 'Instant'}</span>
                </div>
              </div>
            </div>
            
            {/* Corner arrow */}
            <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-md">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* 2. Local Providers (Wide Span: 2x1) */}
          <Link
            to="/providers"
            className="group relative col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-500/15 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 p-6 md:p-8 flex items-center justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 pr-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-extrabold text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {language === 'bn' ? 'নিকটস্থ সেবাদাতা' : 'Find Local Providers'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {language === 'bn'
                  ? 'আপনার কাছের ভেট, গ্রুমার, ট্রেইনার ও ফার্মেসি খুঁজুন এবং বুকিং করুন।'
                  : 'Discover and book vets, groomers, trainers & pharmacies near you.'}
              </p>
            </div>
            {/* Visual element on the right */}
            <div className="relative z-10 hidden sm:flex flex-col gap-2 shrink-0">
              <div className="w-32 h-10 rounded-lg bg-background/80 border border-blue-500/10 flex items-center px-3 gap-2 shadow-sm backdrop-blur-sm">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"><MapPin className="w-3 h-3 text-blue-600" /></div>
                <div className="h-2 w-12 bg-blue-500/20 rounded-full" />
              </div>
              <div className="w-28 h-10 rounded-lg bg-background/80 border border-blue-500/10 flex items-center px-3 gap-2 shadow-sm ml-4 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><ShieldCheck className="w-3 h-3 text-emerald-600" /></div>
                <div className="h-2 w-10 bg-blue-500/20 rounded-full" />
              </div>
            </div>
          </Link>

          {/* 3. Guidelines (Standard: 1x1) */}
          <Link
            to="/guidelines"
            className="group relative col-span-1 bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-base font-extrabold text-foreground mb-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {language === 'bn' ? 'যত্ন নির্দেশিকা' : 'Care Guidelines'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {language === 'bn'
                  ? 'পুষ্টি, বাসস্থান ও ঋতুভিত্তিক যত্নের বিশেষজ্ঞ গাইড।'
                  : 'Expert-curated guides for nutrition, housing, and care.'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 mt-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>

          {/* 4. Vaccination (Standard: 1x1) */}
          <Link
            to="/vaccination"
            className="group relative col-span-1 bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Syringe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-extrabold text-foreground mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {language === 'bn' ? 'টিকার সময়সূচী' : 'Vaccinations'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {language === 'bn'
                  ? 'টিকার সম্পূর্ণ সময়সূচী, ডোজ ও বুস্টার তথ্য।'
                  : 'Complete immunization schedules, dosage & boosters.'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 mt-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>

          {/* 5. Rehoming (Wide Span: 2x1) */}
          <Link
            to="/rehoming"
            className="group relative col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-rose-50/50 to-pink-50/30 dark:from-rose-950/20 dark:to-pink-950/10 border border-rose-500/15 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-1 p-6 sm:p-8 flex items-center gap-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
              <Heart className="w-7 h-7 text-rose-600 dark:text-rose-400 fill-current" />
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="text-lg font-extrabold text-foreground mb-1.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {language === 'bn' ? 'নিরাপদ পোষা প্রাণী দত্তক' : 'Safe Pet Rehoming'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {language === 'bn'
                  ? 'নিরাপত্তা যাচাই ও এআই পলিশড আবেদনের মাধ্যমে বিড়াল ও কুকুর দত্তক নিন।'
                  : 'Adopt cats & dogs through verified listings with security checks.'}
              </p>
            </div>
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* 6. Emergency Resources (Wide Span: 2x1) */}
          <Link
            to="/resources"
            className="group relative col-span-1 md:col-span-2 lg:col-span-2 bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 p-6 sm:p-8 flex items-center gap-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
              <Building2 className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="text-lg font-extrabold text-foreground mb-1.5 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {language === 'bn' ? 'জরুরি সম্পদ ও হটলাইন' : 'Emergency Resources'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {language === 'bn'
                  ? 'সরকারি হাসপাতাল, এনজিও উদ্ধার দল ও জরুরি হটলাইনসমূহ।'
                  : 'Government hospitals, NGO rescue squads, and emergency hotlines.'}
              </p>
            </div>
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

        </div>
      </div>
    </section>
  )
}

export default FeaturesGrid
