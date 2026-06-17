import React, { useState, useEffect } from 'react'
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

        if (latitude < 20.0 || latitude > 27.0 || longitude < 88.0 || longitude > 93.0) {
          setGpsStatus('outside_bd')
          return
        }

        setGpsStatus('Reversing address...')

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          )
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

  useEffect(() => {
    if (!autoFillTarget) return

    if (divisions.length > 0 && !divisionId) {
      const match = divisions.find(d =>
        autoFillTarget.rawAddressText.includes(d.name_en.toLowerCase()) ||
        (autoFillTarget.division && autoFillTarget.division.toLowerCase().includes(d.name_en.toLowerCase()))
      )
      if (match) setDivisionId(match.id)
      else setAutoFillTarget(null)
    }

    if (divisionId && districts.length > 0 && !districtId) {
      const match = districts.find(d =>
        autoFillTarget.rawAddressText.includes(d.name_en.toLowerCase()) ||
        (autoFillTarget.district && autoFillTarget.district.toLowerCase().includes(d.name_en.toLowerCase()))
      )
      setDistrictId(match?.id || districts[0]?.id || '')
    }

    if (districtId && upazilas.length > 0 && !upazilaId) {
      let match = upazilas.find(u => {
        const cleanName = u.name_en.toLowerCase()
          .replace(' sadar', '')
          .replace(' city corporation', '')
          .trim()
        return autoFillTarget.rawAddressText.includes(cleanName)
      })
      if (!match) {
        const activeDist = districts.find(d => String(d.id) === String(districtId))
        if (activeDist && activeDist.name_en.toLowerCase() === 'dhaka') {
          match = upazilas.find(u => u.name_en.toLowerCase().includes('dhaka north'))
        }
      }
      setUpazilaId(match?.id || upazilas[0]?.id || '')
    }

    if (upazilaId && unions.length > 0 && !unionId) {
      const match = unions.find(u =>
        autoFillTarget.rawAddressText.includes(u.name_en.toLowerCase())
      )
      setUnionId(match?.id || unions[0]?.id || '')
      setAutoFillTarget(null)
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
      division: '',
      district: '',
      upazila: '',
      union: '',
      latitude: null,
      longitude: null,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      style={{ paddingTop: '5vh', paddingBottom: '5vh' }}
    >
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/60 flex flex-col my-auto">
        <div className="flex items-center justify-between p-4 border-b border-border/60 shrink-0">
          <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Set Search Location
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
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
              {gpsStatus && gpsStatus !== 'outside_bd' ? gpsStatus : 'Use GPS Location'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold rounded-xl transition-colors text-xs sm:text-sm border border-border"
              title="Reset to Bangladesh"
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
            <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
            </div>
          )}

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-border" />
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-muted-foreground uppercase">OR</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Division</label>
              <CustomSelect
                value={divisionId}
                onChange={(val) => { setDivisionId(val); setDistrictId(''); setUpazilaId(''); setUnionId(''); setLat(null); setLng(null); }}
                options={divisions.map(d => ({ id: d.id, label: d.name_en }))}
                placeholder="-- Select Division --"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">District</label>
              <CustomSelect
                value={districtId}
                onChange={(val) => { setDistrictId(val); setUpazilaId(''); setUnionId(''); setLat(null); setLng(null); }}
                disabled={!divisionId}
                options={districts.map(d => ({ id: d.id, label: d.name_en }))}
                placeholder="-- Select District --"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Upazila</label>
              <CustomSelect
                value={upazilaId}
                onChange={(val) => { setUpazilaId(val); setUnionId(''); setLat(null); setLng(null); }}
                disabled={!districtId}
                options={upazilas.map(u => ({ id: u.id, label: u.name_en }))}
                placeholder="-- Select Upazila --"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Union</label>
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

        <div className="p-4 border-t border-border/60 shrink-0">
          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            Save Search Location
          </button>
        </div>
      </div>
    </div>
  )
}