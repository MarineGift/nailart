import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bookings, staff } from '@/shared/schema'
import { eq, and, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const date = searchParams.get('date')
    const serviceDuration = searchParams.get('duration')
    
    if (!staffId || !date || !serviceDuration) {
      return NextResponse.json(
        { error: 'Missing required parameters: staffId, date, duration' },
        { status: 400 }
      )
    }
    
    const duration = parseInt(serviceDuration)
    
    // Get existing bookings for the staff on the specified date
    const existingBookings = await db
      .select({
        timeSlot: bookings.timeSlot,
        duration: bookings.duration
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.staffId, staffId),
          sql`DATE(${bookings.bookingDate}) = ${date}`
        )
      )

    // Generate all possible time slots (10:00 - 19:00 with 30-minute intervals)
    const allSlots = []
    for (let hour = 10; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        allSlots.push(timeSlot)
      }
    }

    // Filter out slots that conflict with existing bookings
    const availableSlots = allSlots.filter(slot => {
      return !existingBookings.some(booking => booking.timeSlot === slot)
    })
    
    return NextResponse.json({ availableSlots })
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available time slots' },
      { status: 500 }
    )
  }
}