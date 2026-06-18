import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isBefore,
  startOfDay,
} from "date-fns"
import { cn } from "../../lib/utils"

function Calendar({
  selected,
  onSelect,
  disabled,
  className,
  ...props
}) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date())

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const onDateClick = (day) => {
    if (disabled && disabled(day)) return
    if (onSelect) onSelect(day)
  }

  // Generate days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = "d"
  const rows = []
  let days = []
  let day = startDate
  let formattedDate = ""

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat)
      const cloneDay = day
      const isSelected = selected && isSameDay(day, selected)
      const isDisabled = disabled && disabled(day)
      const isCurrentMonth = isSameMonth(day, monthStart)
      const isToday = isSameDay(day, new Date())

      days.push(
        <button
          type="button"
          key={day.toString()}
          disabled={isDisabled}
          onClick={() => onDateClick(cloneDay)}
          className={cn(
            "h-9 w-9 p-0 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 focus:outline-none",
            !isCurrentMonth ? "text-muted-foreground opacity-40" : "text-pcp-text-primary dark:text-foreground",
            isDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-pcp-green/10 dark:hover:bg-pcp-green/20",
            isSelected && "bg-pcp-green text-white hover:bg-pcp-green hover:text-white shadow-sm scale-105",
            isToday && !isSelected && "bg-pcp-surface dark:bg-pcp-green/10 text-pcp-green border border-pcp-green/30"
          )}
        >
          {formattedDate}
        </button>
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div className="flex w-full justify-between mt-1.5" key={day.toString()}>
        {days}
      </div>
    )
    days = []
  }

  return (
    <div className={cn("p-4 bg-card rounded-2xl shadow-md border border-pcp-border/60 dark:border-white/10 w-[300px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-pcp-text-secondary hover:bg-pcp-surface dark:hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-[15px] font-extrabold text-pcp-text-primary dark:text-foreground tracking-tight">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-pcp-text-secondary hover:bg-pcp-surface dark:hover:bg-white/5 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="flex w-full justify-between mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="w-9 text-center text-[11px] font-extrabold text-muted-foreground tracking-wider uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-col">
        {rows}
      </div>
    </div>
  )
}

export { Calendar }
