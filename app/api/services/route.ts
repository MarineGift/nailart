import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDetails = searchParams.get('include_details') === 'true'
    
    console.log(`=== SERVICES API START ===`)
    console.log(`Include details: ${includeDetails}`)
    console.log(`Using Supabase JavaScript client`)
    
    if (includeDetails) {
      // Query services with service details
      const { data: services, error } = await supabase
        .from('services')
        .select(`
          *,
          service_detail (*)
        `)
        .order('category', { ascending: true })
        .order('item', { ascending: true })
      
      if (error) throw error
      
      // Transform data to match frontend expectations with service details
      const transformedServicesWithDetails = services.map(service => {
        // Get the price from service_detail (first detail or default)
        const firstDetail = service.service_detail && service.service_detail.length > 0 
          ? service.service_detail[0] 
          : null;
        
        // Use actual price from service_detail, convert to cents
        const priceInUSD = firstDetail?.price || 50; // Default to $50 if no price found
        const priceInCents = priceInUSD * 100;
        
        // Use actual duration from service_detail or default
        const durationMin = firstDetail?.duration_min || 60;
        
        return {
          id: service.id,
          name: service.item, // Map 'item' to 'name'
          description: service.item, // Use item as description for now
          category: service.category,
          base_price_cents: priceInCents, // Use actual price from service_detail
          duration_min: durationMin, // Use actual duration from service_detail
          is_active: true, // All loaded services are active
          created_at: service.created_at,
          updated_at: service.created_at,
          service_detail: service.service_detail || []
        };
      })
      
      console.log(`✅ Query successful, found ${services.length} services with details`)
      return NextResponse.json(transformedServicesWithDetails)
    } else {
      // Query all services
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('item', { ascending: true })
      
      if (error) throw error
      
      // Transform data to match frontend expectations  
      const transformedServices = services.map(service => {
        // For services without details, we need to fetch them separately
        // But for now, use default values
        return {
          id: service.id,
          name: service.item, // Map 'item' to 'name'
          description: service.item, // Use item as description for now
          category: service.category,
          base_price_cents: 5000, // Default price in cents ($50) - will be overridden when details are loaded
          duration_min: 60, // Default duration 60 minutes
          is_active: true, // All loaded services are active
          created_at: service.created_at,
          updated_at: service.created_at,
          service_detail: []
        };
      })
      
      console.log(`✅ Query successful, found ${services.length} services`)
      return NextResponse.json(transformedServices)
    }
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data: service, error } = await supabase
      .from('services')
      .insert([{
        category: body.category,
        item: body.item,
        duration_min: body.duration_min,
        base_price_cents: body.base_price_cents,
        is_active: body.is_active ?? true
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const { data: service, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }
    
    // Soft delete by setting is_active to false
    const { data: service, error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}