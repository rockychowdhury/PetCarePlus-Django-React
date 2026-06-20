import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api/providers'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../../components/ui/Spinner'
import { Activity, Plus, Trash2, Edit, CheckCircle, AlertCircle } from 'lucide-react'

const DashboardProviderServices = () => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [nameEn, setNameEn] = useState('')
  const [nameBn, setNameBn] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [descEn, setDescEn] = useState('')
  const [descBn, setDescBn] = useState('')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState(false)

  // 1. Fetch provider profile to get the provider ID
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['myProviderProfile'],
    queryFn: () => providersApi.getMyProviderProfile(),
    retry: false,
  })

  // 2. Fetch services for this provider
  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: ['providerServices', profile?.id],
    queryFn: () => providersApi.getProviderServices(profile.id),
    enabled: !!profile?.id,
  })
  const services = Array.isArray(servicesData) ? servicesData : (servicesData?.results || [])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => providersApi.addProviderService(profile.id, data),
    onSuccess: () => handleSuccess(),
    onError: (err) => handleError(err),
  })

  const updateMutation = useMutation({
    mutationFn: (data) => providersApi.updateProviderService(profile.id, editingId, data),
    onSuccess: () => handleSuccess(),
    onError: (err) => handleError(err),
  })

  const deleteMutation = useMutation({
    mutationFn: (serviceId) => providersApi.deleteProviderService(profile.id, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries(['providerServices', profile?.id])
    },
    onError: (err) => {
      alert(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    }
  })

  const handleSuccess = () => {
    setSuccessMsg(true)
    queryClient.invalidateQueries(['providerServices', profile?.id])
    setTimeout(() => {
      setSuccessMsg(false)
      closeForm()
    }, 2000)
  }

  const handleError = (err) => {
    setErrorMsg(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
  }

  const openForm = (service = null) => {
    setErrorMsg('')
    setSuccessMsg(false)
    if (service) {
      setEditingId(service.id)
      setNameEn(service.name_en || '')
      setNameBn(service.name_bn || '')
      setPrice(service.price || '')
      setDuration(service.duration_minutes || '')
      setDescEn(service.description_en || '')
      setDescBn(service.description_bn || '')
    } else {
      setEditingId(null)
      setNameEn('')
      setNameBn('')
      setPrice('')
      setDuration('')
      setDescEn('')
      setDescBn('')
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg(false)

    const payload = {
      name_en: nameEn,
      name_bn: nameBn || nameEn,
      price: price ? parseFloat(price) : null,
      duration_minutes: duration ? parseInt(duration) : null,
      description_en: descEn,
      description_bn: descBn || descEn,
      is_active: true,
    }

    if (editingId) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি এই সার্ভিসটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isProfileLoading) return <Spinner className="py-24" />

  if (!profile || !profile.id) {
    return (
      <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed border-border/80">
        <Activity className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
        <p className="text-sm font-bold text-muted-foreground">
          {language === 'bn' ? 'সার্ভিস যোগ করার আগে আপনার ব্যবসার প্রোফাইল সম্পূর্ণ করুন।' : 'Please complete your Business Profile before adding services.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            {language === 'bn' ? 'আমার সেবাসমূহ' : 'My Services'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            আপনার প্রদানকৃত সেবা, মূল্য এবং সময়সীমা পরিচালনা করুন।
          </p>
        </div>

        <button
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'সার্ভিস যোগ করুন' : 'Add Service'}</span>
        </button>
      </div>

      <div className="bg-card border border-border/80 p-5 md:p-8 rounded-2xl shadow-sm text-left">
        {isServicesLoading ? (
          <Spinner className="py-12" />
        ) : !services || services.length === 0 ? (
          <div className="text-center py-16 px-4 bg-pcp-surface/20 border border-dashed border-border rounded-xl">
            <Activity className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4" />
            <p className="text-sm font-bold text-muted-foreground leading-relaxed">
              {language === 'bn' ? 'কোনো সার্ভিস যোগ করা হয়নি।' : 'No services added yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => {
              const serviceName = language === 'bn' ? (service.name_bn || service.name_en) : service.name_en
              const desc = language === 'bn' ? (service.description_bn || service.description_en) : service.description_en
              
              return (
                <div
                  key={service.id}
                  className="p-5 border border-border/80 bg-pcp-surface/20 rounded-xl flex flex-col justify-between gap-4 group hover:border-primary/50 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-base text-foreground leading-snug">
                        {serviceName}
                      </h4>
                      <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                        ৳{service.price}
                      </span>
                    </div>
                    {service.duration_minutes && (
                      <p className="text-xs text-muted-foreground font-semibold">
                        {service.duration_minutes} {language === 'bn' ? 'মিনিট' : 'minutes'}
                      </p>
                    )}
                    <p className="text-sm text-foreground/80 mt-2 line-clamp-3">
                      {desc}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
                    <button
                      onClick={() => openForm(service)}
                      className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-muted-foreground hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Service Form Overlay Modal */}
      {isFormOpen && createPortal(
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 md:p-8 space-y-5 animate-fade-in-up text-left shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-foreground border-b border-border/50 pb-3">
              {editingId ? (language === 'bn' ? 'সার্ভিস সম্পাদনা করুন' : 'Edit Service') : (language === 'bn' ? 'নতুন সার্ভিস যোগ করুন' : 'Add New Service')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name EN */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground">
                    {language === 'bn' ? 'নাম (ইংরেজিতে)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    required
                    placeholder="e.g. Full Grooming"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                {/* Name BN */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground">
                    {language === 'bn' ? 'নাম (বাংলায়)' : 'Name (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="যেমন: ফুল গ্রুমিং"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground">
                    {language === 'bn' ? 'মূল্য (টাকা)' : 'Price (BDT)'}
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground">
                    {language === 'bn' ? 'সময় (মিনিট)' : 'Duration (Minutes)'}
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    placeholder="e.g. 30"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
              </div>

              {/* Desc EN */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground">
                  {language === 'bn' ? 'বিবরণ (ইংরেজিতে)' : 'Description (English)'}
                </label>
                <textarea
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                />
              </div>

              {/* Desc BN */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground">
                  {language === 'bn' ? 'বিবরণ (বাংলায়)' : 'Description (Bangla)'}
                </label>
                <textarea
                  value={descBn}
                  onChange={(e) => setDescBn(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                />
              </div>

              {/* Alerts */}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex gap-2 items-center">
                  <CheckCircle className="w-5 h-5" />
                  <span>সফলভাবে সেভ করা হয়েছে!</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex gap-2 items-center">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-border bg-card text-foreground text-sm font-semibold rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending || !!successMsg}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-55"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Spinner size="sm" />}
                  <span>{t('common.submit')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default DashboardProviderServices
