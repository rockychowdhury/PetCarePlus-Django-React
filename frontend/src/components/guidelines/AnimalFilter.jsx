import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { guidelinesApi } from '../../api/guidelines'
import { useLanguage } from '../../hooks/useLanguage'
import { getAnimalIcon, ANIMAL_THEMES } from '../../utils/animals'
import { Compass } from 'lucide-react'

export const AnimalFilter = ({ activeAnimalId, onSelectAnimal }) => {
  const { language } = useLanguage()

  // Query animal types from backend
  const { data: animalTypes, isLoading } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: guidelinesApi.getAnimalTypes,
  })

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 py-1">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-24 h-8 rounded-full bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 py-1">
      {/* "All" Filter Chip */}
      <button
        onClick={() => onSelectAnimal(null)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-sm ${
          activeAnimalId === null
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card border-border/80 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/30'
        }`}
      >
        <Compass className={`w-3.5 h-3.5 ${activeAnimalId === null ? 'text-white' : 'text-primary'}`} />
        <span>
          {language === 'bn' ? 'সব প্রাণী' : 'All Animals'}
        </span>
      </button>

      {/* Render animal chips */}
      {animalTypes?.map((animal) => {
        const Icon = getAnimalIcon(animal.slug)
        const theme = ANIMAL_THEMES[animal.slug] || ANIMAL_THEMES.cat
        const isSelected = activeAnimalId === animal.id

        return (
          <button
            key={animal.id}
            onClick={() => onSelectAnimal(animal.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-sm ${
              isSelected
                ? 'bg-primary text-white border-primary'
                : `bg-card border-border/80 ${theme.text} hover:bg-muted/30 hover:border-border`
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 ${
                isSelected ? 'text-white' : theme.text
              }`}
            />
            <span>
              {language === 'bn' ? animal.name_bn : animal.name_en}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default AnimalFilter
