'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarProps {
  mode?: 'single'
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  locale?: any
  className?: string
}

export function Calendar({ 
  mode = 'single', 
  selected, 
  onSelect, 
  disabled, 
  className = '' 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const isSelected = (date: Date | null) => {
    if (!date || !selected) return false
    return date.toDateString() === selected.toDateString()
  }

  const isDisabled = (date: Date | null) => {
    if (!date) return true
    return disabled ? disabled(date) : false
  }

  const handleDateClick = (date: Date | null) => {
    if (!date || isDisabled(date)) return
    onSelect?.(date)
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className={`p-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-semibold">
          {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(date)}
            disabled={isDisabled(date)}
            className={`
              h-8 text-sm rounded-md transition-colors
              ${!date ? 'cursor-default' : 'hover:bg-gray-100'}
              ${isSelected(date) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
              ${isDisabled(date) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900'}
              ${date && !isDisabled(date) && !isSelected(date) ? 'hover:bg-gray-100' : ''}
            `}
          >
            {date?.getDate()}
          </button>
        ))}
      </div>
    </div>
  )
}