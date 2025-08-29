import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    console.log('=== ASSIGNMENTS GET API CALLED ===')
    console.log('Date:', date)

    // Get assignments with related data
    let query = supabase
      .from('assignments')
      .select(`
        id,
        booking_id,
        staff_id,
        assigned_at,
        bookings (
          id,
          customer_id,
          booking_time,
          status,
          source,
          notes,
          customers (
            id,
            first_name,
            last_name,
            phone_raw
          )
        ),
        staff (
          id,
          first_name,
          last_name,
          role,
          is_active
        )
      `)
      .order('assigned_at', { ascending: false })

    // Filter by date if provided
    if (date) {
      const startOfDay = new Date(date + 'T00:00:00Z').toISOString()
      const endOfDay = new Date(date + 'T23:59:59Z').toISOString()
      
      // Note: We need to filter by booking_time through the bookings relation
      query = query
        .gte('bookings.booking_time', startOfDay)
        .lte('bookings.booking_time', endOfDay)
    }

    const { data: assignments, error } = await query

    if (error) {
      console.error('Database query failed:', error)
      return NextResponse.json([])
    }

    // Transform data to match expected format
    const result = (assignments || []).map(assignment => {
      const booking = assignment.bookings
      const customer = booking?.customers
      const staff = assignment.staff

      return {
        id: assignment.id,
        booking_id: assignment.booking_id,
        staff_id: assignment.staff_id,
        assigned_at: assignment.assigned_at,
        
        // Booking data
        customer_id: booking?.customer_id,
        customer_name: customer?.last_name || '',
        customer_first_name: customer?.first_name || '',
        customer_phone: customer?.phone_raw || '',
        booking_time: booking?.booking_time,
        booking_date: booking?.booking_time?.split('T')[0] || date,
        time_slot: booking?.booking_time?.split('T')[1]?.substring(0, 5) || '',
        status: booking?.status,
        source: booking?.source,
        notes: booking?.notes,
        
        // Staff data
        staff_name: staff ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() : '',
        staff_first_name: staff?.first_name || '',
        staff_last_name: staff?.last_name || '',
        staff_role: staff?.role || 'staff'
      }
    })

    console.log('=== ASSIGNMENTS FOUND ===', result.length)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('=== CREATING ASSIGNMENT ===')
    console.log('Request body:', JSON.stringify(body, null, 2))

    const { booking_id, staff_id } = body

    if (!booking_id || !staff_id) {
      return NextResponse.json(
        { error: 'booking_id and staff_id are required' }, 
        { status: 400 }
      )
    }

    // Insert new assignment (upsert in case assignment already exists)
    const { data, error } = await supabase
      .from('assignments')
      .upsert({
        booking_id,
        staff_id,
        assigned_at: new Date().toISOString()
      }, {
        onConflict: 'booking_id', // Unique constraint on booking_id
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      console.error('Assignment creation failed:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Also add to assignment history for tracking
    await supabase
      .from('assignment_history')
      .insert({
        booking_id,
        staff_id,
        assigned_at: new Date().toISOString(),
        reason: 'Manual assignment'
      })

    console.log('✅ Assignment created successfully:', data.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, booking_id, staff_id } = body

    // Update assignment
    const { data, error } = await supabase
      .from('assignments')
      .update({
        staff_id,
        assigned_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Assignment update failed:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Add to history
    await supabase
      .from('assignment_history')
      .insert({
        booking_id: booking_id,
        staff_id,
        assigned_at: new Date().toISOString(),
        reason: 'Assignment updated'
      })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID required' }, { status: 400 })
    }

    // Delete assignment
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Assignment deletion failed:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}