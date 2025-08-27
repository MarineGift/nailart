// Customer management API
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phoneNumber = searchParams.get('phone')

    console.log(`=== CUSTOMERS API START ===`)
    console.log(`Phone filter: ${phoneNumber}`)
    
    // Query actual Supabase customers table
    let query = supabase
      .from('customers')
      .select('*')

    if (phoneNumber) {
      // Format phone number for multiple search patterns
      const cleanPhone = phoneNumber.replace(/\D/g, '') // Extract digits only
      const formattedPhone = cleanPhone.length === 10 ? 
        `(${cleanPhone.slice(0,3)}) ${cleanPhone.slice(3,6)}-${cleanPhone.slice(6)}` : 
        phoneNumber
      
      console.log(`🔍 Searching phone: original="${phoneNumber}", clean="${cleanPhone}", formatted="${formattedPhone}"`)
      
      // Search using multiple approaches - first try exact matches, then partial
      const { data: exactMatch, error: exactError } = await supabase
        .from('customers')
        .select('*')
        .in('phone_raw', [phoneNumber, cleanPhone, formattedPhone])
        .order('created_at', { ascending: false })
      
      if (exactError) {
        console.error('Exact match error:', exactError)
      } else if (exactMatch && exactMatch.length > 0) {
        console.log(`✅ Found ${exactMatch.length} customers from Supabase (exact match)`)
        return NextResponse.json(exactMatch)
      }
      
      // If no exact match, try partial match
      const { data: partialMatch, error: partialError } = await supabase
        .from('customers')
        .select('*')
        .ilike('phone_raw', `%${cleanPhone}%`)
        .order('created_at', { ascending: false })
        
      if (partialError) {
        console.error('Partial match error:', partialError)
        return NextResponse.json([])
      } else {
        console.log(`✅ Found ${partialMatch?.length || 0} customers from Supabase (partial match)`)
        return NextResponse.json(partialMatch || [])
      }
    }

    const { data: customers, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase customers query failed:', error)
      return NextResponse.json([])
    }

    console.log(`✅ Found ${customers?.length || 0} customers from Supabase`)
    return NextResponse.json(customers || [])
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Insert into actual Supabase customers table - try different column names
    const { data: customer, error } = await supabase
      .from('customers')
      .insert([{
        first_name: body.first_name || '',
        last_name: body.last_name || '',
        email: body.email || '',
        phone_raw: body.phone_number || body.phone || '',
        notes: body.notes || ''
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating customer in Supabase:', error)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    console.log('✅ Customer created successfully in Supabase:', customer)
    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}