import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Create 5 customers with minimal data first
    const customerResults = []
    for (let i = 1; i <= 5; i++) {
      const { data, error } = await supabase
        .from('customers')
        .insert({})
        .select()
        .single()
      
      if (error) throw error
      customerResults.push(data)
    }

    // Create bookings with proper foreign key relationships using actual customer IDs
    const bookingResults = []
    
    // Create bookings for each customer
    for (let i = 0; i < customerResults.length; i++) {
      const customerId = customerResults[i].id
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          customer_id: customerId,
          booking_start: new Date(Date.now() + (i * 2 * 60 * 60 * 1000)).toISOString(), // spread bookings every 2 hours
          booking_end: new Date(Date.now() + (i * 2 * 60 * 60 * 1000) + (90 * 60 * 1000)).toISOString(), // 1.5 hour duration
          status: ['confirmed', 'completed', 'pending'][i % 3]
        })
        .select()
        .single()
        
      if (error) throw error
      bookingResults.push(data)
    }
    
    // Create one additional booking for first customer (repeat customer)
    const { data: repeatBooking, error: repeatError } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerResults[0].id,
        booking_start: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(), // tomorrow
        booking_end: new Date(Date.now() + (24 * 60 * 60 * 1000) + (90 * 60 * 1000)).toISOString(),
        status: 'confirmed'
      })
      .select()
      .single()
      
    if (repeatError) throw repeatError
    bookingResults.push(repeatBooking)

    // Create booking details for services
    const bookingDetails = [
      {
        booking_id: '660e8400-e29b-41d4-a716-446655440001',
        service_id: 1, // Gel Manicure
        price_cents: 4500,
        quantity: 1
      },
      {
        booking_id: '660e8400-e29b-41d4-a716-446655440002', 
        service_id: 2, // Gel Pedicure
        price_cents: 5500,
        quantity: 1
      },
      {
        booking_id: '660e8400-e29b-41d4-a716-446655440003',
        service_id: 7, // Dip Powder Manicure
        price_cents: 5000,
        quantity: 1
      },
      {
        booking_id: '660e8400-e29b-41d4-a716-446655440004',
        service_id: 12, // French Manicure
        price_cents: 4000,
        quantity: 1
      },
      {
        booking_id: '660e8400-e29b-41d4-a716-446655440005',
        service_id: 3, // Acrylic Full Set
        price_cents: 6500,
        quantity: 1
      },
      {
        booking_id: '660e8400-e29b-41d4-a716-446655440006',
        service_id: 15, // Nail Art Design
        price_cents: 3500,
        quantity: 1
      },
      {
        booking_id: '660e8400-e29b-41d4-a716-446655440007',
        service_id: 5, // Manicure and Pedicure
        price_cents: 7500,
        quantity: 1
      },
      {
        booking_id: '660e8400-e29b-41d4-a716-446655440008',
        service_id: 9, // Polygel Manicure
        price_cents: 5500,
        quantity: 1
      }
    ]

    const { error: detailsError } = await supabase.from('booking_details').insert(bookingDetails)
    if (detailsError) throw detailsError

    return NextResponse.json({ 
      message: 'Relational data seeded successfully',
      customers: customers.length,
      bookings: bookings.length,
      bookingDetails: bookingDetails.length
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  }
}