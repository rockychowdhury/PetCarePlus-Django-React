import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi } from '../api/resources'
import { savedApi } from '../api/saved'
import { useLanguage } from '../hooks/useLanguage'
import PageLayout from '../components/layout/PageLayout'
import Spinner from '../components/ui/Spinner'
import { getAnimalIcon, ANIMAL_THEMES } from '../utils/animals'
import { ArrowLeft, Calendar, Bookmark, Building2, ShieldPlus, HeartPulse, Pill, Siren, Info, Home, Utensils, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import GuidelineCard from '../components/guidelines/GuidelineCard'

export const GuidelineDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()

  // Query details for this specific resource
  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['guidelineDetail', id],
    queryFn: () => resourcesApi.getResourceDetail(id),
    enabled: !!id,
  })

  // Query related resources
  const { data: relatedData } = useQuery({
    queryKey: ['guidelines', { resource_type: resource?.resource_type, ordering: '-created_at' }],
    queryFn: () => resourcesApi.getResources({ resource_type: resource?.resource_type, ordering: '-created_at' }),
    enabled: !!resource?.resource_type,
  })

  // Mutation to toggle saved status
  const toggleSaveMutation = useMutation({
    mutationFn: () => savedApi.toggleSavedItem('resource', id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['guidelines'])
      queryClient.invalidateQueries(['guidelineDetail', id])
      queryClient.invalidateQueries(['savedItems'])
      
      const isAdded = data?.status === 'added'
      toast.success(
        isAdded 
          ? (language === 'bn' ? 'সংরক্ষিত হয়েছে!' : 'Saved successfully!')
          : (language === 'bn' ? 'সংরক্ষণ বাতিল হয়েছে।' : 'Removed from saved items.')
      )
    },
    onError: () => {
      toast.error(language === 'bn' ? 'অনুগ্রহ করে লগইন করুন।' : 'Please log in to save items.')
    }
  })

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    )
  }

  if (error || !resource) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
          <h2 className="text-xl font-bold text-rose-600">{t('common.error')}</h2>
          <button
            onClick={() => navigate('/guidelines')}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-xs"
          >
            {t('common.back')}
          </button>
        </div>
      </PageLayout>
    )
  }

  const {
    title,
    description,
    animal_types = [],
    resource_type,
    created_at,
    is_saved
  } = resource



  // Get resource type icon & style
  const getResourceTypeDetails = () => {
    switch (resource_type) {
      case 'govt': return { icon: <Building2 className="w-4 h-4 text-emerald-500" />, label: language === 'bn' ? 'সরকারি অফিস' : 'Government Office', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
      case 'emergency': return { icon: <Siren className="w-4 h-4 text-rose-500 animate-pulse" />, label: language === 'bn' ? 'জরুরি যোগাযোগ' : 'Emergency Contact', color: 'bg-rose-50 text-rose-700 border-rose-100' }
      case 'vaccination': return { icon: <ShieldPlus className="w-4 h-4 text-indigo-500" />, label: language === 'bn' ? 'টিকাদান' : 'Vaccination', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' }
      case 'medicine': return { icon: <Pill className="w-4 h-4 text-purple-500" />, label: language === 'bn' ? 'ওষুধ' : 'Medicine', color: 'bg-purple-50 text-purple-700 border-purple-100' }
      case 'diseases': return { icon: <HeartPulse className="w-4 h-4 text-red-500" />, label: language === 'bn' ? 'রোগ' : 'Diseases', color: 'bg-red-50 text-red-700 border-red-100' }
      case 'shelter': return { icon: <Home className="w-4 h-4 text-amber-500" />, label: language === 'bn' ? 'আশ্রয়' : 'Shelter', color: 'bg-amber-50 text-amber-700 border-amber-100' }
      case 'food': return { icon: <Utensils className="w-4 h-4 text-orange-500" />, label: language === 'bn' ? 'খাবার' : 'Food', color: 'bg-orange-50 text-orange-700 border-orange-100' }
      case 'information': return { icon: <Info className="w-4 h-4 text-sky-500" />, label: language === 'bn' ? 'তথ্য' : 'Information', color: 'bg-sky-50 text-sky-700 border-sky-100' }
      default: return { icon: <Info className="w-4 h-4 text-slate-500" />, label: language === 'bn' ? 'অন্যান্য' : 'Other', color: 'bg-slate-50 text-slate-700 border-slate-100' }
    }
  }

  const typeDetails = getResourceTypeDetails()

  // Filter out the current resource from related list and take top 4
  const relatedResources = (relatedData?.results || []).filter(r => r.id !== resource.id).slice(0, 4)

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-10 min-h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
          
          {/* Back button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/guidelines')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.back')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-6">
              <article className="bg-card border border-border/80 rounded-3xl p-6 md:p-10 shadow-sm space-y-8">
                
                {/* Header Action Row */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-3">
                    {/* Animal Types */}
                    {animal_types.map((animal) => {
                      const animalTheme = ANIMAL_THEMES[animal.slug] || ANIMAL_THEMES.cat
                      const AnimalIcon = getAnimalIcon(animal.slug)
                      return (
                        <div key={animal.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${animalTheme.bg} ${animalTheme.border} ${animalTheme.text}`}>
                          <AnimalIcon className="w-4 h-4" />
                          <span>{language === 'bn' ? animal.name_bn : animal.name_en}</span>
                        </div>
                      )
                    })}
                    
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${typeDetails.color}`}>
                      {typeDetails.icon}
                      <span>{typeDetails.label}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted text-muted-foreground text-xs font-bold">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSaveMutation.mutate()}
                    disabled={toggleSaveMutation.isPending}
                    className={`p-2.5 rounded-full transition-colors border shadow-sm ${
                      is_saved
                        ? 'bg-primary/20 hover:bg-primary/30 border-primary/50 text-primary'
                        : 'bg-muted/50 hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                    title={language === 'bn' ? 'সংরক্ষণ করুন' : 'Save for later'}
                  >
                    {toggleSaveMutation.isPending ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <Bookmark className={`w-5 h-5 ${is_saved ? 'fill-current' : ''}`} />
                    )}
                  </button>
                </div>

                {/* Title */}
                <div className="border-b border-border/60 pb-6">
                  <h1 className="text-2xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
                    {title}
                  </h1>
                </div>

                {/* Content Body */}
                <div className="prose prose-sm md:prose-base max-w-none text-foreground/90 space-y-6 leading-relaxed whitespace-pre-wrap">
                  {description}
                </div>
              </article>
            </div>

            {/* Right Sidebar: Related Resources */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-extrabold text-foreground mb-6 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-primary" />
                  {language === 'bn' ? 'সংশ্লিষ্ট রিসোর্স' : 'Related Resources'}
                </h3>
                
                {relatedResources.length > 0 ? (
                  <div className="space-y-4">
                    {relatedResources.map((res) => (
                      <div key={res.id} className="border-b border-border/40 last:border-0 pb-4 last:pb-0">
                        <Link to={`/guidelines/${res.id}`} className="block group">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                            {new Date(res.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                          </span>
                          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {res.title}
                          </h4>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'কোনো সংশ্লিষ্ট রিসোর্স পাওয়া যায়নি।' : 'No related resources found.'}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default GuidelineDetail
