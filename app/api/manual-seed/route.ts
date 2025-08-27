import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Manual insert with minimal fields that definitely exist
    
    // Step 1: Insert customers with only phone number (required field)
    const customer1 = await supabase
      .from('customers')
      .insert({ phone_number: '2025551001' })
      .select()
      .single()
    
    const customer2 = await supabase
      .from('customers') 
      .insert({ phone_number: '2025551002' })
      .select()
      .single()
      
    const customer3 = await supabase
      .from('customers')
      .insert({ phone_number: '2025551003' })
      .select()
      .single()

    if (customer1.error || customer2.error || customer3.error) {
      throw new Error('Failed to create customers')
    }

    // Step 2: Insert bookings with proper foreign key relationships  
    const booking1 = await supabase
      .from('bookings')
      .insert({
        customer_id: customer1.data.id,
        booking_start: '2025-08-20T10:00:00Z',
        booking_end: '2025-08-20T11:30:00Z',
        status: 'completed'
      })
      .select()
      .single()

    const booking2 = await supabase
      .from('bookings')
      .insert({
        customer_id: customer2.data.id,
        booking_start: '2025-08-20T14:00:00Z', 
        booking_end: '2025-08-20T15:30:00Z',
        status: 'confirmed'
      })
      .select()
      .single()

    const booking3 = await supabase
      .from('bookings')
      .insert({
        customer_id: customer3.data.id,
        booking_start: '2025-08-20T16:00:00Z',
        booking_end: '2025-08-20T17:30:00Z', 
        status: 'pending'
      })
      .select()
      .single()
      
    const booking4 = await supabase
      .from('bookings')
      .insert({
        customer_id: customer1.data.id, // Same customer, multiple bookings
        booking_start: '2025-08-20T18:00:00Z',
        booking_end: '2025-08-20T19:30:00Z',
        status: 'confirmed'
      })
      .select()
      .single()

    const booking5 = await supabase
      .from('bookings')
      .insert({
        customer_id: customer2.data.id, // Same customer, multiple bookings
        booking_start: '2025-08-20T19:00:00Z',
        booking_end: '2025-08-20T20:30:00Z',
        status: 'completed'
      })
      .select()
      .single()

    return NextResponse.json({
      message: 'Manual relational data created successfully',
      customers: 3,
      bookings: 5,
      relationships: 'customers ← bookings (proper foreign keys)'
    })
  } catch (error) {
    console.error('Manual seed error:', error)
    return NextResponse.json({ error: 'Manual seed failed', details: error.message }, { status: 500 })
  }
}