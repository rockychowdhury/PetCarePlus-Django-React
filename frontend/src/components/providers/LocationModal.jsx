import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, X, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { locationsApi } from '../../api/locations'
import { useLocationStore } from '../../store/locationStore'
import { CustomSelect } from '../common/CustomSelect'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'



export const LocationModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage()
  const { user } = useAuthStore()
  const {
    division: storeDiv, district: storeDist, upazila: storeUpz, union: storeUnion,
    latitude: storeLat, longitude: storeLng, setLocation
  } = useLocationStore()

  const [divisionId, setDivisionId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [upazilaId, setUpazilaId] = useState('')
  const [unionId, setUnionId] = useState('')
  const [lat, setLat] = useState(storeLat || null)
  const [lng, setLng] = useState(storeLng || null)
  const [gpsStatus, setGpsStatus] = useState('')

  const { data: divisions = [] } = useQuery({
    queryKey: ['locations', 'divisions'],
    queryFn: locationsApi.getDivisions,
  })

  const { data: districts = [] } = useQuery({
    queryKey: ['locations', 'districts', divisionId],
    queryFn: () => locationsApi.getDistricts(divisionId),
    enabled: !!divisionId,
  })

  const { data: upazilas = [] } = useQuery({
    queryKey: ['locations', 'upazilas', districtId],
    queryFn: () => locationsApi.getUpazilas(districtId),
    enabled: !!districtId,
  })

  const { data: unions = [] } = useQuery({
    queryKey: ['locations', 'unions', upazilaId],
    queryFn: () => locationsApi.getUnions(upazilaId),
    enabled: !!upazilaId,
  })

  const [autoFillTarget, setAutoFillTarget] = useState(null)

  // Pre-fill IDs if we have string names in the store
  useEffect(() => {
    if (storeDiv && divisions.length && !divisionId) {
      const d = divisions.find(x => x.name_en === storeDiv)
      if (d) setDivisionId(d.id)
    }
  }, [storeDiv, divisions])

  const handleGps = () => {
    setGpsStatus(language === 'bn' ? 'সনাক্ত করা হচ্ছে...' : 'Detecting...')
    if (!navigator.geolocation) {
      setGpsStatus(language === 'bn' ? 'সমর্থিত নয়' : 'Not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude
        const longitude = pos.coords.longitude
        setLat(latitude)
        setLng(longitude)
        
        // Detect if coordinates are outside Bangladesh boundary box
        if (latitude < 20.0 || latitude > 27.0 || longitude < 88.0 || longitude > 93.0) {
          setGpsStatus('outside_bd')
          return
        }

        setGpsStatus(language === 'bn' ? 'ঠিকানা খোঁজা হচ্ছে...' : 'Reversing address...')

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
          const data = await res.json()
          if (data && data.address) {
            const addr = data.address
            const divName = addr.state?.replace(' Division', '') || ''
            const distName = (addr.state_district || addr.county || addr.city)?.replace(' District', '') || ''
            const upzName = addr.city || addr.town || addr.county || ''
            const unionName = addr.suburb || addr.village || addr.neighbourhood || ''

            setAutoFillTarget({ 
              division: divName, 
              district: distName, 
              upazila: upzName, 
              union: unionName,
              rawAddressText: `${data.display_name} ${Object.values(addr).join(' ')}`.toLowerCase()
            })
            setGpsStatus(language === 'bn' ? 'অবস্থান পূরণ হয়েছে!' : 'Location auto-filled!')
          } else {
            setGpsStatus(language === 'bn' ? 'ঠিকানা পাওয়া যায়নি' : 'Address not found')
          }
        } catch (e) {
          setGpsStatus(language === 'bn' ? 'ভুল হয়েছে' : 'Reverse geocode failed')
        }
      },
      () => setGpsStatus(language === 'bn' ? 'ব্যর্থ হয়েছে' : 'Failed')
    )
  }

  // Cascading auto-fill state machine using raw geocode address details
  useEffect(() => {
    if (!autoFillTarget) return

    // 1. Division Matching
    if (divisions.length > 0 && !divisionId) {
      const match = divisions.find(d => 
        autoFillTarget.rawAddressText.includes(d.name_en.toLowerCase()) ||
        (autoFillTarget.division && autoFillTarget.division.toLowerCase().includes(d.name_en.toLowerCase()))
      )
      if (match) {
        setDivisionId(match.id)
      } else {
        setAutoFillTarget(null) // Stop if division doesn't match
      }
    }

    // 2. District Matching
    if (divisionId && districts.length > 0 && !districtId) {
      const match = districts.find(d => 
        autoFillTarget.rawAddressText.includes(d.name_en.toLowerCase()) ||
        (autoFillTarget.district && autoFillTarget.district.toLowerCase().includes(d.name_en.toLowerCase()))
      )
      if (match) {
        setDistrictId(match.id)
      } else {
        setDistrictId(districts[0]?.id || '') // Fallback
      }
    }

    // 3. Upazila Matching
    if (districtId && upazilas.length > 0 && !upazilaId) {
      let match = upazilas.find(u => {
        const cleanName = u.name_en.toLowerCase().replace(' sadar', '').replace(' city corporat', '').replace(' city corporation', '').trim()
        return autoFillTarget.rawAddressText.includes(cleanName)
      })

      // Fallback for metropolitan Dhaka city addresses
      if (!match) {
        const activeDist = districts.find(d => String(d.id) === String(districtId))
        if (activeDist && activeDist.name_en.toLowerCase() === 'dhaka') {
          match = upazilas.find(u => u.name_en.toLowerCase().includes('dhaka north'))
        }
      }

      if (match) {
        setUpazilaId(match.id)
      } else {
        setUpazilaId(upazilas[0]?.id || '') // Fallback
      }
    }

    // 4. Union Matching
    if (upazilaId && unions.length > 0 && !unionId) {
      const match = unions.find(u => 
        autoFillTarget.rawAddressText.includes(u.name_en.toLowerCase())
      )
      if (match) {
        setUnionId(match.id)
      } else {
        setUnionId(unions[0]?.id || '') // Fallback
      }
      setAutoFillTarget(null) // Done autofilling!
    }
  }, [autoFillTarget, divisions, districts, upazilas, unions, divisionId, districtId, upazilaId, unionId])

  const handleSave = () => {
    const selectedDivision = divisions.find(d => String(d.id) === String(divisionId))?.name_en || ''
    const selectedDistrict = districts.find(d => String(d.id) === String(districtId))?.name_en || ''
    const selectedUpazila = upazilas.find(u => String(u.id) === String(upazilaId))?.name_en || ''
    const selectedUnion = unions.find(u => String(u.id) === String(unionId))?.name_en || ''

    setLocation({
      division: selectedDivision,
      district: selectedDistrict,
      upazila: selectedUpazila,
      union: selectedUnion,
      latitude: lat,
      longitude: lng
    })
    
    onClose()
  }

  if (!isOpen) return null

  // Recruiters/Outside Bangladesh welcoming modal view
  if (gpsStatus === 'outside_bd') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border/60 overflow-hidden p-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-pcp-green-bg dark:bg-pcp-green/10 flex items-center justify-center text-pcp-green text-3xl">
            🇧🇩
          </div>
          
          <div className="space-y-2">
            <h3 className="font-extrabold text-xl text-pcp-text-primary dark:text-foreground">
              {language === 'bn' ? 'আমরা শুধুমাত্র বাংলাদেশে সেবা প্রদান করি' : 'We Only Operate in Bangladesh'}
            </h3>
            <p className="text-sm text-pcp-text-muted dark:text-muted-foreground leading-relaxed">
              {language === 'bn' 
                ? 'পেটকেয়ার প্লাস-এ স্বাগতম! বর্তমানে আমাদের সেবা শুধুমাত্র বাংলাদেশেই সীমাবদ্ধ। আমাদের অ্যাপটি পরীক্ষা করার জন্য আপনাকে ধন্যবাদ!'
                : 'Welcome to PetCarePlus! Currently, our operations and services are fully localized within Bangladesh. Thank you so much for reviewing our application!'}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                setDivisionId('')
                setDistrictId('')
                setUpazilaId('')
                setUnionId('')
                setLocation({
                  division: '',
                  district: '',
                  upazila: '',
                  union: '',
                  latitude: 23.8103, // Default Dhaka coordinates
                  longitude: 90.4125
                })
                setGpsStatus('')
                onClose()
              }}
              className="w-full py-3 bg-pcp-green hover:bg-pcp-green-hover text-white font-bold rounded-xl transition-all shadow-md"
            >
              {language === 'bn' ? 'বাংলাদেশ নির্বাচন করুন' : 'Load Default Location (Bangladesh)'}
            </button>
            
            <button 
              onClick={() => {
                setGpsStatus('')
                onClose()
              }}
              className="text-xs font-bold text-pcp-text-secondary hover:underline"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border/60 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {language === 'bn' ? 'অনুসন্ধানের অবস্থান নির্ধারণ করুন' : 'Set Search Location'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <button 
              onClick={handleGps}
              className="flex-grow flex items-center justify-center gap-2 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors border border-primary/20 text-xs sm:text-sm"
            >
              <Navigation className="w-4 h-4" />
              {gpsStatus || (language === 'bn' ? "বর্তমান জিপিএস অবস্থান" : "Use GPS Location")}
            </button>
            <button 
              onClick={() => {
                setDivisionId('')
                setDistrictId('')
                setUpazilaId('')
                setUnionId('')
                setLat(null)
                setLng(null)
                setGpsStatus('')
                setLocation({
                  division: '',
                  district: '',
                  upazila: '',
                  union: '',
                  latitude: null,
                  longitude: null
                })
                onClose()
              }}
              className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold rounded-xl transition-colors text-xs sm:text-sm border"
              title={language === 'bn' ? 'বাংলাদেশ রিসেট' : 'Reset to Bangladesh'}
            >
              {language === 'bn' ? 'রিসেট' : 'Reset'}
            </button>
          </div>
          
          {(lat && lng) && gpsStatus !== 'outside_bd' && (
            <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              {language === 'bn' ? 'স্থানাঙ্ক:' : 'Coordinates:'} {lat.toFixed(4)}, {lng.toFixed(4)}
            </div>
          )}

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-muted-foreground uppercase">{language === 'bn' ? 'অথবা' : 'OR'}</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">{language === 'bn' ? 'বিভাগ' : 'Division'}</label>
              <CustomSelect 
                value={divisionId}
                onChange={(val) => { setDivisionId(val); setDistrictId(''); setUpazilaId(''); setUnionId(''); setLat(null); setLng(null); }}
                options={divisions.map(d => ({ id: d.id, label: language === 'bn' ? d.name_bn : d.name_en }))}
                placeholder={`-- ${language === 'bn' ? 'বিভাগ নির্বাচন করুন' : 'Select Division'} --`}
              />
            </div>
            
            <div className="relative">
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">{language === 'bn' ? 'জেলা' : 'District'}</label>
              <CustomSelect 
                value={districtId}
                onChange={(val) => { setDistrictId(val); setUpazilaId(''); setUnionId(''); setLat(null); setLng(null); }}
                disabled={!divisionId}
                options={districts.map(d => ({ id: d.id, label: language === 'bn' ? d.name_bn : d.name_en }))}
                placeholder={`-- ${language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'} --`}
              />
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">{language === 'bn' ? 'উপজেলা' : 'Upazila'}</label>
              <CustomSelect 
                value={upazilaId}
                onChange={(val) => { setUpazilaId(val); setUnionId(''); setLat(null); setLng(null); }}
                disabled={!districtId}
                options={upazilas.map(u => ({ id: u.id, label: language === 'bn' ? u.name_bn : u.name_en }))}
                placeholder={`-- ${language === 'bn' ? 'উপজেলা নির্বাচন করুন' : 'Select Upazila'} --`}
              />
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">{language === 'bn' ? 'ইউনিয়ন' : 'Union'}</label>
              <CustomSelect 
                value={unionId}
                onChange={(val) => { setUnionId(val); setLat(null); setLng(null); }}
                disabled={!upazilaId}
                options={unions.map(u => ({ id: u.id, label: language === 'bn' ? u.name_bn : u.name_en }))}
                placeholder={`-- ${language === 'bn' ? 'ইউনিয়ন নির্বাচন করুন' : 'Select Union'} --`}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-muted/20">
          <button onClick={handleSave} className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md">
            {language === 'bn' ? 'অবস্থান সংরক্ষণ করুন' : 'Save Search Location'}
          </button>
        </div>
      </div>
    </div>
  )
}
