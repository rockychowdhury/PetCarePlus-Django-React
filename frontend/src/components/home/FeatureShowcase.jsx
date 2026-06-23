import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import {
  Heart, ShieldCheck, ClipboardCheck, Sparkles, MapPin, ArrowRight,
  Stethoscope, Brain, BookOpen, Syringe, Building2, Search,
  AlertTriangle, CheckCircle2, Zap, Globe, Users, FileText,
  Navigation, Layers, Shield, Eye
} from 'lucide-react'

/* ─────────────────────────── REHOMING SHOWCASE ─────────────────────────── */
const RehomingShowcase = ({ language }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
    {/* Left: Visual card stack */}
    <div className="flex justify-center order-2 lg:order-1">
      <div className="relative w-full max-w-sm">
        {/* Background glow */}
        <div className="absolute -inset-4 bg-gradient-to-br from-rose-500/10 to-pink-500/5 rounded-3xl blur-2xl" />
        
        {/* Main card */}
        <div className="relative bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/5 border-b border-border/40 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-foreground">
                  {language === 'bn' ? 'নিরাপদ দত্তক ব্যবস্থা' : 'Safe Rehoming System'}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium">
                  {language === 'bn' ? 'শুধুমাত্র বিড়াল ও কুকুর' : 'Cats & Dogs Only'}
                </div>
              </div>
            </div>
          </div>

          {/* Steps flow */}
          <div className="p-5 space-y-4">
            {[
              {
                icon: FileText,
                color: 'bg-rose-500/10 text-rose-500',
                step_en: 'Owner Creates Listing',
                step_bn: 'মালিক পোস্ট তৈরি করেন',
                desc_en: 'Photos, health info, vaccine history & rehoming reason',
                desc_bn: 'ছবি, স্বাস্থ্য তথ্য, টিকার ইতিহাস ও কারণ',
              },
              {
                icon: ClipboardCheck,
                color: 'bg-amber-500/10 text-amber-600',
                step_en: 'Adopter Applies',
                step_bn: 'দত্তক গ্রহণকারী আবেদন করেন',
                desc_en: 'Security questionnaire + AI-polished application',
                desc_bn: 'নিরাপত্তা প্রশ্নোত্তর + এআই পলিশড আবেদন',
              },
              {
                icon: ShieldCheck,
                color: 'bg-emerald-500/10 text-emerald-600',
                step_en: 'Owner Approves',
                step_bn: 'মালিক অনুমোদন দেন',
                desc_en: 'Real-time review, approve or reject in dashboard',
                desc_bn: 'রিয়েল-টাইম পর্যালোচনা, ড্যাশবোর্ডে অনুমোদন/প্রত্যাখ্যান',
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    {i < 2 && (
                      <div className="w-0.5 h-6 bg-border/60 mt-1" />
                    )}
                  </div>
                  <div className="pt-1">
                    <div className="text-xs font-extrabold text-foreground leading-tight">{language === 'bn' ? item.step_bn : item.step_en}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{language === 'bn' ? item.desc_bn : item.desc_en}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Safety badge */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/5 border border-rose-500/15 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{language === 'bn' ? 'পাচার ও অবৈধ ব্যবসা রোধে কঠোর নিরাপত্তা ব্যবস্থা' : 'Strict safety measures to prevent trafficking & illegal trade'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Right: Content */}
    <div className="space-y-6 text-center lg:text-left order-1 lg:order-2">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/8 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/15">
        <Heart className="w-3.5 h-3.5 fill-current" />
        <span>{language === 'bn' ? 'নিরাপদ পোষা প্রাণী দত্তক' : 'Safe Pet Rehoming'}</span>
      </div>

      <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
        {language === 'bn'
          ? 'প্রতিটি দত্তক হোক নিরাপদ ও দায়িত্বশীল'
          : 'Every Adoption Should Be Safe & Responsible'}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
        {language === 'bn'
          ? 'অনাকাঙ্ক্ষিত পাচার ও অবৈধ ব্যবসা রোধে আমাদের প্ল্যাটফর্মে শুধুমাত্র বিড়াল ও কুকুরের জন্য দত্তক পোস্ট করা যায়। প্রতিটি আবেদনকারীকে কঠোর নিরাপত্তা প্রশ্নোত্তর পূরণ করতে হয় এবং এআই তাদের আবেদনকে পেশাদারভাবে পলিশ করে দেয়।'
          : 'To prevent animal trafficking and illegal trade, our platform exclusively supports cat and dog rehoming. Every applicant must complete a strict security questionnaire, and AI polishes their application for a professional, trustworthy presentation.'}
      </p>

      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
        {[
          { icon: Eye, label_en: 'Verified Listings', label_bn: 'যাচাইকৃত পোস্ট' },
          { icon: Sparkles, label_en: 'AI Polished Apps', label_bn: 'এআই পলিশড আবেদন' },
          { icon: MapPin, label_en: 'District Scoped', label_bn: 'জেলাভিত্তিক' },
        ].map((pill, i) => {
          const Icon = pill.icon
          return (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/6 text-rose-600 dark:text-rose-400 text-[11px] font-bold border border-rose-500/12">
              <Icon className="w-3 h-3" />
              {language === 'bn' ? pill.label_bn : pill.label_en}
            </span>
          )
        })}
      </div>

      <Link
        to="/rehoming"
        className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-500/90 text-white font-extrabold rounded-xl shadow-lg shadow-rose-500/15 hover:shadow-xl transition-all active:scale-[0.97] text-sm"
      >
        <Heart className="w-4 h-4" />
        <span>{language === 'bn' ? 'দত্তক পোস্ট দেখুন' : 'Browse Adoptable Pets'}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  </div>
)

/* ──────────────── LOCATION-BASED PROVIDER FILTERING ──────────────── */
const LocationProviderShowcase = ({ language }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
    {/* Left: Content */}
    <div className="space-y-6 text-center lg:text-left">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/8 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/15">
        <MapPin className="w-3.5 h-3.5" />
        <span>{language === 'bn' ? 'স্মার্ট লোকেশন ফিল্টারিং' : 'Smart Location Filtering'}</span>
      </div>

      <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
        {language === 'bn'
          ? 'আপনার এলাকার সেবাদাতা স্বয়ংক্রিয়ভাবে খুঁজে পান'
          : 'Auto-Discover Providers Near Your Location'}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
        {language === 'bn'
          ? 'ক্যাসকেড অ্যালগরিদম প্রথমে আপনার উপজেলায় ডাক্তার খোঁজে। না পেলে জেলায়, তারপর বিভাগে এবং সবশেষে দেশব্যাপী। GPS বা ম্যানুয়াল সিলেকশন — দুইভাবেই কাজ করে।'
          : 'Our cascade algorithm first searches your upazila for providers. If none found, it expands to district, then division, and finally nationwide. Works with GPS auto-detection or manual location selection.'}
      </p>

      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
        {[
          { icon: Navigation, label_en: 'GPS Auto-Detect', label_bn: 'জিপিএস অটো ডিটেক্ট' },
          { icon: Stethoscope, label_en: '5 Provider Types', label_bn: '৫ ধরনের সেবাদাতা' },
          { icon: Users, label_en: 'Booking & Reviews', label_bn: 'বুকিং ও রিভিউ' },
        ].map((pill, i) => {
          const Icon = pill.icon
          return (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/6 text-blue-600 dark:text-blue-400 text-[11px] font-bold border border-blue-500/12">
              <Icon className="w-3 h-3" />
              {language === 'bn' ? pill.label_bn : pill.label_en}
            </span>
          )
        })}
      </div>

      <Link
        to="/providers"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-600/90 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/15 hover:shadow-xl transition-all active:scale-[0.97] text-sm"
      >
        <MapPin className="w-4 h-4" />
        <span>{language === 'bn' ? 'সেবাদাতা খুঁজুন' : 'Find Providers'}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>

    {/* Right: Cascade visualization */}
    <div className="flex justify-center">
      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-3xl blur-2xl" />
        <div className="relative bg-card border border-border/60 rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-extrabold text-foreground">
              {language === 'bn' ? 'ক্যাসকেড অনুসন্ধান' : 'Cascade Search'}
            </span>
          </div>

          {/* Cascade layers */}
          {[
            { level: '1', name_en: 'Upazila', name_bn: 'উপজেলা', radius: '~5 km', color: 'bg-blue-600', ring: 'ring-blue-600/20', width: 'w-full', opacity: 'opacity-100' },
            { level: '2', name_en: 'District', name_bn: 'জেলা', radius: '~15 km', color: 'bg-blue-500', ring: 'ring-blue-500/15', width: 'w-[90%]', opacity: 'opacity-85' },
            { level: '3', name_en: 'Division', name_bn: 'বিভাগ', radius: '~50 km', color: 'bg-blue-400', ring: 'ring-blue-400/10', width: 'w-[80%]', opacity: 'opacity-70' },
            { level: '4', name_en: 'Nationwide', name_bn: 'দেশব্যাপী', radius: '∞', color: 'bg-blue-300 dark:bg-blue-500/50', ring: 'ring-blue-300/10', width: 'w-[70%]', opacity: 'opacity-55' },
          ].map((layer, i) => (
            <div key={i} className={`${layer.width} mx-auto`}>
              <div className={`${layer.opacity} flex items-center justify-between px-4 py-3 rounded-xl ring-2 ${layer.ring} bg-gradient-to-r from-blue-500/5 to-transparent border border-blue-500/10 hover:from-blue-500/10 transition-all group`}>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-md ${layer.color} text-white text-[10px] font-extrabold flex items-center justify-center`}>
                    {layer.level}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {language === 'bn' ? layer.name_bn : layer.name_en}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">{layer.radius}</span>
              </div>
            </div>
          ))}

          <p className="text-[10px] text-center text-muted-foreground pt-2 font-medium">
            {language === 'bn'
              ? 'প্রতিটি স্তরে ডাক্তার না পেলে স্বয়ংক্রিয়ভাবে পরবর্তী স্তরে প্রসারিত হয়'
              : 'Automatically expands to next level if no providers found'}
          </p>
        </div>
      </div>
    </div>
  </div>
)

/* ──────────────────── 3-LAYER AI RESPONSE ──────────────────── */
const AIResponseShowcase = ({ language }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
    {/* Left: Visual */}
    <div className="flex justify-center order-2 lg:order-1">
      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/10 to-purple-500/5 rounded-3xl blur-2xl" />
        <div className="relative bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/5 border-b border-border/40 px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-xs font-extrabold text-foreground">
              {language === 'bn' ? 'এআই ৩-স্তরের রেসপন্স' : 'AI 3-Layer Response'}
            </div>
          </div>

          <div className="p-5 space-y-3">
            {/* Layer 1: Diagnosis */}
            <div className="border border-violet-500/15 rounded-xl p-4 bg-gradient-to-br from-violet-500/5 to-transparent space-y-2 hover:border-violet-500/30 transition-all">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-violet-600 text-white text-[9px] font-extrabold flex items-center justify-center">1</span>
                <span className="text-xs font-extrabold text-violet-700 dark:text-violet-400">
                  {language === 'bn' ? 'রোগ নির্ণয় ও চিকিৎসা' : 'Diagnosis & Treatment'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-7">
                {language === 'bn'
                  ? 'সম্ভাব্য রোগ, প্রাথমিক চিকিৎসা, ঘরোয়া যত্ন, জরুরি মাত্রা (🟢🟡🔴) এবং সতর্কতা সংকেত।'
                  : 'Possible diseases, first aid, home care, urgency level (🟢🟡🔴), warning & hope signs.'}
              </p>
            </div>

            {/* Layer 2: Providers */}
            <div className="border border-blue-500/15 rounded-xl p-4 bg-gradient-to-br from-blue-500/5 to-transparent space-y-2 hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[9px] font-extrabold flex items-center justify-center">2</span>
                <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400">
                  {language === 'bn' ? 'নিকটস্থ ডাক্তার সাজেশন' : 'Nearby Provider Suggestions'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-7">
                {language === 'bn'
                  ? 'আপনার এলাকার সেরা রেটিংযুক্ত ভেট ডাক্তারের তালিকা স্বয়ংক্রিয়ভাবে যোগ হয়।'
                  : 'Auto-ranked top-rated local vets are attached based on your location context.'}
              </p>
            </div>

            {/* Layer 3: Resources */}
            <div className="border border-emerald-500/15 rounded-xl p-4 bg-gradient-to-br from-emerald-500/5 to-transparent space-y-2 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[9px] font-extrabold flex items-center justify-center">3</span>
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                  {language === 'bn' ? 'প্রাসঙ্গিক তথ্য ও রিসোর্স' : 'Related Resources & Guides'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-7">
                {language === 'bn'
                  ? 'সম্পর্কিত গাইডলাইন, সরকারি হাসপাতাল ও জরুরি হটলাইন স্বয়ংক্রিয়ভাবে সংযুক্ত হয়।'
                  : 'Matching guidelines, government hospitals & emergency hotlines are auto-linked.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Right: Content */}
    <div className="space-y-6 text-center lg:text-left order-1 lg:order-2">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/8 text-violet-600 dark:text-violet-400 text-xs font-bold border border-violet-500/15">
        <Layers className="w-3.5 h-3.5" />
        <span>{language === 'bn' ? '৩-স্তরের এআই রেসপন্স' : '3-Layer AI Response'}</span>
      </div>

      <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
        {language === 'bn'
          ? 'একটি প্রশ্ন, তিনটি স্তরের উত্তর'
          : 'One Question, Three Layers of Answers'}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
        {language === 'bn'
          ? 'শুধু আপনার পশুর সমস্যা লিখুন — এআই একবারেই তিনটি স্তরে সম্পূর্ণ উত্তর দেবে: রোগ নির্ণয় ও চিকিৎসা পরামর্শ, আপনার এলাকার ডাক্তার সাজেশন, এবং সংশ্লিষ্ট গাইডলাইন ও সরকারি সম্পদের তালিকা।'
          : 'Just describe your animal\'s problem — the AI responds with three comprehensive layers in one go: complete diagnosis with care advice, auto-ranked local provider suggestions, and matching guidelines with government resource links.'}
      </p>

      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
        {[
          { icon: AlertTriangle, label_en: 'Urgency Scoring', label_bn: 'জরুরি মাত্রা' },
          { icon: Globe, label_en: 'Bilingual Output', label_bn: 'দ্বিভাষিক উত্তর' },
          { icon: Zap, label_en: 'Instant Analysis', label_bn: 'তাৎক্ষণিক বিশ্লেষণ' },
        ].map((pill, i) => {
          const Icon = pill.icon
          return (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/6 text-violet-600 dark:text-violet-400 text-[11px] font-bold border border-violet-500/12">
              <Icon className="w-3 h-3" />
              {language === 'bn' ? pill.label_bn : pill.label_en}
            </span>
          )
        })}
      </div>

      <Link
        to="/ai-assistant"
        className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-600/90 text-white font-extrabold rounded-xl shadow-lg shadow-violet-600/15 hover:shadow-xl transition-all active:scale-[0.97] text-sm"
      >
        <Sparkles className="w-4 h-4 fill-current" />
        <span>{language === 'bn' ? 'এআই ব্যবহার করুন' : 'Try AI Assistant'}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  </div>
)

/* ──────────────── RESOURCES & GUIDELINES ──────────────── */
const ResourcesGuidelinesShowcase = ({ language }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
    {/* Left: Content */}
    <div className="space-y-6 text-center lg:text-left">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/15">
        <BookOpen className="w-3.5 h-3.5" />
        <span>{language === 'bn' ? 'নির্দেশিকা ও সম্পদ' : 'Guidelines & Resources'}</span>
      </div>

      <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
        {language === 'bn'
          ? 'বিশেষজ্ঞ নির্দেশিকা ও সরকারি সম্পদ এক জায়গায়'
          : 'Expert Guides & Government Resources in One Place'}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
        {language === 'bn'
          ? 'পশু চিকিৎসকদের দ্বারা প্রমাণিত যত্ন নির্দেশিকা, সম্পূর্ণ টিকার সময়সূচী, এবং আপনার জেলার সরকারি পশু হাসপাতাল, এনজিও ও জরুরি হটলাইন — সবকিছু এক প্ল্যাটফর্মে।'
          : 'Vet-approved care guidelines, complete vaccination schedules, and your district\'s government animal hospitals, NGOs & emergency hotlines — all consolidated in one platform.'}
      </p>

      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
        {[
          { icon: BookOpen, label_en: 'Care Guides', label_bn: 'যত্ন নির্দেশিকা' },
          { icon: Syringe, label_en: 'Vaccine Schedules', label_bn: 'টিকার সময়সূচী' },
          { icon: Building2, label_en: 'Govt. Hospitals', label_bn: 'সরকারি হাসপাতাল' },
        ].map((pill, i) => {
          const Icon = pill.icon
          return (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/6 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/12">
              <Icon className="w-3 h-3" />
              {language === 'bn' ? pill.label_bn : pill.label_en}
            </span>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
        <Link
          to="/guidelines"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-[0.97] text-xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'গাইডলাইন দেখুন' : 'View Guidelines'}</span>
        </Link>
        <Link
          to="/vaccination"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border/60 text-foreground hover:bg-muted/30 font-extrabold rounded-xl shadow-sm transition-all active:scale-[0.97] text-xs"
        >
          <Syringe className="w-3.5 h-3.5 text-primary" />
          <span>{language === 'bn' ? 'টিকার তথ্য' : 'Vaccinations'}</span>
        </Link>
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border/60 text-foreground hover:bg-muted/30 font-extrabold rounded-xl shadow-sm transition-all active:scale-[0.97] text-xs"
        >
          <Building2 className="w-3.5 h-3.5 text-primary" />
          <span>{language === 'bn' ? 'সরকারি সম্পদ' : 'Resources'}</span>
        </Link>
      </div>
    </div>

    {/* Right: Visual cards */}
    <div className="flex justify-center">
      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl blur-2xl" />
        <div className="relative space-y-3">
          {/* Guidelines card */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">{language === 'bn' ? 'যত্ন নির্দেশিকা' : 'Care Guidelines'}</h4>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {language === 'bn' ? 'পুষ্টি, গ্রুমিং, বাসস্থান ও ঋতুভিত্তিক যত্নের বিশেষজ্ঞ গাইড' : 'Expert guides for nutrition, grooming, housing & seasonal care'}
                </p>
              </div>
            </div>
          </div>

          {/* Vaccination card */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Syringe className="w-5.5 h-5.5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">{language === 'bn' ? 'টিকার সময়সূচী' : 'Vaccination Schedules'}</h4>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {language === 'bn' ? 'ডোজ, বয়স, লক্ষ্য রোগ ও বুস্টার ব্যবধান সহ সম্পূর্ণ তথ্য' : 'Complete dosage, age requirements, target diseases & booster info'}
                </p>
              </div>
            </div>
          </div>

          {/* Government resources card */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Building2 className="w-5.5 h-5.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">{language === 'bn' ? 'সরকারি সম্পদ ও হটলাইন' : 'Govt. Resources & Hotlines'}</h4>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {language === 'bn' ? 'জেলাভিত্তিক পশু হাসপাতাল, এনজিও ও জরুরি নম্বর' : 'District-scoped animal hospitals, NGOs & emergency numbers'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

/* ──────────────────── MAIN EXPORT ──────────────────── */
export const FeatureShowcase = () => {
  const { language } = useLanguage()

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto pt-20 pb-16 space-y-4">
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            {language === 'bn'
              ? 'কেন PetCarePlus আলাদা?'
              : 'What Makes PetCarePlus Different?'}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {language === 'bn'
              ? 'শুধু তথ্য নয় — স্মার্ট ফিল্টারিং, এআই বিশ্লেষণ ও নিরাপদ দত্তক ব্যবস্থা সহ একটি সম্পূর্ণ ইকোসিস্টেম।'
              : 'Not just information — a complete ecosystem with smart filtering, AI analysis & safe adoption workflows.'}
          </p>
        </div>

        {/* Feature blocks with dividers */}
        <div className="space-y-0">
          {/* Block 1: Location-based filtering */}
          <div className="py-16 md:py-20">
            <LocationProviderShowcase language={language} />
          </div>

          <div className="border-t border-border/40" />

          {/* Block 2: 3-Layer AI Response */}
          <div className="py-16 md:py-20">
            <AIResponseShowcase language={language} />
          </div>

          <div className="border-t border-border/40" />

          {/* Block 3: Rehoming */}
          <div className="py-16 md:py-20">
            <RehomingShowcase language={language} />
          </div>

          <div className="border-t border-border/40" />

          {/* Block 4: Resources & Guidelines */}
          <div className="py-16 md:py-20">
            <ResourcesGuidelinesShowcase language={language} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureShowcase
