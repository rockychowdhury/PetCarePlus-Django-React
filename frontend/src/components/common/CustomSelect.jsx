import React, { useState, useEffect, useRef } from 'react'

export const CustomSelect = ({ value, onChange, options, placeholder, disabled, icon }) => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const safeOptions = Array.isArray(options) ? options : []
  const selectedOption = safeOptions.find(o => String(o.id) === String(value))

  return (
    <div ref={wrapperRef} className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div 
        className={`w-full px-4 py-2 text-sm rounded-full border border-pcp-border dark:border-border/60 bg-white dark:bg-pcp-card cursor-pointer flex justify-between items-center transition-all font-bold shadow-sm hover:border-pcp-green/50 ${isOpen ? 'ring-1 ring-pcp-green' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption?.icon ? (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          ) : icon ? (
            <span className="text-pcp-green flex-shrink-0">{icon}</span>
          ) : null}
          <span className={`truncate text-pcp-green`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-pcp-green' : 'text-pcp-green/70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-[60] w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto animate-fade-in">
          <div 
            className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/10 ${!value || value === 'all' ? 'bg-primary/5 text-primary font-bold' : 'text-muted-foreground'}`}
            onClick={() => { onChange('all'); setIsOpen(false) }}
          >
            {placeholder}
          </div>
          {safeOptions.map((opt) => (
            <div 
              key={opt.id} 
              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/10 transition-colors flex items-center gap-2.5 ${String(value) === String(opt.id) ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary' : 'text-foreground'}`}
              onClick={() => { onChange(opt.id); setIsOpen(false) }}
            >
              {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
