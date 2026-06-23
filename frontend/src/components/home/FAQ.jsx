import React, { useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { HelpCircle, ChevronDown } from 'lucide-react'

const faqs = [
  {
    q_en: 'Is PetCarePlus completely free to use?',
    q_bn: 'PetCarePlus কি সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়?',
    a_en: 'Yes, absolutely. PetCarePlus is a 100% free platform. We do not charge for AI diagnostics, provider searches, or accessing our care guidelines and vaccination schedules.',
    a_bn: 'হ্যাঁ, অবশ্যই। PetCarePlus একটি ১০০% বিনামূল্যের প্ল্যাটফর্ম। এআই ডায়াগনস্টিক, সেবাদাতা অনুসন্ধান, কিংবা আমাদের যত্ন নির্দেশিকা এবং টিকার সময়সূচী অ্যাক্সেস করার জন্য আমরা কোনো চার্জ নিই না।'
  },
  {
    q_en: 'How accurate is the AI Veterinary Diagnosis?',
    q_bn: 'এআই পশু রোগ নির্ণয় কতটা নির্ভুল?',
    a_en: 'Our AI is powered by an advanced Gemini model trained on extensive veterinary data. While it provides highly accurate initial assessments and urgency scoring, it is meant to assist you, not replace a professional veterinarian. Always consult a vet for serious issues.',
    a_bn: 'আমাদের এআই একটি উন্নত মডেল দ্বারা চালিত যা ব্যাপক ভেটেরিনারি ডেটার উপর প্রশিক্ষিত। এটি অত্যন্ত নির্ভুল প্রাথমিক মূল্যায়ন এবং জরুরি মাত্রা প্রদান করলেও, এটি একজন পেশাদার পশু চিকিৎসকের বিকল্প নয়। গুরুতর সমস্যার জন্য সবসময় একজন ভেটের পরামর্শ নিন।'
  },
  {
    q_en: 'Can I find both pet and livestock doctors here?',
    q_bn: 'আমি কি এখানে পোষা প্রাণী এবং গবাদিপশু উভয়ের ডাক্তার খুঁজে পাবো?',
    a_en: 'Yes! PetCarePlus supports a wide range of animals including companion pets (cats, dogs, birds) and livestock (cows, goats, chickens). Our provider network includes specialists for all types of animals.',
    a_bn: 'হ্যাঁ! PetCarePlus পোষা প্রাণী (বিড়াল, কুকুর, পাখি) এবং গবাদিপশু (গরু, ছাগল, মুরগি) সহ বিভিন্ন প্রাণীর সমর্থন করে। আমাদের সেবাদাতা নেটওয়ার্কে সব ধরনের প্রাণীর বিশেষজ্ঞ অন্তর্ভুক্ত রয়েছে।'
  },
  {
    q_en: 'How does the safe pet rehoming system work?',
    q_bn: 'নিরাপদ পোষা প্রাণী দত্তক ব্যবস্থা কীভাবে কাজ করে?',
    a_en: 'To prevent illegal trade, our rehoming feature is restricted to cats and dogs. Adopters must fill out a security questionnaire which is polished by AI for the current owner to review. Both parties can communicate safely through the platform before finalizing the adoption.',
    a_bn: 'অবৈধ ব্যবসা রোধ করতে, আমাদের দত্তক ব্যবস্থা শুধুমাত্র বিড়াল এবং কুকুরের জন্য সীমাবদ্ধ। দত্তক গ্রহণকারীদের একটি নিরাপত্তা প্রশ্নাবলী পূরণ করতে হয় যা এআই দ্বারা পলিশ করে বর্তমান মালিককে পর্যালোচনার জন্য দেওয়া হয়। দত্তক চূড়ান্ত করার আগে উভয় পক্ষ প্ল্যাটফর্মের মাধ্যমে নিরাপদে যোগাযোগ করতে পারেন।'
  },
  {
    q_en: 'What if I cannot find a provider in my area?',
    q_bn: 'আমার এলাকায় কোনো সেবাদাতা খুঁজে না পেলে কী হবে?',
    a_en: 'Our platform uses a smart "Cascade Search" algorithm. If no providers are found in your immediate Upazila, it automatically expands the search to your District, then Division, and finally Nationwide, ensuring you always get results.',
    a_bn: 'আমাদের প্ল্যাটফর্ম একটি স্মার্ট "ক্যাসকেড সার্চ" অ্যালগরিদম ব্যবহার করে। যদি আপনার উপজেলায় কোনো সেবাদাতা না পাওয়া যায়, তবে এটি স্বয়ংক্রিয়ভাবে আপনার জেলা, তারপর বিভাগ এবং সর্বশেষে দেশব্যাপী অনুসন্ধান প্রসারিত করে, যাতে আপনি সর্বদা ফলাফল পান।'
  }
]

export const FAQ = () => {
  const { language } = useLanguage()
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold border border-primary/15">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সাধারণ জিজ্ঞাসা' : 'FAQs'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {language === 'bn' ? 'প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী' : 'Frequently Asked Questions'}
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div 
                key={index}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'bg-card border-primary/30 shadow-md' 
                    : 'bg-background border-border/60 hover:border-primary/20 hover:bg-card/50'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <span className={`text-base font-extrabold pr-8 transition-colors ${isOpen ? 'text-primary' : 'text-foreground'}`}>
                    {language === 'bn' ? faq.q_bn : faq.q_en}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'bg-primary/10 rotate-180' : 'bg-muted'}`}>
                    <ChevronDown className={`w-4 h-4 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                    {language === 'bn' ? faq.a_bn : faq.a_en}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default FAQ
