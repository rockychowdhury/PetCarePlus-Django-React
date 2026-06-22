import React from 'react'
import ProviderCard from './ProviderCard'
import { useLanguage } from '../../hooks/useLanguage'

export const ProviderGrid = ({ providers, isLoading }) => {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border border-border/85 bg-card rounded-2xl p-5 space-y-4 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="w-12 h-6 bg-muted rounded-md" />
              <div className="w-16 h-4 bg-muted rounded" />
            </div>
            <div className="w-3/4 h-5 bg-muted rounded" />
            <div className="w-1/2 h-4 bg-muted rounded" />
            <div className="pt-2 border-t border-border/40 space-y-1">
              <div className="w-full h-3.5 bg-muted rounded" />
              <div className="w-24 h-3.5 bg-muted rounded" />
            </div>
            <div className="w-full h-8 bg-muted rounded-lg pt-4" />
          </div>
        ))}
      </div>
    )
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-pcp-surface/40 rounded-2xl border border-dashed border-border/80">
        <p className="text-sm font-bold text-muted-foreground">
          {t('providers.no_providers')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {providers.map((provider) => (
        <div key={provider.id} className="animate-fade-in-up">
          <ProviderCard provider={provider} />
        </div>
      ))}
    </div>
  )
}

export default ProviderGrid
