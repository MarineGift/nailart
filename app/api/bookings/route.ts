// Booking management API with full CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendNewBookingEmailToAdmin, sendNewBookingSMSToAdmin } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedDate = searchParams.get('date') // Format: YYYY-MM-DD
    
    console.log(`=== BOOKINGS GET API CALLED ===`)
    console.log(`Requested date: ${requestedDate}`)
    console.log('Supabase client initialized with service key')

    if (!requestedDate) {
      // Return all bookings if no date specified
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customers!bookings_customer_id_fkey(
            id,
            last_name,
            phone_number,
            email
          )
        `)
        .order('booking_time', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json([])
      }

      console.log(`✅ Found ${bookings?.length || 0} total bookings from Supabase`)
      return NextResponse.json(bookings || [])
    }

    // Calculate date range for filtering
    const startOfDay = `${requestedDate}T00:00:00+00:00`
    const endOfDay = `${requestedDate}T23:59:59+00:00`

    // Get bookings for the specified date with customer information joined
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customers!bookings_customer_id_fkey(
          id,
          last_name,
          phone_raw,
          email
        )
      `)
      .gte('booking_time', startOfDay)
      .lt('booking_time', endOfDay)
      .order('booking_time', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json([], { status: 500 })
    }

    console.log(`✅ Found ${bookings?.length || 0} bookings for ${requestedDate} from Supabase`)
    console.log('Raw bookings data:', bookings)

    // Map bookings to include parsed time_slot and customer information
    const mappedBookings = bookings?.map(booking => {
      const bookingTime = new Date(booking.booking_time)
      const timeSlot = bookingTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      })
      
      // Extract customer information from the joined table
      const customerInfo = booking.customers || {}
      const customerName = customerInfo.last_name || null
      const customerPhone = customerInfo.phone_raw || null
      
      console.log(`Mapping booking ${booking.id}: time_slot=${timeSlot}, customer_name=${customerName}, phone=${customerPhone}`)
      
      // Extract staff_id from notes if it exists there
      let staffId = booking.staff_id || null
      if (!staffId && booking.notes) {
        const staffMatch = booking.notes.match(/Assigned Staff: ([a-f0-9-]+)/)
        if (staffMatch) {
          staffId = staffMatch[1]
        }
      }
      
      return {
        ...booking,
        time_slot: timeSlot,
        customer_name: customerName,
        customer_phone: customerPhone,
        staff_id: staffId
      }
    }) || []

    console.log('Mapped bookings data:', mappedBookings)
    return NextResponse.json(mappedBookings)

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Insert into actual Supabase bookings table with correct structure
    // Based on discovered schema: id, customer_id (UUID), booking_time (timestamp), status, notes
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        customer_id: body.customer_id || null, // Can be null initially
        booking_time: `${body.appointment_date || body.booking_date} ${body.appointment_time || body.booking_time}:00`, // Combined datetime
        status: 'scheduled', // Use valid enum value
        source: body.source || 'Homepage', // Store source separately
        notes: body.notes || '', // Keep notes clean
        // Store additional info in notes since columns don't exist
      }])
      .select('*')
      .single()

    if (error) {
      console.error('Error creating booking in Supabase:', error)
      return NextResponse.json({ error: 'Failed to create booking', details: error }, { status: 500 })
    }

    console.log('✅ Booking created successfully in Supabase:', booking)
    
    // Send notifications
    try {
      await sendNewBookingEmailToAdmin(booking)
      await sendNewBookingSMSToAdmin(booking)
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError)
      // Don't fail the booking creation if notifications fail
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}