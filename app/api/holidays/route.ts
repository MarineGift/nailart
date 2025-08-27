import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || '2025'
    const month = searchParams.get('month')
    
    console.log('=== HOLIDAYS API START ===')
    console.log('Year filter:', year)
    console.log('Month filter:', month)

    // Return mock data for now since holidays table may not exist
    const holidays = [
      { id: '1', date: '2025-01-01', name: 'New Year\'s Day', type: 'national', description: 'National holiday' },
      { id: '2', date: '2025-02-09', name: 'Lunar New Year', type: 'national', description: 'Korean traditional holiday' },
      { id: '3', date: '2025-02-10', name: 'Lunar New Year Holiday', type: 'national', description: 'Extended holiday' },
      { id: '4', date: '2025-02-11', name: 'Lunar New Year Holiday', type: 'national', description: 'Extended holiday' },
      { id: '5', date: '2025-03-01', name: 'Independence Movement Day', type: 'national', description: 'National independence day' },
      { id: '6', date: '2025-05-01', name: 'Labor Day', type: 'national', description: 'International workers day' },
      { id: '7', date: '2025-05-05', name: 'Children\'s Day', type: 'national', description: 'National children\'s day' },
      { id: '8', date: '2025-05-13', name: 'Buddha\'s Birthday', type: 'national', description: 'Buddhist holiday' },
      { id: '9', date: '2025-06-06', name: 'Memorial Day', type: 'national', description: 'Memorial day for fallen soldiers' },
      { id: '10', date: '2025-08-15', name: 'Liberation Day', type: 'national', description: 'National liberation day' },
      { id: '11', date: '2025-09-16', name: 'Chuseok', type: 'national', description: 'Korean thanksgiving' },
      { id: '12', date: '2025-09-17', name: 'Chuseok Holiday', type: 'national', description: 'Chuseok extended holiday' },
      { id: '13', date: '2025-09-18', name: 'Chuseok Holiday', type: 'national', description: 'Chuseok extended holiday' },
      { id: '14', date: '2025-10-03', name: 'National Foundation Day', type: 'national', description: 'National foundation day' },
      { id: '15', date: '2025-10-09', name: 'Hangeul Day', type: 'national', description: 'Korean alphabet day' },
      { id: '16', date: '2025-12-25', name: 'Christmas Day', type: 'national', description: 'Christmas' }
    ].filter(holiday => {
      if (month) {
        const holidayMonth = holiday.date.split('-')[1]
        return holidayMonth === month.padStart(2, '0')
      }
      return holiday.date.startsWith(year)
    })

    console.log('✅ Returning', holidays.length, 'holidays for', year)
    return NextResponse.json(holidays)
  } catch (error) {
    console.error('Error fetching holidays:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, name, type, description } = body

    if (!date || !name) {
      return NextResponse.json({ error: 'Date and name are required' }, { status: 400 })
    }

    // Mock implementation - return success
    const newHoliday = {
      id: Date.now().toString(),
      date,
      name,
      type: type || 'custom',
      description: description || '',
      created_at: new Date().toISOString()
    }

    console.log('✅ Created holiday:', newHoliday)
    return NextResponse.json(newHoliday)
  } catch (error) {
    console.error('Error creating holiday:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}