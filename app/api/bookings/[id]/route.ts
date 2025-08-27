// Individual booking management API
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendBookingUpdateEmailToAdmin } from '@/lib/notifications'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services(*),
        customers(*),
        staff(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    console.log('Updating booking:', id, 'with data:', body)
    
    // Only update fields that exist in the actual database schema
    const updateData: any = {
      status: body.status,
      notes: body.notes
    }
    
    // Add staff assignment if provided - use notes field to store staff assignment
    if (body.staff_id) {
      updateData.notes = `${body.notes || ''} | Assigned Staff: ${body.staff_id}`.trim()
    }
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      throw error
    }

    console.log('Successfully updated booking:', booking)
    
    // Send email notification for booking update
    try {
      const { data: completeBooking } = await supabase
        .from('bookings')
        .select(`
          *,
          customers(
            id,
            last_name,
            phone_raw,
            email
          ),
          booking_details(
            id,
            service_id,
            quantity,
            price_cents,
            services(
              id,
              name,
              description,
              category
            )
          )
        `)
        .eq('id', id)
        .single()

      const bookingForNotification = completeBooking || booking
      await sendBookingUpdateEmailToAdmin(bookingForNotification)
    } catch (notificationError) {
      console.error('Failed to send booking update notification:', notificationError)
      // Don't fail the update if notification fails
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking', details: error }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const { data: booking, error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}