import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { guidelinesApi } from '../../api/guidelines'
import { useLanguage } from '../../hooks/useLanguage'
import { getAnimalIcon, ANIMAL_THEMES } from '../../utils/animals'
import { Compass, Sparkles } from 'lucide-react'

export const AnimalFilter = ({ activeAnimalId, onSelectAnimal }) => {
  const { language, t } = useLanguage()

  // Query animal types from backend
  const { data: animalTypes, isLoading } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: guidelinesApi.getAnimalTypes,
  })

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-24 h-24 rounded-2xl bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto py-2 pr-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* "All" Filter Button */}
      <button
        onClick={() => onSelectAnimal(null)}
        className={`flex flex-col items-center justify-center flex-shrink-0 w-20 sm:w-24 h-20 sm:h-24 rounded-2xl border text-center transition-all ${
          activeAnimalId === null
            ? 'bg-primary text-primary-foreground border-primary shadow-md scale-95'
            : 'bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/30'
        }`}
      >
        <Compass className={`w-5 sm:w-6 h-5 sm:h-6 mb-1.5 ${activeAnimalId === null ? 'text-white' : 'text-primary'}`} />
        <span className="text-[10px] sm:text-xs font-bold leading-tight">
          {language === 'bn' ? 'সব প্রাণী' : 'All Animals'}
        </span>
      </button>

      {/* Render 8 animal buttons */}
      {animalTypes?.map((animal) => {
        const Icon = getAnimalIcon(animal.slug)
        const theme = ANIMAL_THEMES[animal.slug] || ANIMAL_THEMES.cat
        const isSelected = activeAnimalId === animal.id

        return (
          <button
            key={animal.id}
            onClick={() => onSelectAnimal(animal.id)}
            className={`flex flex-col items-center justify-center flex-shrink-0 w-20 sm:w-24 h-20 sm:h-24 rounded-2xl border text-center transition-all ${
              isSelected
                ? 'bg-primary text-white border-primary shadow-md scale-95'
                : `${theme.bg} ${theme.border} hover:scale-[0.98]`
            }`}
          >
            <Icon
              className={`w-5 sm:w-6 h-5 sm:h-6 mb-1.5 ${
                isSelected ? 'text-white' : theme.text
              }`}
            />
            <span className={`text-[10px] sm:text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-foreground'}`}>
              {language === 'bn' ? animal.name_bn : animal.name_en}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default AnimalFilter
