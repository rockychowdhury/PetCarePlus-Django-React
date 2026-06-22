import React, { useState, useEffect, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../../api/bookings'
import { providersApi } from '../../api/providers'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../../components/ui/Spinner'
import { Calendar, Clock, Check, X, Star, AlertCircle, CheckCircle, ChevronRight, User, Briefcase, ChevronDown, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import WriteReviewDialog from '../../components/providers/WriteReviewDialog'

const DashboardBookings = () => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isProvider = user?.role === 'provider'

  const [activeTab, setActiveTab] = useState('upcoming')

  // Review Modal State
  const [reviewBookingId, setReviewBookingId] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  // Query appointments
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['userBookings'],
    queryFn: () => bookingsApi.getBookings(),
  })

  const appointments = useMemo(() => {
    return Array.isArray(bookings) ? bookings : (bookings?.results || [])
  }, [bookings])

  // Memoize ALL heavy categorization + stats in a single useMemo
  const { todayBookings, upcomingBookings, historyBookings, totalBookings, todayBookingsCount, completedCount, completionRate, avgBookings } = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const nowTime = now.getTime()

    const todayArr = []
    const upcomingArr = []
    const historyArr = []

    // Sort and categorize in one pass
    const sorted = [...appointments].sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))

    sorted.forEach(booking => {
      if (!booking.booking_date) return
      const bDate = new Date(booking.booking_date)
      bDate.setHours(0, 0, 0, 0)
      const bTime = bDate.getTime()

      if (booking.status === 'completed' || booking.status === 'cancelled') {
        historyArr.push(booking)
      } else if (bTime === nowTime) {
        todayArr.push(booking)
      } else if (bTime > nowTime) {
        upcomingArr.push(booking)
      } else {
        historyArr.push(booking)
      }
    })

    const total = appointments.length
    const completed = appointments.filter(b => b.status === 'completed').length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    const days = new Set(appointments.filter(b => b.booking_date).map(b => b.booking_date)).size
    const avg = days > 0 ? (total / days).toFixed(1) : '0'

    return {
      todayBookings: todayArr,
      upcomingBookings: upcomingArr,
      historyBookings: historyArr,
      totalBookings: total,
      todayBookingsCount: todayArr.length,
      completedCount: completed,
      completionRate: rate,
      avgBookings: avg,
    }
  }, [appointments])

  // Auto-switch to today tab on first load only
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false)
  useEffect(() => {
    if (!hasAutoSwitched && todayBookings.length > 0) {
      setActiveTab('today')
      setHasAutoSwitched(true)
    }
  }, [hasAutoSwitched, todayBookings.length])

  // Mutation to update booking status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingsApi.updateBookingStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] })
      setConfirmAction(null)
      if (variables.status === 'confirmed') toast.success('Booking confirmed!')
      if (variables.status === 'completed') toast.success('Booking marked as completed!')
      if (variables.status === 'cancelled') toast.success('Booking cancelled.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || t('common.error'))
    },
  })

  const handleStatusChange = (bookingId, nextStatus) => {
    setConfirmAction({ bookingId, nextStatus })
  }

  const confirmStatusChange = () => {
    if (confirmAction) {
      updateStatusMutation.mutate({ id: confirmAction.bookingId, status: confirmAction.nextStatus })
    }
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    reviewMutation.mutate({
      booking: reviewBookingId,
      rating: reviewRating,
      comment_en: reviewComment,
      comment_bn: reviewComment,
    })
  }

  const currentBookings = useMemo(() => {
    if (activeTab === 'today') return todayBookings
    if (activeTab === 'upcoming') return upcomingBookings
    return historyBookings
  }, [activeTab, todayBookings, upcomingBookings, historyBookings])

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-[#FFF3CD] text-[#d39e00] dark:bg-amber-900/30 dark:text-amber-300',
      confirmed: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      completed: 'bg-[#d4edda] text-[#155724] dark:bg-emerald-900/30 dark:text-emerald-300',
      cancelled: 'bg-[#F8D7DA] text-[#721C24] dark:bg-rose-900/30 dark:text-rose-300',
    }
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${styles[status] || styles.pending}`}>
        {t(`bookings.status.${status}`)}
      </span>
    )
  }

  // TanStack Table setup for Providers
  const columns = useMemo(() => [
    {
      accessorKey: 'booking_date',
      header: language === 'bn' ? 'তারিখ ও সময়' : 'Date & Time',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-foreground">{row.original.booking_date}</span>
          <span className="text-xs text-muted-foreground font-bold">{row.original.booking_time || 'TBD'}</span>
        </div>
      ),
    },
    {
      id: 'person',
      header: isProvider ? (language === 'bn' ? 'কাস্টমার' : 'Customer') : (language === 'bn' ? 'প্রোভাইডার' : 'Provider'),
      cell: ({ row }) => {
        if (isProvider) {
          const clientName = row.original.user_name || row.original.user_email || 'N/A'
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-pcp-green/10 text-pcp-green flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-foreground">{clientName}</span>
            </div>
          )
        } else {
          const providerName = row.original.provider_details?.business_name || 'N/A'
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-pcp-green/10 text-pcp-green flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-foreground truncate max-w-[120px]">{providerName}</span>
            </div>
          )
        }
      }
    },
    {
      accessorKey: 'service',
      header: language === 'bn' ? 'সার্ভিস' : 'Service',
      cell: ({ row }) => {
        const serviceName = row.original.service_details?.name || 'N/A'
        const price = row.original.service_details?.price || '0.00'
        return (
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground line-clamp-1">{serviceName}</span>
            <span className="text-xs text-pcp-green font-extrabold">৳{price}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      id: 'actions',
      header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="flex items-center gap-2">
            {isProvider && booking.status === 'pending' && (
              <button
                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-extrabold transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                {t('bookings.actions.confirm', 'Confirm')}
              </button>
            )}
            {isProvider && booking.status === 'confirmed' && (
              <button
                onClick={() => handleStatusChange(booking.id, 'completed')}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-extrabold transition-all shadow-sm flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('bookings.actions.complete', 'Complete')}
              </button>
            )}
            {['pending', 'confirmed'].includes(booking.status) && (
              <button
                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                className="px-2 py-1.5 bg-[#FFF0F3] hover:bg-rose-100 text-[#e03131] border border-rose-100 dark:border-rose-900 dark:bg-rose-950/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Write Review for Customers */}
            {!isProvider && booking.status === 'completed' && !booking.has_review && (
              <button
                onClick={() => setReviewBookingId(booking.id)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-lg text-xs font-extrabold transition-all shadow-sm flex items-center gap-1 group whitespace-nowrap"
              >
                <Star className="w-3.5 h-3.5 fill-amber-950 group-hover:scale-110 transition-transform" />
                {language === 'bn' ? 'রিভিউ দিন' : 'Write Review'}
              </button>
            )}

            {/* Display Rating if Reviewed */}
            {booking.status === 'completed' && booking.has_review && (
              <div className="px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs font-extrabold flex items-center gap-1 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {booking.review_rating ? `${booking.review_rating} / 5` : (language === 'bn' ? 'রিভিউড' : 'Reviewed')}
              </div>
            )}
          </div>
        )
      }
    }
  ], [language])

  const table = useReactTable({
    data: currentBookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            {isProvider ? t('bookings.provider_bookings') : t('bookings.my_bookings')}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Manage all your appointments. Easily track today’s, upcoming, and past bookings in one place.
          </p>
        </div>
      </div>

      {/* Provider Stats */}
      {isProvider && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="bg-card border border-border/60 p-4 md:p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
            <p className="text-[10px] md:text-xs text-muted-foreground font-extrabold uppercase tracking-widest">{language === 'bn' ? 'আজকের বুকিং' : 'Today\'s Bookings'}</p>
            <p className="text-2xl md:text-3xl font-extrabold text-pcp-green mt-1">{todayBookingsCount}</p>
          </div>
          <div className="bg-card border border-border/60 p-4 md:p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
            <p className="text-[10px] md:text-xs text-muted-foreground font-extrabold uppercase tracking-widest">{language === 'bn' ? 'মোট বুকিং' : 'Total Bookings'}</p>
            <p className="text-2xl md:text-3xl font-extrabold text-foreground mt-1">{totalBookings}</p>
          </div>
          <div className="bg-card border border-border/60 p-4 md:p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
            <p className="text-[10px] md:text-xs text-muted-foreground font-extrabold uppercase tracking-widest">{language === 'bn' ? 'দৈনিক গড় বুকিং' : 'Daily Avg Bookings'}</p>
            <p className="text-2xl md:text-3xl font-extrabold text-foreground mt-1">{avgBookings}</p>
          </div>
          <div className="bg-card border border-border/60 p-4 md:p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
            <p className="text-[10px] md:text-xs text-muted-foreground font-extrabold uppercase tracking-widest">{language === 'bn' ? 'সম্পন্ন করার হার' : 'Completion Rate'}</p>
            <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 mt-1">{completionRate}%</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/80 px-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'today', label: language === 'bn' ? 'আজকে' : 'Today', count: todayBookings.length, colorClass: 'bg-rose-100 text-rose-700' },
          { id: 'upcoming', label: language === 'bn' ? 'আসন্ন' : 'Upcoming', count: upcomingBookings.length, colorClass: 'bg-blue-100 text-blue-700' },
          { id: 'history', label: language === 'bn' ? 'হিস্ট্রি' : 'History', count: historyBookings.length, colorClass: 'bg-emerald-100 text-emerald-700' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 text-sm font-extrabold transition-all duration-300 rounded-t-2xl flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'text-foreground bg-card shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] border-t border-x border-border/80' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-t border-x border-transparent'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? tab.colorClass : 'bg-muted text-muted-foreground'}`}>
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-card"></div>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pt-2">
        {isLoading ? (
          <Spinner className="py-24" />
        ) : currentBookings.length === 0 ? (
          <div className="text-center py-24 px-4 bg-card rounded-3xl border border-dashed border-border/80 shadow-sm flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-1">
              No bookings found
            </h3>
            <p className="text-sm text-muted-foreground">
              You have no appointments in this category.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-muted/30 border-b border-border/60">
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="px-5 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border/60">
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-5 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Pagination */}
            <div className="p-4 border-t border-border/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 border border-border rounded-lg text-sm font-bold disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {language === 'bn' ? 'আগের' : 'Previous'}
                </button>
                <button
                  className="px-3 py-1.5 border border-border rounded-lg text-sm font-bold disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {language === 'bn' ? 'পরের' : 'Next'}
                </button>
              </div>
              <span className="flex items-center gap-1 text-sm text-muted-foreground font-semibold">
                <div>Page</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <WriteReviewDialog
        isOpen={!!reviewBookingId}
        onClose={() => setReviewBookingId(null)}
        providerId={appointments.find(b => b.id === reviewBookingId)?.provider}
        providerName={appointments.find(b => b.id === reviewBookingId)?.provider_details?.business_name || 'Provider'}
        preselectedBookingId={reviewBookingId}
        onSuccessCallback={() => queryClient.invalidateQueries({ queryKey: ['userBookings'] })}
      />

      {/* Status Change Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-5 animate-fade-in-up text-center shadow-xl">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
              confirmAction.nextStatus === 'cancelled' 
                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600' 
                : confirmAction.nextStatus === 'completed'
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600'
                  : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600'
            }`}>
              {confirmAction.nextStatus === 'cancelled' 
                ? <X className="w-6 h-6" /> 
                : confirmAction.nextStatus === 'completed'
                  ? <CheckCircle2 className="w-6 h-6" />
                  : <Check className="w-6 h-6" />}
            </div>
            
            <h3 className="text-xl font-extrabold text-foreground">
              {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Action'}
            </h3>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'bn' 
                ? `আপনি কি এই বুকিংটি "${confirmAction.nextStatus === 'confirmed' ? 'নিশ্চিত' : confirmAction.nextStatus === 'completed' ? 'সম্পন্ন' : 'বাতিল'}" হিসেবে চিহ্নিত করতে চান?`
                : `Are you sure you want to mark this booking as "${confirmAction.nextStatus}"?`}
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-5 py-2.5 border border-border bg-card text-foreground text-sm font-semibold rounded-xl hover:bg-muted/50 transition-all active:scale-95"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                disabled={updateStatusMutation.isPending}
                className={`px-5 py-2.5 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-55 ${
                  confirmAction.nextStatus === 'cancelled'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : confirmAction.nextStatus === 'completed'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {updateStatusMutation.isPending && <Spinner size="sm" />}
                <span>
                  {confirmAction.nextStatus === 'confirmed' 
                    ? (language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm')
                    : confirmAction.nextStatus === 'completed' 
                      ? (language === 'bn' ? 'সম্পন্ন করুন' : 'Complete')
                      : (language === 'bn' ? 'বাতিল করুন' : 'Cancel Booking')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardBookings
