import { useAuthStore } from '../store/authStore'
import { useLocation } from 'react-router-dom'
import bnTranslations from '../i18n/bn.json'
import enTranslations from '../i18n/en.json'

export const useLanguage = () => {
  let language = useAuthStore((state) => state.language)
  const setLanguage = useAuthStore((state) => state.setLanguage)

  try {
    const location = useLocation()
    if (location.pathname.startsWith('/dashboard')) {
      language = 'en' // Force English in dashboard
    }
  } catch (e) {
    // Ignore if not in router context
  }

  const translations = language === 'bn' ? bnTranslations : enTranslations

  const t = (path, replacements = {}) => {
    const keys = path.split('.')
    let value = translations
    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key]
      } else {
        return path
      }
    }

    // Support interpolation e.g. "free questions remaining: {count}"
    if (typeof value === 'string') {
      let result = value
      Object.keys(replacements).forEach((placeholder) => {
        result = result.replace(`{${placeholder}}`, replacements[placeholder])
      })
      return result
    }

    return value
  }

  const tField = (obj, fieldName) => {
    if (!obj) return ''
    // e.g. obj.title_bn or obj.title_en
    const localized = obj[`${fieldName}_${language}`]
    if (localized !== undefined && localized !== null && localized !== '') {
      return localized
    }
    // Fallback to English
    return obj[`${fieldName}_en`] || obj[fieldName] || ''
  }

  return { language, setLanguage, t, tField }
}
