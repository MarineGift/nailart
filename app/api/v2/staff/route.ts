import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const active = searchParams.get('active')
    const date = searchParams.get('date')

    let query = supabase
      .from('staff')
      .select('*')
      .order('first_name', { ascending: true })

    if (role) {
      query = query.eq('role', role)
    }

    if (active === 'true') {
      query = query.eq('is_active', true)
    }

    const { data: staff, error } = await query

    if (error) {
      console.error('Supabase staff query failed:', error)
      // 테이블이 없으면 빈 배열 반환
      return NextResponse.json([])
    }

    // 특정 날짜에 대한 스케줄 정보도 포함
    if (date && staff) {
      const staffWithSchedules = await Promise.all(
        staff.map(async (member) => {
          const { data: schedule } = await supabase
            .from('staff_schedules')
            .select('*')
            .eq('staff_id', member.id)
            .eq('work_date', date)
            .single()

          return {
            ...member,
            schedule: schedule || null,
            working: schedule && !schedule.is_holiday
          }
        })
      )
      return NextResponse.json(staffWithSchedules)
    }

    return NextResponse.json(staff || [])
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, role, first_name, last_name, phone, email } = body

    const { data: staff, error } = await supabase
      .from('staff')
      .insert([{
        user_id,
        role,
        first_name,
        last_name,
        phone,
        email,
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase staff insert failed:', error)
      return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
    }

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}