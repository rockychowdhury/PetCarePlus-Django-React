import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { aiApi } from '../../api/ai'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../ui/Spinner'
import { Activity, MessageSquare, Calendar, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

const DashboardAISessions = () => {
  const { language, t } = useLanguage()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['ai-sessions'],
    queryFn: () => aiApi.getSessions(),
  })

  const sessions = data?.results || data || []

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-2">
          <Activity className="w-8 h-8 text-indigo-500" />
          {language === 'bn' ? 'এআই সেশন হিস্ট্রি' : 'AI Session History'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === 'bn' 
            ? 'আপনার পূর্ববর্তী এআই ডায়াগনস্টিক এবং পরামর্শের রেকর্ড।' 
            : 'Records of your past AI diagnostic sessions and consultations.'}
        </p>
      </div>

      <div className="bg-card dark:bg-pcp-card rounded-2xl border border-pcp-border/60 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 px-4">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-300 dark:text-indigo-700 rounded-full flex items-center justify-center mb-2">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {language === 'bn' ? 'কোনো এআই সেশন নেই' : 'No AI Sessions Yet'}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {language === 'bn'
                ? 'আপনি এখনও এআই অ্যাসিস্ট্যান্টের সাথে কোনো কথা বলেননি। আপনার পোষা প্রাণীর সমস্যা জানতে এআই এর সাহায্য নিন।'
                : "You haven't consulted the AI Assistant yet. Start a new session to get instant advice for your pet's health."}
            </p>
            <button
              onClick={() => navigate('/ai-assistant')}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-md transition-all"
            >
              {language === 'bn' ? 'নতুন সেশন শুরু করুন' : 'Start New Session'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className="p-5 sm:p-6 hover:bg-pcp-surface/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {session.animal_type_details?.name_en || 'Pet'}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(session.started_at), 'MMM d, yyyy - h:mm a')}
                    </span>
                  </div>
                  
                  {session.ai_diagnosis_summary ? (
                    <p className="text-sm text-foreground font-medium line-clamp-2 max-w-2xl">
                      {session.ai_diagnosis_summary}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {language === 'bn' ? 'সেশন অসম্পূর্ণ' : 'Incomplete session'}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground font-medium">
                      {session.total_turns} {language === 'bn' ? 'মেসেজ' : 'messages'}
                    </span>
                    {session.urgency_level && (
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        session.urgency_level === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                        session.urgency_level === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {session.urgency_level}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={() => navigate(`/ai-assistant?session=${session.id}`)}
                    className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 px-4 py-2 rounded-lg w-full sm:w-auto justify-center"
                  >
                    {language === 'bn' ? 'সেশন দেখুন' : 'View Session'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardAISessions
