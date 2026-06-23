import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { animalsApi } from '../../api/animals'
import { rehomingApi } from '../../api/rehoming'
import { uploadToImgBB } from '../../utils/imageUpload'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../ui/Spinner'
import { X, ShieldAlert, UploadCloud, CheckCircle2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { CustomSelect } from '../common/CustomSelect'
import toast from 'react-hot-toast'

const CreateRehomingModal = ({ onClose, onSuccess }) => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()

  const [step, setStep] = useState(1) // 1: Policy, 2: Basic Info, 3: Health & Media

  const [formData, setFormData] = useState({
    policy_accepted: false,
    animal_type: '',
    pet_name: '',
    breed: '',
    gender: 'unknown',
    age: '',
    weight_kg: '',
    spayed_neutered: false,
    vaccinated: false,
    reason: '',
    description: '',
    adopter_requirements: '',
  })
  
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch animal types (cats/dogs only)
  const { data: animalTypesData } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: animalsApi.getAnimalTypes,
  })
  
  const typesArray = Array.isArray(animalTypesData) ? animalTypesData : (animalTypesData?.results || [])
  const rehomingTypes = typesArray.filter(type => type.supports_rehoming)

  const createMutation = useMutation({
    mutationFn: (data) => rehomingApi.createListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myRehomingListings'])
      queryClient.invalidateQueries(['rehomingListings'])
      toast.success(language === 'bn' ? 'পোস্ট সফলভাবে তৈরি হয়েছে!' : 'Listing created successfully!')
      if (onSuccess) onSuccess()
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || t('common.error'))
    }
  })

  const handleNext = () => {
    if (step === 1 && !formData.policy_accepted) {
      toast.error(language === 'bn' ? 'দয়া করে শর্তাবলী গ্রহণ করুন।' : 'Please accept the guidelines.')
      return
    }
    setStep(prev => prev + 1)
  }

  const handlePrev = () => setStep(prev => prev - 1)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.policy_accepted) return

    try {
      setIsUploading(true)
      let photo_url = ''
      
      // Upload image to ImgBB if selected
      if (imageFile) {
        photo_url = await uploadToImgBB(imageFile)
      }

      // Final payload
      const payload = {
        ...formData,
        photo_url,
      }

      // Convert empty strings to null for decimals
      if (!payload.age) delete payload.age
      if (!payload.weight_kg) delete payload.weight_kg

      createMutation.mutate(payload)
    } catch (error) {
      toast.error(language === 'bn' ? 'ছবি আপলোড করতে সমস্যা হয়েছে।' : 'Failed to upload image.')
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-2xl max-h-[95vh] rounded-3xl shadow-xl border border-border/60 flex flex-col relative animate-scale-in overflow-hidden">
        
        {/* Header (Fixed) */}
        <div className="bg-card/90 backdrop-blur-md px-6 py-4 border-b border-border/50 flex items-center justify-between z-20 shrink-0">
          <h2 className="text-xl font-extrabold text-foreground">
            {language === 'bn' ? 'নতুন রিহোমিং পোস্ট' : 'Create Rehoming Post'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-pcp-surface text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grow">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-8 shrink-0">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full flex-1 transition-colors ${
                  step >= s ? 'bg-pcp-green' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }} className="space-y-6">
            
            {/* STEP 1: Policy */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-5 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
                    <div className="space-y-2 text-sm text-amber-800 dark:text-amber-400">
                      <h3 className="font-extrabold text-base">
                        {language === 'bn' ? 'গুরুত্বপূর্ণ সতর্কতা ও দায়িত্ব' : 'Important Warning & Responsibility'}
                      </h3>
                      <p>
                        {language === 'bn' 
                          ? 'পেটকেয়ারপ্লাস শুধুমাত্র আপনার পোস্টটি অন্যদের কাছে পৌঁছে দিতে সাহায্য করে। দত্তক নিতে ইচ্ছুক ব্যক্তির সত্যতা যাচাই করা সম্পূর্ণ আপনার দায়িত্ব।'
                          : 'PetCarePlus only provides a platform to list your pet. It is entirely your responsibility to verify the authenticity of potential adopters.'}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 font-medium mt-2">
                        <li>{language === 'bn' ? 'স্ক্যামার এবং অসাধু পশু বিক্রেতাদের থেকে সাবধান থাকুন।' : 'Beware of scammers and unscrupulous pet sellers.'}</li>
                        <li>{language === 'bn' ? 'দত্তক দেওয়ার আগে গ্রহীতার বাড়ি ও পরিবেশ যাচাই করুন।' : "Verify the adopter's home and environment before handing over your pet."}</li>
                        <li>{language === 'bn' ? 'বাংলাদেশের প্রাণী কল্যাণ আইন, ২০১৯ মেনে চলতে আপনি বাধ্য।' : 'You are obligated to comply with the Animal Welfare Act, 2019 of Bangladesh.'}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setFormData({ ...formData, policy_accepted: !formData.policy_accepted })}
                  className="flex items-start gap-3 p-4 cursor-pointer hover:bg-pcp-surface/50 transition-colors bg-card"
                >
                  <div className={`mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md transition-all duration-200 ${formData.policy_accepted ? 'bg-pcp-green text-white' : 'bg-muted/50'}`}>
                    {formData.policy_accepted && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {language === 'bn' 
                      ? 'আমি উপরের সতর্কতাগুলো পড়েছি এবং বুঝতে পেরেছি। আমি সব দায়িত্ব গ্রহণ করছি।' 
                      : 'I have read and understood the warnings. I accept full responsibility.'}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: Basic Info */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in-right">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      {language === 'bn' ? 'প্রাণীর ধরন *' : 'Animal Type *'}
                    </label>
                    <CustomSelect
                      value={formData.animal_type}
                      onChange={(val) => setFormData({ ...formData, animal_type: val === 'all' ? '' : val })}
                      placeholder={language === 'bn' ? '-- নির্বাচন করুন --' : '-- Select --'}
                      options={rehomingTypes.map(t => ({
                        id: t.id,
                        label: language === 'bn' ? t.name_bn : t.name_en
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      {language === 'bn' ? 'পোষা প্রাণীর নাম *' : 'Pet Name *'}
                    </label>
                    <input
                      type="text"
                      value={formData.pet_name}
                      onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-pcp-green font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      {language === 'bn' ? 'ব্রিড (ঐচ্ছিক)' : 'Breed (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-pcp-green font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      {language === 'bn' ? 'লিঙ্গ' : 'Gender'}
                    </label>
                    <CustomSelect
                      value={formData.gender}
                      onChange={(val) => setFormData({ ...formData, gender: val === 'all' ? 'unknown' : val })}
                      placeholder={language === 'bn' ? '-- নির্বাচন করুন --' : '-- Select --'}
                      options={[
                        { id: 'male', label: language === 'bn' ? 'পুরুষ' : 'Male' },
                        { id: 'female', label: language === 'bn' ? 'স্ত্রী' : 'Female' },
                        { id: 'unknown', label: language === 'bn' ? 'অজানা' : 'Unknown' },
                      ]}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      {language === 'bn' ? 'বয়স (বছর)' : 'Age (Years)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-pcp-green font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      {language === 'bn' ? 'ওজন (কেজি)' : 'Weight (kg)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-pcp-green font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Health & Media */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in-right">
                
                {/* Photo Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">
                    {language === 'bn' ? 'ছবি আপলোড' : 'Upload Photo'}
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-pcp-surface transition-colors overflow-hidden group">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">Change Photo</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                        <UploadCloud className="w-10 h-10 mb-2 opacity-50 group-hover:opacity-80 transition-opacity text-pcp-green" />
                        <p className="text-sm font-semibold">Click to upload image</p>
                        <p className="text-xs opacity-70 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>

                <div className="flex gap-6 py-2">
                  <div 
                    onClick={() => setFormData({ ...formData, spayed_neutered: !formData.spayed_neutered })}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div className={`w-5 h-5 flex items-center justify-center rounded-md transition-all duration-200 ${formData.spayed_neutered ? 'bg-pcp-green text-white' : 'bg-muted/50 group-hover:bg-pcp-surface'}`}>
                      {formData.spayed_neutered && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {language === 'bn' ? 'স্পে/নিউটার করা' : 'Spayed/Neutered'}
                    </span>
                  </div>
                  <div 
                    onClick={() => setFormData({ ...formData, vaccinated: !formData.vaccinated })}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div className={`w-5 h-5 flex items-center justify-center rounded-md transition-all duration-200 ${formData.vaccinated ? 'bg-pcp-green text-white' : 'bg-muted/50 group-hover:bg-pcp-surface'}`}>
                      {formData.vaccinated && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {language === 'bn' ? 'টিকা দেওয়া' : 'Vaccinated'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">
                    {language === 'bn' ? 'রিহোমিং এর কারণ *' : 'Reason for rehoming *'}
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows="2"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-pcp-green font-medium resize-none"
                    placeholder="Briefly explain why you need to rehome..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">
                    {language === 'bn' ? 'গ্রহীতার জন্য শর্তাবলী' : 'Adopter Requirements'}
                  </label>
                  <textarea
                    value={formData.adopter_requirements}
                    onChange={(e) => setFormData({ ...formData, adopter_requirements: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-pcp-green font-medium resize-none"
                    placeholder="E.g., Must have a fenced yard, no other pets..."
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">
                    {language === 'bn' ? 'বিবরণ' : 'Description'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-pcp-green font-medium resize-none"
                    placeholder="Pet's personality, habits, history..."
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-border/50">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('common.back')}
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="submit"
                  className="px-6 py-2 bg-pcp-green hover:bg-pcp-green-hover text-white rounded-xl text-sm font-bold flex items-center gap-1 transition-all shadow-sm"
                >
                  {language === 'bn' ? 'পরবর্তী' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isUploading || createMutation.isPending}
                  className="px-6 py-2 bg-pcp-green hover:bg-pcp-green-hover text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  {(isUploading || createMutation.isPending) ? (
                    <Spinner size="sm" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isUploading 
                    ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') 
                    : (language === 'bn' ? 'পোস্ট করুন' : 'Submit Post')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateRehomingModal
