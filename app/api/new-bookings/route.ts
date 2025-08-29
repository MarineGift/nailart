import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bookings } from '@/shared/schema'
import { insertBookingSchema } from '@/shared/schema'
import { sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    
    // Validate the booking data
    const validatedData = insertBookingSchema.parse(body)
    
    // Create the booking
    const result = await db.insert(bookings).values(validatedData).returning()
    
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    let result
    
    if (date) {
      result = await db
        .select()
        .from(bookings)
        .where(sql`DATE(${bookings.bookingDate}) = ${date}`)
    } else {
      result = await db.select().from(bookings)
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}