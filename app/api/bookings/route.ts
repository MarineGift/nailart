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
      // Return all bookings if no date specified with services
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customers!bookings_customer_id_fkey(
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
            discount_amount,
            notes,
            services(
              id,
              name,
              description,
              category,
              base_price_cents,
              duration_min
            )
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

    // Get bookings for the specified date with customer and service information joined
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customers!bookings_customer_id_fkey(
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
          notes
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

    // Get all unique service IDs from all bookings
    const allServiceIds = new Set<number>()
    bookings?.forEach(booking => {
      booking.booking_details?.forEach((detail: any) => {
        if (detail.service_id) {
          allServiceIds.add(detail.service_id)
        }
      })
    })
    
    console.log('🎯 DEBUG: All service IDs collected:', Array.from(allServiceIds))
    console.log('🎯 DEBUG: Total bookings:', bookings?.length)
    console.log('🎯 DEBUG: First booking booking_details:', bookings?.[0]?.booking_details)

    // Get all services for lookup instead of filtering by used ones
    const { data: allServices, error: allServicesError } = await supabase
      .from('services')
      .select('id, item')
    
    console.log('🔍 All services query result:', { 
      allServices, 
      allServicesError,
      serviceCount: allServices?.length 
    })
    
    // Create services lookup map
    const servicesLookup: Record<number, string> = {}
    if (!allServicesError && allServices) {
      allServices.forEach(service => {
        console.log(`📝 Mapping service ${service.id} -> ${service.item}`)
        servicesLookup[service.id] = service.item
      })
      console.log('✅ Final services lookup:', servicesLookup)
    } else {
      console.error('❌ Error fetching all services for lookup:', allServicesError)
    }

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
      
      // Calculate total amount from booking_details
      const totalAmount = booking.booking_details?.reduce((total: number, detail: any) => {
        return total + (detail.price_cents * detail.quantity)
      }, 0) || 0
      
      // Get actual service names using the joined data or fallback lookup
      let serviceNames = 'No services'
      if (booking.booking_details && booking.booking_details.length > 0) {
        const serviceLabels = booking.booking_details
          .map((detail: any) => {
            // First try to get from joined services data
            if (detail.services && detail.services.name) {
              return detail.services.name
            }
            // Fallback to lookup table
            return servicesLookup[detail.service_id] || `Service ${detail.service_id}`
          })
          .filter(Boolean)
        serviceNames = serviceLabels.length > 0 ? serviceLabels.join(', ') : 'No services'
      }
      
      console.log(`🔍 Detailed booking mapping for ${booking.id}:`)
      console.log(`  - time_slot: ${timeSlot}`)
      console.log(`  - customer_name: ${customerName}`)
      console.log(`  - phone: ${customerPhone}`)
      console.log(`  - booking_details:`, booking.booking_details)
      console.log(`  - service_names: ${serviceNames}`)
      console.log(`  - services_lookup available:`, Object.keys(servicesLookup).length > 0)
      
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
        customer_name: customerName || booking.customers?.last_name || booking.customers?.first_name || 'Unknown',
        customer_phone: customerPhone,
        staff_id: staffId,
        total_amount: totalAmount,
        service_names: serviceNames,
        services_count: booking.booking_details?.length || 0
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
    console.log('🚀 === BOOKING POST API CALLED ===')
    console.log('📝 Creating booking with data:', body)
    console.log('🎯 Raw service_ids from body:', body.service_ids)
    
    // Extract customer information from the request
    const customerName = body.customer_name || 'Unknown'
    const customerPhone = body.customer_phone || body.phone || ''
    
    console.log('👤 Looking for customer:', { customerName, customerPhone })
    
    let customerId = body.customer_id
    
    // If no customer_id provided, try to find or create customer
    if (!customerId && customerPhone) {
      // Normalize phone number for search - remove all non-digits and format consistently
      const cleanPhone = customerPhone.replace(/\D/g, '')
      console.log('🔍 Searching for customer with phone:', customerPhone, 'cleaned:', cleanPhone)
      
      // Try multiple phone formats to find existing customer
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('id, phone_raw, last_name')
        .or(`phone_raw.eq.${customerPhone},phone_raw.like.%${cleanPhone}%`)
        
      console.log('📞 Phone search results:', existingCustomers)
      
      let existingCustomer = null
      if (existingCustomers && existingCustomers.length > 0) {
        // Find exact match or best match
        existingCustomer = existingCustomers.find(c => 
          c.phone_raw === customerPhone || 
          c.phone_raw?.replace(/\D/g, '') === cleanPhone
        ) || existingCustomers[0] // Fallback to first result
      }
      
      if (existingCustomer) {
        customerId = existingCustomer.id
        console.log('✅ Found existing customer:', customerId)
      } else {
        // Create new customer
        console.log('👤 Creating new customer:', { customerName, customerPhone })
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{
            last_name: customerName,
            phone_raw: customerPhone,
            email: '',
            first_name: ''
          }])
          .select('id')
          .single()
        
        if (customerError) {
          console.error('❌ Error creating customer:', customerError)
          return NextResponse.json({ error: 'Failed to create customer', details: customerError }, { status: 500 })
        }
        
        customerId = newCustomer.id
        console.log('✅ Created new customer:', customerId)
      }
    }
    
    if (!customerId) {
      console.error('❌ No customer ID available')
      return NextResponse.json({ error: 'Customer information is required' }, { status: 400 })
    }
    
    // Prepare notes with staff assignment info (workaround for missing staff_id column)
    let bookingNotes = body.notes || ''
    if (body.staff_id) {
      const staffNote = `| Assigned Staff: ${body.staff_id}`
      bookingNotes = bookingNotes ? `${bookingNotes} ${staffNote}` : staffNote
    }

    // Insert into actual Supabase bookings table with correct structure
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        customer_id: customerId,
        booking_time: `${body.appointment_date || body.booking_date} ${body.appointment_time || body.booking_time}:00`,
        status: 'scheduled',
        source: body.source || 'Homepage',
        notes: bookingNotes,
        duration_minutes: body.duration_minutes || 60,
        // Temporarily remove staff_id until database schema is fixed
        // staff_id: body.staff_id || null,
      }])
      .select('*')
      .single()

    if (error) {
      console.error('Error creating booking in Supabase:', error)
      return NextResponse.json({ error: 'Failed to create booking', details: error }, { status: 500 })
    }

    console.log('✅ Booking created successfully in Supabase:', booking)

    // Create booking_details for each selected service
    console.log('🔍 Checking service_ids:', { 
      service_ids: body.service_ids, 
      type: typeof body.service_ids, 
      isArray: Array.isArray(body.service_ids),
      length: body.service_ids?.length 
    })
    if (body.service_ids && Array.isArray(body.service_ids) && body.service_ids.length > 0) {
      console.log('📋 Creating booking details for services:', body.service_ids)
      console.log('Service IDs type:', typeof body.service_ids[0], body.service_ids)
      
      // Get service information to set prices
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          item,
          service_detail (
            price
          )
        `)
        .in('id', body.service_ids)

      console.log('Services query result:', { services, servicesError })

      if (servicesError) {
        console.error('❌ Error fetching services for booking_details:', servicesError)
        // Continue without failing booking creation
      } else {
        // Create booking_details records
        const bookingDetailsToInsert = body.service_ids.map((serviceId: string) => {
          const service = services?.find((s: any) => s.id.toString() === serviceId.toString())
          const firstDetail = service?.service_detail && service.service_detail.length > 0 
            ? service.service_detail[0] 
            : null;
          const priceInUSD = firstDetail?.price || 50; // Default to $50 if no price found
          const priceInCents = priceInUSD * 100;
          
          return {
            booking_id: booking.id,
            service_id: parseInt(serviceId),
            quantity: 1,
            price_cents: priceInCents,
            notes: `Service selected during booking`
          }
        })

        console.log('📝 Inserting booking details:', bookingDetailsToInsert)

        const { data: bookingDetails, error: detailsError } = await supabase
          .from('booking_details')
          .insert(bookingDetailsToInsert)
          .select('*')

        if (detailsError) {
          console.error('❌ Error creating booking details:', detailsError)
          console.error('❌ Failed booking details data:', bookingDetailsToInsert)
          // Don't fail the booking creation even if details fail
        } else {
          console.log('✅ Booking details created successfully:', bookingDetails)
          console.log('✅ Booking details count:', bookingDetails?.length)
        }
      }
    }
    
    // Send notifications with service information
    try {
      // Fetch the complete booking with services for email
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
        .eq('id', booking.id)
        .single()

      const bookingForNotification = completeBooking || booking
      await sendNewBookingEmailToAdmin(bookingForNotification)
      await sendNewBookingSMSToAdmin(bookingForNotification)
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