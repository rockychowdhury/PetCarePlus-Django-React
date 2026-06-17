import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'

export const Footer = () => {
  const { t } = useLanguage()

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
    <footer className="bg-pcp-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-xl font-bold bg-gradient-to-r from-pcp-green to-pcp-green-light bg-clip-text text-transparent">
              PetCarePlus
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              {t('nav.guidelines')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/guidelines" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.guidelines')}
                </Link>
              </li>
              <li>
                <Link to="/vaccination" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.vaccination')}
                </Link>
              </li>
              <li>
                <Link to="/providers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.providers')}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.govt_resources')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Animals Grid */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              সমর্থিত প্রাণীসমূহ
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {animalsList.map((animal) => (
                <span
                  key={animal.name_en}
                  className="text-sm text-muted-foreground cursor-default hover:text-primary transition-colors"
                >
                  • {t('common.bangla') === 'বাংলা' ? animal.name_bn : animal.name_en}
                </span>
              ))}
            </div>
          </div>

          {/* Emergency & Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              জরুরি সহায়তা ও যোগাযোগ
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4 text-primary" />
              <span>৩৩৩ (জাতীয় তথ্য বাতায়ন)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <span>support@petcareplus.com.bd</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>ঢাকা, বাংলাদেশ</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PetCarePlus. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
