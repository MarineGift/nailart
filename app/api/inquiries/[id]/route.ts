import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const updateData: any = {}
    
    // Update allowed fields
    if (body.status) updateData.status = body.status
    if (body.priority) updateData.priority = body.priority
    if (body.assignedStaffId) updateData.assigned_staff_id = body.assignedStaffId
    if (body.responseMessage) {
      updateData.response_message = body.responseMessage
      updateData.responded_at = new Date().toISOString()
      updateData.responded_by = body.respondedBy || null
    }
    if (body.isRead !== undefined) updateData.is_read = body.isRead
    
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('customer_inquiries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update inquiry:', error)
      return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
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
        assignedStaffId: data.assigned_staff_id,
        responseMessage: data.response_message,
        respondedAt: data.responded_at,
        respondedBy: data.responded_by,
        isRead: data.is_read,
        updatedAt: data.updated_at
      }
    })
  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
}