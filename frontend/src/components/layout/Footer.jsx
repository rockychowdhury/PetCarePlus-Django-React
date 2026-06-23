import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { Heart, Mail, Phone, MapPin, Sparkles } from 'lucide-react'

export const Footer = () => {
  const { language, t } = useLanguage()

  const animalsList = [
    { name_en: 'Cat', name_bn: 'বিড়াল' },
    { name_en: 'Dog', name_bn: 'কুকুর' },
    { name_en: 'Rabbit', name_bn: 'খরগোশ' },
    { name_en: 'Bird', name_bn: 'পাখি' },
    { name_en: 'Cow', name_bn: 'গরু' },
    { name_en: 'Goat', name_bn: 'ছাগল' },
    { name_en: 'Chicken', name_bn: 'মুরগি' },
    { name_en: 'Duck', name_bn: 'হাঁস' },
  ]

  return (
    <footer className="bg-background border-t border-border/40 mt-auto relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-end">
        <div className="w-[800px] h-[300px] bg-primary/5 rounded-t-full blur-[100px] translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group inline-flex">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-primary/20 shrink-0 bg-[#CBE8B9] group-hover:scale-105 transition-transform duration-300">
                <img src="/favicon.png" alt="PetCarePlus Logo" className="w-[110%] h-auto max-w-none object-cover" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent tracking-tight">
                PetCarePlus
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'bn' 
                ? 'এআই রোগ নির্ণয়, নিকটস্থ ভেট খোঁজা, টিকার সময়সূচী, এবং নিরাপদ দত্তক — বাংলাদেশের প্রথম ডিজিটাল পশু যত্ন প্ল্যাটফর্ম।'
                : 'AI diagnostics, local vet discovery, vaccination schedules, and safe adoption — Bangladesh\'s first digital animal care platform.'}
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 w-max px-3 py-1.5 rounded-lg border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '১০০% বিনামূল্যে' : '100% Free Forever'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-extrabold text-foreground tracking-wider uppercase mb-6">
              {language === 'bn' ? 'দ্রুত নেভিগেশন' : 'Quick Links'}
            </h3>
            <ul className="space-y-3">
              {[
                { path: '/ai-assistant', label_en: 'AI Assistant', label_bn: 'এআই সহকারী' },
                { path: '/providers', label_en: 'Find Providers', label_bn: 'সেবাদাতা খুঁজুন' },
                { path: '/guidelines', label_en: 'Care Guidelines', label_bn: 'যত্ন নির্দেশিকা' },
                { path: '/vaccination', label_en: 'Vaccinations', label_bn: 'টিকার সময়সূচী' },
                { path: '/rehoming', label_en: 'Pet Rehoming', label_bn: 'দত্তক নিন' },
                { path: '/resources', label_en: 'Govt Resources', label_bn: 'সরকারি সেবাসমূহ' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-primary/50 group-hover:scale-150 transition-transform" />
                    {language === 'bn' ? link.label_bn : link.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Supported Animals Grid */}
          <div>
            <h3 className="text-sm font-extrabold text-foreground tracking-wider uppercase mb-6">
              {language === 'bn' ? 'সমর্থিত প্রাণীসমূহ' : 'Supported Animals'}
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              {animalsList.map((animal) => (
                <span
                  key={animal.name_en}
                  className="text-sm font-medium text-muted-foreground flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" />
                  {language === 'bn' ? animal.name_bn : animal.name_en}
                </span>
              ))}
            </div>
          </div>

          {/* Emergency & Support */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-foreground tracking-wider uppercase mb-6">
              {language === 'bn' ? 'জরুরি সহায়তা ও যোগাযোগ' : 'Emergency & Support'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {language === 'bn' ? '৩৩৩' : '333'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'জাতীয় তথ্য বাতায়ন' : 'National Information Center'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">support@petcareplus.com</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'যেকোনো জিজ্ঞাসায় ইমেইল করুন' : 'Email us for any queries'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0 group-hover:bg-rose-500/20 transition-colors">
                  <MapPin className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {language === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'প্রধান কার্যালয়' : 'Headquarters'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-border/40 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            &copy; {new Date().getFullYear()} PetCarePlus. {language === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </p>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            {language === 'bn' ? 'তৈরি করা হয়েছে' : 'Made with'} 
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> 
            {language === 'bn' ? 'বাংলাদেশে' : 'in Bangladesh'}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
