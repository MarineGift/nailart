import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Step 1: Insert services with minimal required fields only
    const servicesData = [
      { name: 'Gel Manicure', price: 45.00 },
      { name: 'Gel Pedicure', price: 55.00 },
      { name: 'Acrylic Full Set', price: 65.00 },
      { name: 'Dip Powder Manicure', price: 50.00 },
      { name: 'Classic Manicure', price: 35.00 }
    ]

    const { error: servicesError } = await supabase.from('services').insert(servicesData)
    if (servicesError) throw servicesError

    // Step 2: Insert staff with minimal required fields only
    const staffData = [
      { id: '6e82662b-6f8b-4f77-81a2-22bdaa807fa1', first_name: 'Connie', last_name: 'Lee' },
      { id: 'e858ff00-fa04-4ef4-a392-772baa077659', first_name: 'Sarah', last_name: 'Kim' },
      { id: '6dc61fb6-7a09-4e35-af37-3ad6a3cbb61a', first_name: 'Michelle', last_name: 'Park' },
      { id: 'f1bb65c5-1a90-4690-9efa-2cd8a1e8f022', first_name: 'Jessica', last_name: 'Wang' },
      { id: 'd2bb3523-71a3-414c-acb7-3ccfd2151bac', first_name: 'Amy', last_name: 'Chen' }
    ]

    const { error: staffError } = await supabase.from('staff').insert(staffData)
    if (staffError) throw staffError

    // Step 3: Insert customers with minimal required fields only
    const customersData = [
      { phone_number: '2025551001' },
      { phone_number: '2025551002' },
      { phone_number: '2025551003' },
      { phone_number: '2025551004' },
      { phone_number: '2025551005' }
    ]

    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .insert(customersData)
      .select()

    if (customersError) throw customersError

    // Step 4: Insert bookings with proper foreign key relationships
    const bookingsData = [
      {
        customer_id: customers[0].id,
        staff_id: '6e82662b-6f8b-4f77-81a2-22bdaa807fa1',
        booking_start: '2025-08-20T10:00:00Z',
        booking_end: '2025-08-20T11:30:00Z',
        status: 'completed'
      },
      {
        customer_id: customers[1].id,
        staff_id: 'e858ff00-fa04-4ef4-a392-772baa077659',
        booking_start: '2025-08-20T14:00:00Z',
        booking_end: '2025-08-20T15:30:00Z',
        status: 'confirmed'
      },
      {
        customer_id: customers[2].id,
        staff_id: '6dc61fb6-7a09-4e35-af37-3ad6a3cbb61a',
        booking_start: '2025-08-20T16:00:00Z',
        booking_end: '2025-08-20T17:30:00Z',
        status: 'pending'
      },
      {
        customer_id: customers[0].id, // Same customer, multiple bookings
        staff_id: 'f1bb65c5-1a90-4690-9efa-2cd8a1e8f022',
        booking_start: '2025-08-21T10:00:00Z',
        booking_end: '2025-08-21T11:30:00Z',
        status: 'confirmed'
      },
      {
        customer_id: customers[3].id,
        staff_id: 'd2bb3523-71a3-414c-acb7-3ccfd2151bac',
        booking_start: '2025-08-21T14:00:00Z',
        booking_end: '2025-08-21T15:30:00Z',
        status: 'completed'
      }
    ]

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .insert(bookingsData)
      .select()

    if (bookingsError) throw bookingsError

    // Step 5: Insert booking details with proper foreign key relationships
    const bookingDetailsData = [
      { booking_id: bookings[0].id, service_id: 1, price_cents: 4500, quantity: 1 }, // Gel Manicure
      { booking_id: bookings[1].id, service_id: 2, price_cents: 5500, quantity: 1 }, // Gel Pedicure
      { booking_id: bookings[2].id, service_id: 3, price_cents: 6500, quantity: 1 }, // Acrylic Full Set
      { booking_id: bookings[3].id, service_id: 4, price_cents: 5000, quantity: 1 }, // Dip Powder
      { booking_id: bookings[4].id, service_id: 5, price_cents: 3500, quantity: 1 }, // Classic Manicure
    ]

    const { error: detailsError } = await supabase.from('booking_details').insert(bookingDetailsData)
    if (detailsError) throw detailsError

    return NextResponse.json({
      message: 'Complete relational database structure created successfully!',
      summary: {
        services: servicesData.length,
        staff: staffData.length,
        customers: customers.length,
        bookings: bookings.length,
        bookingDetails: bookingDetailsData.length
      },
      relationships: {
        'customers ← bookings': `${customers.length} customers have ${bookings.length} bookings`,
        'bookings → staff': `${bookings.length} bookings assigned to ${staffData.length} staff members`,
        'bookings ← booking_details → services': `${bookings.length} bookings contain ${bookingDetailsData.length} service details`
      },
      foreignKeys: 'All foreign key constraints properly established'
    })
  } catch (error) {
    console.error('Error seeding relational data:', error)
    return NextResponse.json({ error: 'Failed to seed relational data', details: error.message }, { status: 500 })
  }
}