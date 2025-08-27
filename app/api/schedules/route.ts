import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const staffId = searchParams.get('staffId')

    let query = supabase
      .from('staff_work_schedule')
      .select(`
        *,
        staff(first_name, last_name, position)
      `)

    if (start && end) {
      query = query.gte('work_date', start)
                   .lte('work_date', end)
    }

    if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    const { data: schedules, error } = await query.order('work_date')

    if (error) {
      console.error('Supabase schedules query failed:', error)
      return NextResponse.json([])
    }

    const result = (schedules || []).map(schedule => ({
      id: schedule.id,
      staffId: schedule.staff_id,
      date: schedule.work_date,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      isWorking: schedule.is_working,
      notes: schedule.notes,
      first_name: schedule.staff?.first_name,
      last_name: schedule.staff?.last_name,
      position: schedule.staff?.position
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json([])
  }
}