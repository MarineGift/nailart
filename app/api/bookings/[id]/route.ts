// Individual booking management API
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    const updateData: any = {}
    
    // Add status if provided
    if (body.status) {
      updateData.status = body.status
    }
    
    // Add notes if provided
    if (body.notes) {
      updateData.notes = body.notes
    }
    
    // Add date and time updates if provided
    if (body.booking_date && body.time_slot) {
      updateData.booking_time = `${body.booking_date}T${body.time_slot}:00+00:00`
    } else if (body.booking_date) {
      // Extract time from original booking and combine with new date
      // This would require fetching the original booking first
      const originalBooking = await supabase
        .from('bookings')
        .select('booking_time')
        .eq('id', id)
        .single()
      
      if (originalBooking.data?.booking_time) {
        const originalTime = new Date(originalBooking.data.booking_time).toTimeString().slice(0, 5)
        updateData.booking_time = `${body.booking_date}T${originalTime}:00+00:00`
      }
    } else if (body.time_slot) {
      // Extract date from original booking and combine with new time
      const originalBooking = await supabase
        .from('bookings')
        .select('booking_time')
        .eq('id', id)
        .single()
      
      if (originalBooking.data?.booking_time) {
        const originalDate = new Date(originalBooking.data.booking_time).toISOString().split('T')[0]
        updateData.booking_time = `${originalDate}T${body.time_slot}:00+00:00`
      }
    }
    
    // Note: service_id column doesn't exist in bookings table based on schema
    // Service information is handled through service relationships or notes
    
    // Remove old "Assigned Staff" entries from notes to prevent duplication
    if (body.notes) {
      updateData.notes = body.notes.replace(/\s*\|\s*Assigned Staff: [a-f0-9-]+/g, '').trim()
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