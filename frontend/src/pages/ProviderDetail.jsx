import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../api/providers'
import { bookingsApi } from '../api/bookings'
import { useAuthStore } from '../store/authStore'
import { useLanguage } from '../hooks/useLanguage'
import PageLayout from '../components/layout/PageLayout'
import ReviewCard from '../components/providers/ReviewCard'
import WriteReviewDialog from '../components/providers/WriteReviewDialog'
import Spinner from '../components/ui/Spinner'
import { getAnimalIcon } from '../utils/animals'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import toast from 'react-hot-toast'
import {
  Calendar,
  Clock,
  Star,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Info,
  ArrowLeft,
  Heart,
  CalendarCheck,
  Share2,
  MessageSquare,
  Briefcase,
  ExternalLink,
} from 'lucide-react'

export const ProviderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t, tField } = useLanguage()
  const queryClient = useQueryClient()
  const { user, token } = useAuthStore()

  // Map Refs
  const mapContainerRef = useRef(null)
  const leafletMapRef = useRef(null)

  // Booking Form State
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [selectedAnimalTypeId, setSelectedAnimalTypeId] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Review Dialog State
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)

  // Query provider detail
  const { data: provider, isLoading: isLoadingProvider, error: providerError } = useQuery({
    queryKey: ['providerDetail', id],
    queryFn: () => providersApi.getProviderDetail(id),
    enabled: !!id,
  })

  // Query provider services
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['providerServices', id],
    queryFn: () => providersApi.getProviderServices(id),
    enabled: !!id,
  })

  // Query provider reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['providerReviews', id],
    queryFn: () => providersApi.getReviews(id),
    enabled: !!id,
  })



  // Booking Mutation
  const bookingMutation = useMutation({
    mutationFn: (data) => bookingsApi.createBooking(data),
    onSuccess: () => {
      setBookingSuccess(true)
      setSelectedServiceId('')
      setSelectedAnimalTypeId('')
      setBookingDate('')
      setBookingNotes('')
      queryClient.invalidateQueries(['userBookings'])
      toast.success(
        language === 'bn'
          ? 'বুকিং সফল! সেবাদাতাকে কল করে সময় নিশ্চিত করুন।'
          : 'Booking submitted! Please call the provider to confirm timing.',
        { duration: 6000, icon: '📅' }
      )
      setTimeout(() => setBookingSuccess(false), 6000)
    },
    onError: (err) => {
      setBookingError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        t('common.error')
      )
    },
  })

  // Initialize single provider Leaflet Map
  useEffect(() => {
    if (provider?.latitude && provider?.longitude && mapContainerRef.current && window.L) {
      const timer = setTimeout(() => {
        if (!leafletMapRef.current && mapContainerRef.current) {
          const coords = [parseFloat(provider.latitude), parseFloat(provider.longitude)]
          leafletMapRef.current = window.L.map(mapContainerRef.current, {
            zoomControl: true,
            scrollWheelZoom: false,
          }).setView(coords, 14)

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(leafletMapRef.current)

          window.L.marker(coords)
            .addTo(leafletMapRef.current)
            .bindPopup(
              `<b>${provider.business_name}</b><br/>${provider.upazila || ''}, ${provider.district}`
            )
            .openPopup()
        }
      }, 100)

      return () => {
        clearTimeout(timer)
        if (leafletMapRef.current) {
          leafletMapRef.current.remove()
          leafletMapRef.current = null
        }
      }
    }
  }, [provider])

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    setBookingError('')
    setBookingSuccess(false)
    
    let serviceToBook = selectedServiceId
    if (provider.provider_type === 'vet') {
      serviceToBook = services?.[0]?.id || null
    } else if (!selectedServiceId) {
      return
    }

    if (!bookingDate) return

    bookingMutation.mutate({
      provider: provider.id,
      service: serviceToBook,
      animal_type: selectedAnimalTypeId || null,
      booking_date: bookingDate,
      booking_time: null,
      notes: bookingNotes,
    })
  }

  const handleShare = async () => {
    const shareData = {
      title: provider.business_name,
      text: language === 'bn'
        ? `${provider.business_name} — PetCarePlus-এ দেখুন`
        : `Check out ${provider.business_name} on PetCarePlus`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(language === 'bn' ? 'লিঙ্ক কপি হয়েছে!' : 'Link copied!', { icon: '🔗' })
      }
    } catch (err) {
      // User cancelled share
    }
  }

  const handleBookThisService = (serviceId) => {
    setSelectedServiceId(String(serviceId))
    // Scroll to booking form
    document.getElementById('booking-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // --- Loading & Error States ---
  if (isLoadingProvider) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    )
  }

  if (providerError || !provider) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
          <h2 className="text-xl font-bold text-rose-600">{t('common.error')}</h2>
          <button
            onClick={() => navigate('/providers')}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-xs"
          >
            {t('common.back')}
          </button>
        </div>
      </PageLayout>
    )
  }

  // --- Computed Values ---
  const ratingValue = parseFloat(provider.avg_rating) || 0.0
  const providerDesc = tField(provider, 'description')
  const showBookingForm = token && (user?.role === 'pet_owner' || user?.role === 'farmer')
  const reviewsList = Array.isArray(reviews) ? reviews : reviews?.results ?? []
  const existingReviewBookingIds = reviewsList.map((r) => r.booking)

  let govVetLabel = null
  if (provider.provider_type === 'vet' && provider.is_government_vet) {
    govVetLabel = language === 'bn' ? 'সরকারি চিকিৎসক' : 'Gov Vet'
  }

  const animalTypeOptions = provider.supported_animal_types || []

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">

          {/* Back Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/providers')}
              className="inline-flex items-center gap-2 text-xs font-bold text-pcp-text-secondary dark:text-muted-foreground hover:text-pcp-green transition-colors px-3 py-1.5 bg-card border border-border/80 dark:border-white/5 rounded-xl shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সব সেবাদাতা' : 'All Providers'}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-xs font-bold text-pcp-text-secondary dark:text-muted-foreground hover:text-pcp-green transition-colors px-3 py-1.5 bg-card border border-border/80 dark:border-white/5 rounded-xl shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
            </button>
          </div>

          {/* ============ HERO BANNER ============ */}
          <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8 overflow-hidden relative group">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pcp-green-muted/20 to-transparent rounded-full filter blur-2xl -z-0 pointer-events-none" />

            {/* Provider Photo */}
            <div className="w-36 h-36 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-pcp-green-muted/30 to-pcp-green-muted dark:from-muted/40 dark:to-muted/20 border border-pcp-border/40 relative z-10 shadow-sm">
              {provider.profile_image_url ? (
                <img
                  src={provider.profile_image_url}
                  alt={provider.business_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl font-black text-pcp-text-primary/10 dark:text-white/10 uppercase tracking-tighter">
                    {provider.business_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Header Details */}
            <div className="flex-grow flex flex-col justify-between text-center md:text-left py-2 relative z-10 space-y-4 md:space-y-0">
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <span className="inline-flex items-center justify-center px-3 py-1 bg-pcp-green-bg dark:bg-pcp-green/10 text-pcp-text-secondary dark:text-pcp-green-light border border-pcp-border dark:border-pcp-green/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                    {t(`providers.types.${provider.provider_type}`)}
                  </span>

                  {govVetLabel && (
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-[#E76F51] text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm border border-[#E76F51]">
                      {govVetLabel}
                    </span>
                  )}

                  {provider.is_verified && (
                    <span className="inline-flex items-center gap-0.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      <CheckCircle className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span>{t('providers.verified')}</span>
                    </span>
                  )}
                </div>

                {/* Business Name */}
                <h1 className="text-2xl md:text-4xl font-extrabold text-pcp-text-primary dark:text-foreground leading-tight tracking-tight">
                  {provider.business_name}
                </h1>

                {/* Rating Row */}
                <div className="flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(ratingValue)
                            ? 'fill-current'
                            : 'text-muted/40 dark:text-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-extrabold text-foreground pl-0.5">
                    {ratingValue > 0 ? ratingValue.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {provider.total_reviews > 0
                      ? `(${provider.total_reviews} ${t('providers.reviews')})`
                      : `(${t('providers.no_reviews')})`}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap text-xs font-semibold text-pcp-text-secondary dark:text-muted-foreground">
                <MapPin className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0" />
                <span>
                  {provider.upazila ? `${provider.upazila}, ` : ''}
                  {provider.district}, {provider.division}
                </span>
              </div>
            </div>
          </div>

          {/* ============ MAIN GRID ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ===== LEFT COLUMN: Tabbed Content ===== */}
            <div className="lg:col-span-8 space-y-6">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="w-full justify-start bg-card border border-border/60 dark:border-white/5 rounded-2xl p-1.5 h-auto flex-wrap gap-1">
                  <TabsTrigger
                    value="about"
                    className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-pcp-green data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <Info className="w-3.5 h-3.5 mr-1.5" />
                    {language === 'bn' ? 'সম্পর্কে' : 'About'}
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-pcp-green data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                    {language === 'bn' ? 'সেবাসমূহ' : 'Services'}
                    {services && services.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">
                        {services.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-pcp-green data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    {language === 'bn' ? 'রিভিউ' : 'Reviews'}
                    {reviewsList.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">
                        {reviewsList.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* ---- ABOUT TAB ---- */}
                <TabsContent value="about" className="space-y-6 mt-6">
                  {/* Description */}
                  <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm text-left space-y-4">
                    <h3 className="text-lg font-bold text-pcp-text-primary dark:text-foreground border-b border-pcp-border/30 dark:border-border/30 pb-2">
                      {language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                    </h3>
                    <p className="text-xs md:text-sm text-pcp-text-secondary dark:text-muted-foreground/90 leading-relaxed whitespace-pre-line">
                      {providerDesc ||
                        (language === 'bn'
                          ? `স্বাগতম ${provider.business_name}-এ! আমরা আপনার পোষা প্রাণী এবং গবাদি পশুর জন্য প্রফেশনাল সেবা প্রদান করি। আমাদের সেবা এবং যোগাযোগের বিবরণ নিচে দেওয়া হলো।`
                          : `Welcome to ${provider.business_name}! We offer dedicated services for your animal companions and livestock. Please look through our services and contact details to get in touch.`)}
                    </p>
                  </div>

                  {/* Animals Serviced */}
                  {provider.supported_animal_types && provider.supported_animal_types.length > 0 && (
                    <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm text-left space-y-4">
                      <h3 className="text-lg font-bold text-pcp-text-primary dark:text-foreground border-b border-pcp-border/30 dark:border-border/30 pb-2">
                        {language === 'bn' ? 'সেবা গ্রহণকারী প্রাণী' : 'Animals Serviced'}
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {provider.supported_animal_types.map((at) => {
                          const Icon = getAnimalIcon(at.slug)
                          return (
                            <span
                              key={at.id}
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-pcp-green-bg dark:bg-pcp-green/10 text-pcp-text-secondary dark:text-pcp-green-light border border-pcp-border dark:border-pcp-green/20 hover:scale-[1.02] transition-all"
                            >
                              <Icon className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0" />
                              <span>{language === 'bn' ? at.name_bn : at.name_en}</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* ---- SERVICES TAB ---- */}
                <TabsContent value="services" className="mt-6">
                  <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm text-left space-y-4">
                    <h3 className="text-lg font-bold text-pcp-text-primary dark:text-foreground border-b border-pcp-border/30 dark:border-border/30 pb-2">
                      {t('providers.services_offered')}
                    </h3>

                    {isLoadingServices ? (
                      <Spinner className="py-8" />
                    ) : !services || services.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm font-semibold text-muted-foreground">
                          {language === 'bn'
                            ? 'এই সেবাদাতার কোনো সার্ভিস এখনো যুক্ত করা হয়নি।'
                            : 'No services offered by this provider yet.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service) => {
                          const name = tField(service, 'name')
                          const desc = tField(service, 'description')
                          return (
                            <div
                              key={service.id}
                              className="p-4 bg-pcp-surface/20 dark:bg-pcp-green/5 border border-pcp-border/60 dark:border-pcp-green/15 rounded-2xl flex flex-col justify-between gap-3 hover:border-pcp-green/30 transition-all text-left group/service"
                            >
                              <div className="space-y-1">
                                <h4 className="font-extrabold text-sm sm:text-base text-pcp-text-primary dark:text-foreground">
                                  {name}
                                </h4>
                                {desc && (
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {desc}
                                  </p>
                                )}
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-pcp-border/20 dark:border-white/5 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5 text-pcp-green dark:text-pcp-green-light shrink-0" />
                                    <span>
                                      {service.duration_minutes}{' '}
                                      {language === 'bn' ? 'মিনিট' : 'mins'}
                                    </span>
                                  </span>
                                  <span className="text-sm sm:text-base font-extrabold text-pcp-green dark:text-pcp-green-light">
                                    ৳{parseFloat(service.price).toFixed(0)}
                                  </span>
                                </div>

                                {showBookingForm && (
                                  <button
                                    onClick={() => handleBookThisService(service.id)}
                                    className="opacity-0 group-hover/service:opacity-100 transition-opacity text-[10px] font-bold text-pcp-green hover:text-white bg-pcp-green/10 hover:bg-pcp-green px-3 py-1.5 rounded-lg"
                                  >
                                    {language === 'bn' ? 'বুক করুন' : 'Book'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ---- REVIEWS TAB ---- */}
                <TabsContent value="reviews" className="mt-6">
                  <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm text-left space-y-6">
                    <div className="flex items-center justify-between border-b border-pcp-border/30 dark:border-border/30 pb-2">
                      <h3 className="text-lg font-bold text-pcp-text-primary dark:text-foreground">
                        {t('providers.reviews_title')}
                      </h3>

                      {/* Write Review Button */}
                      {token && (user?.role === 'pet_owner' || user?.role === 'farmer') && (
                        <button
                          onClick={() => setIsReviewDialogOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-pcp-green hover:text-white bg-pcp-green/10 hover:bg-pcp-green px-3.5 py-2 rounded-xl transition-all"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'রিভিউ লিখুন' : 'Write Review'}</span>
                        </button>
                      )}
                    </div>

                    {/* Rating Summary */}
                    {reviewsList.length > 0 && (
                      <div className="flex items-center gap-6 p-4 bg-pcp-surface/30 dark:bg-pcp-green/5 rounded-2xl border border-pcp-border/40 dark:border-white/5">
                        <div className="text-center">
                          <div className="text-3xl font-black text-foreground leading-none">
                            {ratingValue.toFixed(1)}
                          </div>
                          <div className="flex text-amber-400 mt-1.5 justify-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.round(ratingValue) ? 'fill-current' : 'text-muted/30'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                            {provider.total_reviews} {t('providers.reviews')}
                          </p>
                        </div>
                        <div className="flex-grow space-y-1.5">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviewsList.filter((r) => parseInt(r.rating) === star).length
                            const pct = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0
                            return (
                              <div key={star} className="flex items-center gap-2 text-xs">
                                <span className="w-3 text-right font-bold text-muted-foreground">{star}</span>
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <div className="flex-grow h-2 bg-border/50 dark:bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="w-6 text-right text-muted-foreground font-semibold">
                                  {count}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {isLoadingReviews ? (
                      <Spinner className="py-8" />
                    ) : reviewsList.length === 0 ? (
                      <div className="text-center py-8 bg-pcp-surface/20 dark:bg-pcp-green/5 border border-dashed border-pcp-border/80 dark:border-white/5 rounded-2xl">
                        <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-xs md:text-sm font-semibold text-muted-foreground">
                          {t('providers.no_reviews')}
                        </p>
                        {token && (user?.role === 'pet_owner' || user?.role === 'farmer') && (
                          <button
                            onClick={() => setIsReviewDialogOpen(true)}
                            className="mt-3 text-xs font-bold text-pcp-green hover:underline"
                          >
                            {language === 'bn' ? 'প্রথম রিভিউ দিন' : 'Be the first to review'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviewsList.map((review) => (
                          <div key={review.id} className="animate-fade-in-up">
                            <ReviewCard review={review} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* ===== RIGHT COLUMN: Contact, Booking, Map ===== */}
            <div className="lg:col-span-4 space-y-6">

              {/* Contact Information Card */}
              <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 shadow-sm text-left space-y-4">
                <h3 className="text-base font-bold text-pcp-text-primary dark:text-foreground border-b border-pcp-border/30 dark:border-border/30 pb-2">
                  {language === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Details'}
                </h3>
                <div className="space-y-3.5 text-xs font-semibold text-pcp-text-secondary dark:text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0 mt-0.5" />
                    <span>
                      {provider.upazila ? `${provider.upazila}, ` : ''}
                      {provider.district}, {provider.division}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0" />
                    <a
                      href={`tel:${provider.phone}`}
                      className="hover:text-pcp-green dark:hover:text-pcp-green-light hover:underline transition-colors"
                    >
                      {provider.phone}
                    </a>
                  </div>
                  {provider.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0" />
                      <a
                        href={`mailto:${provider.email}`}
                        className="hover:text-pcp-green dark:hover:text-pcp-green-light hover:underline transition-colors break-all"
                      >
                        {provider.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Form Card */}
              <div
                id="booking-form-card"
                className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 shadow-sm relative overflow-hidden"
              >
                <h3 className="text-base font-bold text-pcp-text-primary dark:text-foreground mb-4 border-b border-pcp-border/30 dark:border-border/30 pb-2 text-left">
                  {t('bookings.title')}
                </h3>

                {/* Important Notice Banner */}
                <div className="p-3 bg-pcp-green-bg dark:bg-pcp-green/10 border border-pcp-border dark:border-pcp-green/20 rounded-xl text-[11px] font-semibold text-pcp-text-secondary dark:text-pcp-green-light flex gap-2 items-start mb-4 text-left leading-relaxed">
                  <Info className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0 mt-0.5" />
                  <div>
                    {language === 'bn' ? (
                      <span>
                        <strong>গুরুত্বপূর্ণ তথ্য:</strong> অ্যাপয়েন্টমেন্ট শুধুমাত্র তারিখের ভিত্তিতে
                        বুক করা হয়। বুকিং করার পর সেবাদাতাকে সরাসরি কল করে সময় নিশ্চিত করুন।
                        সেবাদাতা তাঁর প্রান্ত থেকে বুকিং কনফার্ম করবেন।
                      </span>
                    ) : (
                      <span>
                        <strong>Date-Only Booking:</strong> Appointments are booked by date. After
                        booking, please call the provider to coordinate timing. The provider will
                        confirm the booking from their end.
                      </span>
                    )}
                  </div>
                </div>

                {showBookingForm ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-4 text-left">
                    {/* Select Service (Hidden for Vets) */}
                    {provider.provider_type !== 'vet' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">
                          {t('bookings.select_service')}
                        </label>
                        <select
                          value={selectedServiceId}
                          onChange={(e) => setSelectedServiceId(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-semibold dark:bg-background transition-colors"
                        >
                          <option value="">
                            -- {t('bookings.select_service')} --
                          </option>
                          {services?.map((service) => (
                            <option key={service.id} value={service.id}>
                              {tField(service, 'name')} (৳{parseFloat(service.price).toFixed(0)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Select Animal Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground flex justify-between">
                        <span>{language === 'bn' ? 'প্রাণীর ধরন নির্বাচন করুন' : 'Select Animal Type'}</span>
                        <span className="text-[10px] font-normal italic opacity-70">
                          {language === 'bn' ? '(আবশ্যক)' : '(Required)'}
                        </span>
                      </label>
                      <select
                        value={selectedAnimalTypeId}
                        onChange={(e) => setSelectedAnimalTypeId(e.target.value)}
                        required
                        disabled={animalTypeOptions.length === 0}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-semibold dark:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {animalTypeOptions.length === 0 ? (
                          <option value="">
                            -- {language === 'bn' ? 'কোনো প্রাণীর ধরন পাওয়া যায়নি' : 'No animal types available'} --
                          </option>
                        ) : (
                          <>
                            <option value="">
                              -- {language === 'bn' ? 'প্রাণীর ধরন নির্বাচন করুন' : 'Select Animal Type'} --
                            </option>
                            {animalTypeOptions.map((at) => (
                              <option key={at.id} value={at.id}>
                                {language === 'bn' ? at.name_bn || at.name_en : at.name_en}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>

                    {/* Select Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">
                        {t('bookings.select_date')}
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-semibold dark:bg-background transition-colors"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">
                        {t('bookings.notes')}
                      </label>
                      <textarea
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        rows={3}
                        placeholder={t('bookings.notes_placeholder')}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-semibold dark:bg-background transition-colors resize-none"
                      />
                    </div>

                    {/* Success message */}
                    {bookingSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 animate-fade-in">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {language === 'bn'
                            ? 'বুকিং সফল! সেবাদাতাকে কল করে সময় নিশ্চিত করুন।'
                            : 'Booking submitted! Call the provider to confirm timing.'}
                        </span>
                      </div>
                    )}

                    {/* Error message */}
                    {bookingError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50 animate-fade-in">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{bookingError}</span>
                      </div>
                    )}

                    {/* Submit Button & Direct Call Grid */}
                    <div className="flex gap-2 pt-2">
                      <a
                        href={`tel:${provider.phone}`}
                        className="flex items-center justify-center p-3 bg-pcp-green-bg hover:bg-pcp-green-muted text-pcp-green rounded-xl transition-all border border-pcp-border/50 shrink-0 shadow-sm"
                        title={language === 'bn' ? 'সরাসরি কল করুন' : 'Call Directly'}
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                      <button
                        type="submit"
                        disabled={bookingMutation.isPending || !!bookingSuccess}
                        className="flex-grow py-3 bg-pcp-green hover:bg-pcp-green-hover text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] disabled:opacity-55"
                      >
                        {bookingMutation.isPending ? (
                          <Spinner size="sm" />
                        ) : (
                          <CalendarCheck className="w-4 h-4" />
                        )}
                        <span>{t('bookings.btn_submit')}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6 px-4 bg-pcp-surface/40 dark:bg-pcp-green/5 rounded-xl border border-dashed border-pcp-border/80 dark:border-white/5 space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {token
                        ? language === 'bn'
                          ? 'পশু চিকিৎসক বা সেবা প্রদানকারীরা নিজের পেজে বুক করতে পারবেন না।'
                          : 'Service providers cannot book appointments on their own profile.'
                        : language === 'bn'
                          ? 'সেবা বুক করতে অনুগ্রহ করে পেটকেয়ার অ্যাকাউন্ট লগইন বা নিবন্ধন করুন।'
                          : 'Please login or register to book an appointment with this provider.'}
                    </p>
                    {!token && (
                      <div className="flex gap-2 justify-center">
                        <Link
                          to="/login"
                          className="px-4 py-2 bg-pcp-green text-white text-xs font-bold rounded-xl hover:bg-pcp-green-hover transition-colors shadow-sm"
                        >
                          {t('nav.login')}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Embedded Provider Leaflet Map */}
              {provider.latitude && provider.longitude && (
                <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-4 shadow-sm space-y-3.5">
                  <div className="flex justify-between items-center border-b border-pcp-border/30 dark:border-border/30 pb-2">
                    <h3 className="text-base font-bold text-pcp-text-primary dark:text-foreground text-left">
                      {language === 'bn' ? 'মানচিত্রে অবস্থান' : 'Map Location'}
                    </h3>
                  </div>
                  <div
                    ref={mapContainerRef}
                    className="w-full h-[220px] rounded-2xl overflow-hidden border border-border/80 shadow-inner relative z-0"
                    style={{ zIndex: 1 }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <WriteReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        providerId={provider.id}
        providerName={provider.business_name}
        existingReviewBookingIds={existingReviewBookingIds}
      />
    </PageLayout>
  )
}

export default ProviderDetail
