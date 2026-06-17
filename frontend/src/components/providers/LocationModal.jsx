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
    setGpsStatus('Detecting...')
    if (!navigator.geolocation) {
      setGpsStatus('Not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude
        const longitude = pos.coords.longitude
        setLat(latitude)
        setLng(longitude)
        setGpsStatus('Reversing address...')

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
          const data = await res.json()
          if (data && data.address) {
            const addr = data.address
            const divName = addr.state?.replace(' Division', '') || ''
            const distName = (addr.state_district || addr.county)?.replace(' District', '') || ''
            const upzName = addr.city || addr.town || addr.county || ''
            const unionName = addr.suburb || addr.village || addr.neighbourhood || ''

            setAutoFillTarget({ division: divName, district: distName, upazila: upzName, union: unionName })
            setGpsStatus('Location auto-filled!')
          } else {
            setGpsStatus('Address not found')
          }
        } catch (e) {
          setGpsStatus('Reverse geocode failed')
        }
      },
      () => setGpsStatus('Failed')
    )
  }

  // State machine for cascading auto-fill
  useEffect(() => {
    if (!autoFillTarget) return

    if (autoFillTarget.division && divisions.length > 0 && !divisionId) {
      const match = divisions.find(d => autoFillTarget.division.toLowerCase().includes(d.name_en.toLowerCase()))
      if (match) setDivisionId(match.id)
    }

    if (autoFillTarget.district && districts.length > 0 && divisionId && !districtId) {
      const match = districts.find(d => autoFillTarget.district.toLowerCase().includes(d.name_en.toLowerCase()))
      if (match) setDistrictId(match.id)
    }

    if (autoFillTarget.upazila && upazilas.length > 0 && districtId && !upazilaId) {
      const match = upazilas.find(u => autoFillTarget.upazila.toLowerCase().includes(u.name_en.toLowerCase()))
      if (match) setUpazilaId(match.id)
    }

    if (autoFillTarget.union && unions.length > 0 && upazilaId && !unionId) {
      const match = unions.find(u => autoFillTarget.union.toLowerCase().includes(u.name_en.toLowerCase()))
      if (match) {
        setUnionId(match.id)
        setAutoFillTarget(null) // Done auto-filling!
      }
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
    
    // In background, if logged in, you could dispatch an auth update action here.
    
    onClose()
  }

  if (!isOpen) return null

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
          <button 
            onClick={handleGps}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors border border-primary/20"
          >
            <Navigation className="w-4 h-4" />
            {gpsStatus || (language === 'bn' ? "বর্তমান জিপিএস অবস্থান ব্যবহার করুন" : "Use Current GPS Location")}
          </button>
          
          {(lat && lng) && (
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
