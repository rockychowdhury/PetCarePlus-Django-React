import React, { useRef } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { motion, useScroll, useTransform } from 'framer-motion'
import { UserPlus, Sparkles, Stethoscope, BookOpen, Heart, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    color: 'from-blue-500/10 to-indigo-500/5',
    hoverBg: 'group-hover:bg-blue-500',
    iconColor: 'text-blue-500',
    title_en: 'Create Your Profile',
    title_bn: 'প্রোফাইল তৈরি করুন',
    desc_en: 'Sign up for free, select whether you have companion pets or livestock, and set your location. The platform instantly adapts to your needs.',
    desc_bn: 'বিনামূল্যে সাইন আপ করুন, আপনার পোষা প্রাণী বা খামারের পশু নির্বাচন করুন এবং লোকেশন সেট করুন। প্ল্যাটফর্মটি আপনার প্রয়োজন অনুযায়ী সাজিয়ে যাবে.',
  },
  {
    icon: Sparkles,
    color: 'from-violet-500/10 to-purple-500/5',
    hoverBg: 'group-hover:bg-violet-500',
    iconColor: 'text-violet-500',
    title_en: 'Ask the AI Assistant',
    title_bn: 'এআই সহকারীকে জিজ্ঞাসা করুন',
    desc_en: 'Describe any symptoms or behavioral issues. The AI provides a 3-layer response: diagnosis, local doctor suggestions, and related care guides.',
    desc_bn: 'যেকোনো লক্ষণ বা সমস্যা লিখুন। এআই তাৎক্ষণিক রোগ নির্ণয়, স্থানীয় ডাক্তারের সাজেশন এবং প্রাসঙ্গিক যত্ন নির্দেশিকা প্রদান করবে।',
  },
  {
    icon: Stethoscope,
    color: 'from-emerald-500/10 to-teal-500/5',
    hoverBg: 'group-hover:bg-emerald-500',
    iconColor: 'text-emerald-500',
    title_en: 'Find Local Providers',
    title_bn: 'স্থানীয় সেবাদাতা খুঁজুন',
    desc_en: 'Need a vet or groomer? Our cascade search checks your Upazila first, then District, to find verified professionals near you. Book directly.',
    desc_bn: 'ভেট বা গ্রুমার প্রয়োজন? আমাদের স্মার্ট সার্চ আপনার উপজেলা ও জেলায় ভেরিফাইড সেবাদাতা খুঁজে বের করবে। সরাসরি বুকিং করুন।',
  },
  {
    icon: BookOpen,
    color: 'from-amber-500/10 to-orange-500/5',
    hoverBg: 'group-hover:bg-amber-500',
    iconColor: 'text-amber-500',
    title_en: 'Follow Care & Vaccines',
    title_bn: 'যত্ন ও টিকা অনুসরণ করুন',
    desc_en: 'Access expert-curated guidelines for housing, nutrition, and comprehensive vaccination schedules tailored exactly to your animal type.',
    desc_bn: 'আপনার পশুর ধরন অনুযায়ী বাসস্থান, পুষ্টি এবং টিকার সম্পূর্ণ সময়সূচীর জন্য বিশেষজ্ঞ নির্দেশিকা অনুসরণ করুন।',
  },
  {
    icon: Heart,
    color: 'from-rose-500/10 to-pink-500/5',
    hoverBg: 'group-hover:bg-rose-500',
    iconColor: 'text-rose-500',
    title_en: 'Adopt or Rehome Safely',
    title_bn: 'নিরাপদে দত্তক নিন',
    desc_en: 'Looking to add a furry friend? Browse secure cat and dog listings, answer AI-polished questionnaires, and adopt with confidence.',
    desc_bn: 'নতুন সঙ্গী খুঁজছেন? বিড়াল ও কুকুরের নিরাপদ পোস্টগুলো দেখুন, প্রশ্নোত্তর পূরণ করুন এবং নিরাপদে দত্তক নিন।',
  },
]

export const HowItWorks = () => {
  const { language } = useLanguage()
  const containerRef = useRef(null)

  // Use framer-motion to track scroll progress relative to the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  })

  // Map the 0-1 scroll progress to a height percentage for the line
  const height = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-b from-primary/5 to-transparent blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-accent/5 to-transparent blur-3xl opacity-50" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold border border-primary/15">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ব্যবহারবিধি' : 'User Journey'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {language === 'bn' ? 'কীভাবে কাজ করে?' : 'How It Works'}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {language === 'bn'
              ? 'খুব সহজেই শুরু করুন এবং প্ল্যাটফর্মের সর্বোচ্চ ব্যবহার নিশ্চিত করুন।'
              : 'Getting started is easy. Follow these steps to maximize your platform experience.'}
          </p>
        </div>

        {/* Vertical Timeline Container */}
        <div className="relative" ref={containerRef}>
          {/* Base vertical line (faded) */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-[3px] bg-border/40 rounded-full transform md:-translate-x-1/2" />
          
          {/* Animated Scroll Progress Line */}
          <motion.div 
            className="absolute left-8 md:left-1/2 top-4 w-[3px] bg-gradient-to-b from-primary via-emerald-400 to-primary rounded-full transform md:-translate-x-1/2 z-0 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            style={{ height }}
          />

          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 0

              return (
                <div key={index} className="relative flex flex-col md:flex-row items-start md:items-center group">
                  
                  {/* Left Side (Desktop) */}
                  <div className={`hidden md:block w-1/2 pr-12 ${!isEven ? 'md:order-1 text-right' : 'md:order-3 text-left pl-12 pr-0'}`}>
                    <motion.div 
                      initial={{ opacity: 0, x: !isEven ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5 }}
                      className={`bg-gradient-to-br ${step.color} border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-white/40 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h3 className={`text-lg font-extrabold text-foreground mb-2 relative z-10 ${!isEven && 'text-right'}`}>
                        {language === 'bn' ? step.title_bn : step.title_en}
                      </h3>
                      <p className={`text-sm text-muted-foreground leading-relaxed relative z-10 ${!isEven && 'text-right'}`}>
                        {language === 'bn' ? step.desc_bn : step.desc_en}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center md:order-2 z-20 mt-4 md:mt-0">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.3 }}
                      className={`w-12 h-12 rounded-2xl bg-background border-2 border-border/60 flex items-center justify-center shadow-md group-hover:border-transparent ${step.hoverBg} transition-all duration-300`}
                    >
                      <Icon className={`w-5 h-5 ${step.iconColor} group-hover:text-white transition-colors duration-300`} />
                    </motion.div>
                  </div>

                  {/* Mobile Side / Empty Spacer for Desktop */}
                  <div className={`w-full pl-20 md:w-1/2 ${isEven ? 'md:order-1 opacity-0 hidden md:block' : 'md:order-3 opacity-0 hidden md:block'}`}>
                    {/* Placeholder for alternating layout */}
                  </div>

                  {/* Mobile Content (Visible only on mobile) */}
                  <div className="w-full pl-20 md:hidden pb-4">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.4 }}
                      className={`bg-gradient-to-br ${step.color} border border-border/50 rounded-2xl p-5 shadow-sm mt-1`}
                    >
                      <h3 className="text-base font-extrabold text-foreground mb-2">
                        {language === 'bn' ? step.title_bn : step.title_en}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {language === 'bn' ? step.desc_bn : step.desc_en}
                      </p>
                    </motion.div>
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
