import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { rehomingApi } from '../../api/rehoming'
import { useLanguage } from '../../hooks/useLanguage'
import ListingCard from '../rehoming/ListingCard'
import Spinner from '../ui/Spinner'
import { ArrowRight, Heart, Info, ClipboardCheck, Sparkles, MapPin } from 'lucide-react'

export const RehomingPreview = () => {
  const { language, t } = useLanguage()

  // Query latest 3 active rehoming listings
  const { data, isLoading } = useQuery({
    queryKey: ['latestListings'],
    queryFn: () => rehomingApi.getListings({ page_size: 3 }),
  })

  const listings = data?.results || []

  return (
    <section className="py-16 bg-gradient-to-b from-pcp-green-bg/30 via-background to-pcp-green-bg/20 border-b border-pcp-green-light/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pcp-green-accent/10 text-primary text-[10px] sm:text-xs font-bold border border-pcp-green-accent/20">
              <Heart className="w-3.5 h-3.5 fill-current text-pcp-green-accent animate-pulse" />
              <span>{language === 'bn' ? 'নিরাপদ দত্তক ও পুনর্বাসন' : 'Safety-First Pet Adoption'}</span>
            </div>
            
            <h2 className="text-xl md:text-3xl font-extrabold text-pcp-text-primary tracking-tight">
              {t('rehoming.title')}
            </h2>
            <p className="text-xs md:text-sm text-pcp-text-secondary font-semibold">
              {t('rehoming.subtitle')}
            </p>
          </div>

          <Link
            to="/rehoming"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:text-pcp-green-hover transition-colors border-b-2 border-transparent hover:border-primary pb-0.5"
          >
            <span>{language === 'bn' ? 'সকল দত্তক পোস্ট দেখুন' : 'Browse All Listings'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Safety Workflow Explainer Card Deck */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Step 1: Secure Listing */}
          <div className="bg-card border border-pcp-green-light/45 rounded-2xl p-5 shadow-sm space-y-2 relative group hover:border-primary/30 transition-all">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-primary/10 text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                {language === 'bn' ? '১. নিরাপদ পোস্ট তৈরি (শুধুমাত্র কুকুর/বিড়াল)' : '1. Secure Cat & Dog Listings'}
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed font-semibold">
              {language === 'bn'
                ? 'অনাকাঙ্ক্ষিত ব্যবসা ও পাচার রোধে আমাদের প্ল্যাটফর্মে শুধুমাত্র কুকুর ও বিড়ালের জন্য দত্তক পোস্ট করতে পারবেন। পোস্ট করার সময় বিস্তারিত কারণ প্রদর্শন আবশ্যক।'
                : 'Listing creation is strictly limited to cats and dogs to ensure safety. Owners must list descriptive profiles, vaccine history, and rehoming reasons.'}
            </p>
          </div>

          {/* Step 2: Strict Application */}
          <div className="bg-card border border-pcp-green-light/45 rounded-2xl p-5 shadow-sm space-y-2 relative group hover:border-primary/30 transition-all">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-pcp-green-accent/15 text-primary">
                <ClipboardCheck className="w-4 h-4 text-primary" />
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                {language === 'bn' ? '২. ভেটিং বা সিকিউরিটি কোশ্চেনিয়ার' : '2. Security Questionnaires'}
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed font-semibold">
              {language === 'bn'
                ? 'আবেদনকারীদের একটি কঠোর প্রশ্নোত্তর ফরম পূরণ করতে হবে যেখানে তাদের বাড়ির পরিবেশ, পূর্ব অভিজ্ঞতা এবং যত্ন নেওয়ার সক্ষমতা যাচাই করা হয়।'
                : 'Applicants must answer standard checks regarding home environment, budget capabilities, family consensus, & pet experience.'}
            </p>
          </div>

          {/* Step 3: Owner Vetting */}
          <div className="bg-card border border-pcp-green-light/45 rounded-2xl p-5 shadow-sm space-y-2 relative group hover:border-primary/30 transition-all">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-primary/10 text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                {language === 'bn' ? '৩. জেলাভিত্তিক ও রিয়েলটাইম অনুমোদন' : '3. Regional Vetting & Approvals'}
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed font-semibold">
              {language === 'bn'
                ? 'পশুকে বেশিদূর যাতায়াতের ধকল থেকে রক্ষা করতে এটি আপনার জেলায় ফিল্টার করে। মালিক রিয়েল-টাইমে আবেদন পর্যালোচনা করে অনুমোদন বা প্রত্যাখ্যান করতে পারেন।'
                : 'Adoptions are scoped to your local district circle to prevent stressful travels. Listing owners approve or reject applications in real time.'}
            </p>
          </div>

        </div>

        {/* Warning/Info Box */}
        <div className="p-4 bg-pcp-green-accent/5 border border-pcp-green-accent/20 rounded-2xl flex gap-3 text-left">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-pcp-text-secondary leading-relaxed font-semibold">
            {t('rehoming.notice')}
          </p>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border border-pcp-green-light/40 bg-card rounded-2xl p-5 space-y-4 animate-pulse aspect-square"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 px-4 bg-card border border-dashed border-pcp-green-light/60 rounded-2xl">
            <p className="text-sm font-bold text-pcp-text-secondary">
              {t('rehoming.no_listings')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="animate-fade-in-up hover:-translate-y-1 transition-all duration-300 relative group">
                <ListingCard listing={listing} />
                {/* Heart hover micro-animation effect */}
                <Heart className="absolute top-4 right-4 w-5 h-5 text-white/40 group-hover:text-pcp-green-accent group-hover:scale-125 transition-all duration-300 fill-transparent group-hover:fill-current pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default RehomingPreview
