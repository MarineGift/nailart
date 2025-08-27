import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    
    let query = supabase
      .from('customer_inquiries')
      .select(`
        id, 
        customer_name, 
        customer_phone, 
        customer_email, 
        inquiry_type, 
        subject, 
        message, 
        status, 
        priority, 
        assigned_staff_id, 
        response_message, 
        responded_at, 
        responded_by, 
        is_read, 
        created_at, 
        updated_at
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    const { data: inquiries, error } = await query

    if (error) {
      console.error('Database query failed:', error)
      return NextResponse.json([])
    }

    // Get staff information for assigned staff
    const staffIds = [...new Set(inquiries?.map(i => i.assigned_staff_id).filter(Boolean) || [])]
    const { data: staff } = staffIds.length > 0 
      ? await supabase
          .from('staff')
          .select('id, first_name, last_name')
          .in('id', staffIds)
      : { data: [] }

    // Map result with staff information
    const result = (inquiries || []).map(inquiry => {
      const assignedStaff = (staff || []).find(s => s.id === inquiry.assigned_staff_id)
      
      return {
        id: inquiry.id,
        customerName: inquiry.customer_name,
        customerPhone: inquiry.customer_phone,
        customerEmail: inquiry.customer_email,
        inquiryType: inquiry.inquiry_type,
        subject: inquiry.subject,
        message: inquiry.message,
        status: inquiry.status,
        priority: inquiry.priority,
        assignedStaffId: inquiry.assigned_staff_id,
        assignedStaffName: assignedStaff ? `${assignedStaff.first_name} ${assignedStaff.last_name}` : null,
        responseMessage: inquiry.response_message,
        respondedAt: inquiry.responded_at,
        respondedBy: inquiry.responded_by,
        isRead: inquiry.is_read,
        createdAt: inquiry.created_at,
        updatedAt: inquiry.updated_at
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.customerName || !body.customerPhone || !body.subject || !body.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const inquiryData = {
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      customer_email: body.customerEmail || null,
      inquiry_type: body.inquiryType || 'general',
      subject: body.subject,
      message: body.message,
      priority: body.priority || 'normal',
      status: 'new'
    }

    const { data, error } = await supabase
      .from('customer_inquiries')
      .insert([inquiryData])
      .select()
      .single()

    if (error) {
      console.error('Failed to create inquiry:', error)
      return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      inquiry: {
        id: data.id,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        customerEmail: data.customer_email,
        inquiryType: data.inquiry_type,
        subject: data.subject,
        message: data.message,
        status: data.status,
        priority: data.priority,
        createdAt: data.created_at
      }
    })
  } catch (error) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 })
  }
}