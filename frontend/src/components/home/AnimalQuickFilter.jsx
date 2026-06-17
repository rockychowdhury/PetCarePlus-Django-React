import React from 'react'
import AnimalFilter from '../guidelines/AnimalFilter'
import { useLanguage } from '../../hooks/useLanguage'
import { CheckCircle2, Heart, Award, Sparkles, Filter } from 'lucide-react'

export const AnimalQuickFilter = ({ activeAnimalId, onSelectAnimal }) => {
  const { language } = useLanguage()

  return (
    <section className="py-10 bg-gradient-to-r from-pcp-green/5 via-pcp-green-muted/20 to-pcp-green/5 border-b border-pcp-green-light/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header and Filter Explanation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              <Filter className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'স্মার্ট ফিল্টারিং ফিচার' : 'Smart Filtering Capabilities'}</span>
            </div>
            
            <h3 className="text-lg sm:text-2xl font-extrabold text-pcp-text-primary">
              {language === 'bn' ? 'প্রাণীভিত্তিক দ্রুত অনুসন্ধান ডেস্ক' : 'Animal-Based Interactive Filter'}
            </h3>
            
            <p className="text-xs sm:text-sm text-pcp-text-secondary leading-relaxed font-semibold">
              {language === 'bn'
                ? 'একটি নির্দিষ্ট প্রাণী কার্ড নির্বাচন করলে পুরো হোমপেজ জুড়ে কেবল সেই প্রাণীর টিকা নির্দেশিকা এবং বিশেষায়িত কেয়ার গাইড সক্রিয় হবে।'
                : 'Selecting any card immediately updates the care guidelines and vaccination reference tables below to match your focus.'}
            </p>
          </div>

          {/* Dynamic Category Showcase Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Companion Animals Card */}
            <div className="bg-card border border-pcp-green-light/30 rounded-2xl p-4 shadow-sm text-left hover:border-primary/30 transition-all">
              <div className="flex items-center gap-2 pb-1.5 border-b border-pcp-green-light/10">
                <span className="w-2.5 h-2.5 rounded-full bg-pcp-green-accent" />
                <h4 className="text-xs font-extrabold text-pcp-text-primary">
                  {language === 'bn' ? 'গৃহপালিত প্রাণী (Companion)' : 'Companion Animal Tier'}
                </h4>
              </div>
              <p className="text-[10px] sm:text-xs text-pcp-text-muted pt-2 leading-relaxed">
                {language === 'bn'
                  ? 'বিড়াল, কুকুর, খরগোশ, ও পাখি। এই ক্যাটাগরিতে বিশেষায়িত দত্তক (Rehoming) এবং গৃহপালিত পেটের স্বাস্থ্যসেবা গাইড অন্তর্ভুক্ত।'
                  : 'Cats, Dogs, Rabbits, & Birds. Unlocks safety rehoming lists and domestic wellness monitoring.'}
              </p>
            </div>

            {/* Livestock Animals Card */}
            <div className="bg-card border border-pcp-green-light/30 rounded-2xl p-4 shadow-sm text-left hover:border-primary/30 transition-all">
              <div className="flex items-center gap-2 pb-1.5 border-b border-pcp-green-light/10">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h4 className="text-xs font-extrabold text-pcp-text-primary">
                  {language === 'bn' ? 'খামারের গবাদিপশু (Livestock)' : 'Livestock Farming Tier'}
                </h4>
              </div>
              <p className="text-[10px] sm:text-xs text-pcp-text-muted pt-2 leading-relaxed">
                {language === 'bn'
                  ? 'গরু, ছাগল, মুরগি, ও হাঁস। এই ক্যাটাগরিতে সরকারি কৃষি সেবা, বড় পশুর জটিল সংক্রামক টিকা এবং খামার ব্যবস্থাপনা অর্ন্তভুক্ত।'
                  : 'Cows, Goats, Chickens, & Ducks. Focuses on agricultural vaccination lookup and local public clinics.'}
              </p>
            </div>
          </div>
        </div>

        {/* The Horizontal Sliding Selector */}
        <div className="pt-2 border-t border-pcp-green-light/15">
          <AnimalFilter activeAnimalId={activeAnimalId} onSelectAnimal={onSelectAnimal} />
        </div>
      </div>
    </section>
  )
}

export default AnimalQuickFilter
