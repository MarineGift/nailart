import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const booking_id = searchParams.get('booking_id')
    const staff_id = searchParams.get('staff_id')
    const date = searchParams.get('date')

    let query = supabase
      .from('assignments')
      .select(`
        *,
        bookings!inner (
          id, customer_id, customer_phone, booking_start, booking_end, status,
          customers (id, first_name, last_name, phone_raw)
        ),
        staff (id, first_name, last_name, role)
      `)
      .order('assigned_at', { ascending: false })

    if (booking_id) {
      query = query.eq('booking_id', booking_id)
    }

    if (staff_id) {
      query = query.eq('staff_id', staff_id)
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query = query
        .gte('bookings.booking_start', startOfDay.toISOString())
        .lte('bookings.booking_start', endOfDay.toISOString())
    }

    const { data: assignments, error } = await query

    if (error) {
      console.error('Supabase assignments query failed:', error)
      // 테이블이 없으면 빈 배열 반환
      return NextResponse.json([])
    }

    return NextResponse.json(assignments || [])
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { booking_id, staff_id, reason } = body

    // 기존 배정이 있는지 확인
    const { data: existingAssignment } = await supabase
      .from('assignments')
      .select('*')
      .eq('booking_id', booking_id)
      .single()

    let assignment
    if (existingAssignment) {
      // 기존 배정 업데이트
      const { data: updatedAssignment, error: updateError } = await supabase
        .from('assignments')
        .update({
          staff_id,
          assigned_at: new Date().toISOString()
        })
        .eq('booking_id', booking_id)
        .select()
        .single()

      if (updateError) {
        console.error('Supabase assignment update failed:', updateError)
        return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
      }
      assignment = updatedAssignment
    } else {
      // 새 배정 생성
      const { data: newAssignment, error: insertError } = await supabase
        .from('assignments')
        .insert([{
          booking_id,
          staff_id,
          assigned_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Supabase assignment insert failed:', insertError)
        return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
      }
      assignment = newAssignment
    }

    // 히스토리에 기록
    await supabase
      .from('assignment_history')
      .insert([{
        booking_id,
        staff_id,
        assigned_at: new Date().toISOString(),
        reason: reason || (existingAssignment ? 'Assignment changed' : 'Initial assignment')
      }])

    return NextResponse.json(assignment, { status: existingAssignment ? 200 : 201 })
  } catch (error) {
    console.error('Error creating/updating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const booking_id = searchParams.get('booking_id')

    if (!booking_id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // 배정 삭제 전에 히스토리에 기록
    const { data: currentAssignment } = await supabase
      .from('assignments')
      .select('*')
      .eq('booking_id', booking_id)
      .single()

    if (currentAssignment) {
      await supabase
        .from('assignment_history')
        .insert([{
          booking_id: currentAssignment.booking_id,
          staff_id: currentAssignment.staff_id,
          assigned_at: new Date().toISOString(),
          reason: 'Assignment removed'
        }])
    }

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('booking_id', booking_id)

    if (error) {
      console.error('Supabase assignment delete failed:', error)
      return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}