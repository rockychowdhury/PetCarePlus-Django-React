import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, X, Check, Search } from 'lucide-react'
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
    division_id: storeDiv, district_id: storeDist, upazila_id: storeUpz, union_id: storeUnion,
    latitude: storeLat, longitude: storeLng, setLocation
  } = useLocationStore()

  const [divisionId, setDivisionId] = useState(storeDiv === 'all' ? '' : storeDiv || '')
  const [districtId, setDistrictId] = useState(storeDist || '')
  const [upazilaId, setUpazilaId] = useState(storeUpz || '')
  const [unionId, setUnionId] = useState(storeUnion || '')
  const [lat, setLat] = useState(storeLat || null)
  const [lng, setLng] = useState(storeLng || null)
  const [gpsStatus, setGpsStatus] = useState('')
  const [autoFillTarget, setAutoFillTarget] = useState(null)

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

  useEffect(() => {
    if (storeDiv && divisions.length && !divisionId) {
      const d = divisions.find(x => x.name_en === storeDiv)
      if (d) setDivisionId(d.id)
    }
  }, [storeDiv, divisions])

  useEffect(() => {
    if (storeDist && districts.length && divisionId && !districtId) {
      const d = districts.find(x => x.name_en === storeDist)
      if (d) setDistrictId(d.id)
    }
  }, [storeDist, districts, divisionId])

  useEffect(() => {
    if (storeUpz && upazilas.length && districtId && !upazilaId) {
      const u = upazilas.find(x => x.name_en === storeUpz)
      if (u) setUpazilaId(u.id)
    }
  }, [storeUpz, upazilas, districtId])

  useEffect(() => {
    if (storeUnion && unions.length && upazilaId && !unionId) {
      const u = unions.find(x => x.name_en === storeUnion)
      if (u) setUnionId(u.id)
    }
  }, [storeUnion, unions, upazilaId])

  const handleGps = () => {
    setGpsStatus(language === 'bn' ? 'অপেক্ষা করুন...' : 'Detecting...')
    if (!navigator.geolocation) {
      setGpsStatus('Not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude
        const longitude = pos.coords.longitude
        
        if (latitude < 20.0 || latitude > 27.0 || longitude < 88.0 || longitude > 93.0) {
          setGpsStatus('outside_bd')
          return
        }

        setGpsStatus(language === 'bn' ? 'প্রসেসিং...' : 'Processing...')

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          )
          const data = await res.json()
          let resolvedUpazilaId = ''
          let resolvedDivisionName = 'all'
          let resolvedDistrictName = ''
          let resolvedUpazilaName = ''
          let resolvedDivisionId = ''
          let resolvedDistrictId = ''
          
          if (data && data.address) {
            const addr = data.address
            const divName = addr.state?.replace(' Division', '') || ''
            const distName = (addr.state_district || addr.county || addr.city)?.replace(' District', '') || ''
            const upzName = addr.city || addr.town || addr.county || ''
            const rawAddress = `${data.display_name} ${Object.values(addr).join(' ')}`.toLowerCase()
            
            // Background resolution for Upazila ID
            const divs = await locationsApi.getDivisions()
            const divMatch = divs.find(d => rawAddress.includes(d.name_en.toLowerCase()) || divName.toLowerCase().includes(d.name_en.toLowerCase()))
            
            if (divMatch) {
                resolvedDivisionName = divMatch.name_en
                resolvedDivisionId = divMatch.id
                
                const dists = await locationsApi.getDistricts(divMatch.id)
                const distMatch = dists.find(d => rawAddress.includes(d.name_en.toLowerCase()) || distName.toLowerCase().includes(d.name_en.toLowerCase()))
                
                if (distMatch) {
                    resolvedDistrictName = distMatch.name_en
                    resolvedDistrictId = distMatch.id
                    
                    const upzs = await locationsApi.getUpazilas(distMatch.id)
                    let upzMatch = upzs.find(u => {
                        const cleanName = u.name_en.toLowerCase().replace(' sadar', '').replace(' city corporation', '').trim()
                        return rawAddress.includes(cleanName) || upzName.toLowerCase().includes(cleanName)
                    })
                    
                    if (!upzMatch && distMatch.name_en.toLowerCase() === 'dhaka') {
                        upzMatch = upzs.find(u => u.name_en.toLowerCase().includes('dhaka north'))
                    }
                    
                    if (upzMatch) {
                        resolvedUpazilaId = upzMatch.id
                        resolvedUpazilaName = upzMatch.name_en
                    }
                }
            }
          }
          
          setLocation({
            division: resolvedDivisionName,
            district: resolvedDistrictName,
            upazila: resolvedUpazilaName,
            union: '',
            division_id: resolvedDivisionId,
            district_id: resolvedDistrictId,
            upazila_id: resolvedUpazilaId,
            latitude: latitude,
            longitude: longitude,
          })
          setGpsStatus('')
          onClose()
        } catch (e) {
          setGpsStatus('Failed')
        }
      },
      () => setGpsStatus('Failed')
    )
  }

  const handleUseProfileLocation = () => {
    if (!user) return
    
    // Look up IDs from the names in the user profile
    const uDivId = divisions.find(d => d.name_en === user.division)?.id || ''
    // Since districts and upazilas might not be loaded yet if division wasn't selected,
    // we can just pass the names and the API will handle it, OR we pass what we have.
    // Actually, we pass the names to the locationStore, and the API fallback will
    // still use user profile if IDs are missing, OR we can just let it be.
    // Wait, useLocalProviders maps `division_id`, `district_id`, `upazila_id`.
    // If they are missing, it won't send them, and backend will fallback to user profile!
    
    setLocation({
      division: user.division || '',
      district: user.district || '',
      upazila: user.upazila || '',
      union: user.union || '',
      division_id: uDivId || '',
      district_id: '', // Will fallback to user profile in backend if missing
      upazila_id: '',  // Will fallback to user profile in backend if missing
      latitude: user.latitude || null,
      longitude: user.longitude || null,
    })
    onClose()
  }


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
      division_id: divisionId,
      district_id: districtId,
      upazila_id: upazilaId,
      latitude: lat,
      longitude: lng,
    })
    onClose()
  }

  const handleReset = () => {
    setDivisionId('')
    setDistrictId('')
    setUpazilaId('')
    setUnionId('')
    setLat(null)
    setLng(null)
    setGpsStatus('')
    setLocation({
      division: 'all',
      district: '',
      upazila: '',
      union: '',
      division_id: 'all',
      district_id: '',
      upazila_id: '',
      latitude: null,
      longitude: null,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/40 overflow-y-auto"
      style={{ paddingTop: '5vh', paddingBottom: '5vh' }}
    >
      <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl border border-border/60 flex flex-col my-auto">
        <div className="flex items-center justify-between p-3 border-b border-border/60 shrink-0">
          <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            Set Search Location
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-3">
          {/* User Profile Location */}
          {user && (user.district || user.latitude) && (
            <div className="flex items-center justify-between bg-pcp-green/5 dark:bg-pcp-green/10 border border-pcp-green/20 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="bg-pcp-green/20 p-1 rounded-full">
                  <MapPin className="w-3 h-3 text-pcp-green" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-pcp-text-primary dark:text-zinc-200">Profile Location</p>
                  <p className="text-[10px] font-medium text-muted-foreground line-clamp-1">
                    {[user.union, user.upazila, user.district].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUseProfileLocation}
                className="text-[11px] font-bold text-pcp-green hover:bg-pcp-green/10 px-3 py-1 rounded-full transition-colors whitespace-nowrap border border-pcp-green/30"
              >
                Use
              </button>
            </div>
          )}

          {/* Capture Location & Reset */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleGps}
              className="flex-grow flex items-center justify-center gap-1.5 py-2 bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-pcp-text-primary dark:text-zinc-200 font-bold rounded-full transition-colors text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              {gpsStatus && gpsStatus !== 'outside_bd' ? gpsStatus : (language === 'bn' ? 'বর্তমান লোকেশন ব্যবহার করুন' : 'Use current location')}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-rose-600 dark:text-rose-400 font-bold rounded-full transition-colors text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm"
              title="Reset to Nationwide"
            >
              Reset
            </button>
          </div>

          {gpsStatus === 'outside_bd' && (
            <div className="text-xs text-center text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              Your location appears to be outside Bangladesh. Please select manually.
            </div>
          )}

          {lat && lng && gpsStatus !== 'outside_bd' && (
            <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5 bg-muted/30 py-2 rounded-lg">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium">Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>
          )}

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-border" />
            <span className="flex-shrink-0 mx-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Division</label>
              <CustomSelect
                value={divisionId}
                onChange={(val) => { setDivisionId(val); setDistrictId(''); setUpazilaId(''); setUnionId(''); setLat(null); setLng(null); }}
                options={divisions.map(d => ({ id: d.id, label: d.name_en }))}
                placeholder="-- Select Division --"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground mb-1 block">District</label>
              <CustomSelect
                value={districtId}
                onChange={(val) => { setDistrictId(val); setUpazilaId(''); setUnionId(''); setLat(null); setLng(null); }}
                disabled={!divisionId}
                options={districts.map(d => ({ id: d.id, label: d.name_en }))}
                placeholder="-- Select District --"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Upazila</label>
              <CustomSelect
                value={upazilaId}
                onChange={(val) => { setUpazilaId(val); setUnionId(''); setLat(null); setLng(null); }}
                disabled={!districtId}
                options={upazilas.map(u => ({ id: u.id, label: u.name_en }))}
                placeholder="-- Select Upazila --"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Union</label>
              <CustomSelect
                value={unionId}
                onChange={(val) => { setUnionId(val); setLat(null); setLng(null); }}
                disabled={!upazilaId}
                options={unions.map(u => ({ id: u.id, label: u.name_en }))}
                placeholder="-- Select Union --"
              />
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-border/60 shrink-0">
          <button
            onClick={handleSave}
            className="w-full py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            {language === 'bn' ? 'সেবাদাতা খুঁজুন' : 'Search Providers'}
          </button>
        </div>
      </div>
    </div>
  )
}