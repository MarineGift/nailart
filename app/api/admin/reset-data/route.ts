import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting data reset process...')

    // 1. 기존 데이터 삭제
    console.log('🗑️ Deleting existing data...')
    
    // 관련 테이블 순서대로 삭제
    await supabase.from('booking_details').delete().neq('id', 0)
    await supabase.from('bookings').delete().neq('id', '')
    await supabase.from('customers').delete().neq('id', '')
    
    console.log('✅ Existing data deleted')

    // 2. 토,일 스케줄 삭제
    console.log('🗓️ Removing weekend schedules...')
    const { data: weekendSchedules } = await supabase
      .from('staff_schedules')
      .select('*')
      .in('day_of_week', ['saturday', 'sunday'])
    
    if (weekendSchedules && weekendSchedules.length > 0) {
      await supabase
        .from('staff_schedules')
        .delete()
        .in('day_of_week', ['saturday', 'sunday'])
    }
    
    console.log('✅ Weekend schedules removed')

    return NextResponse.json({ 
      success: true, 
      message: 'Data reset completed successfully' 
    })

  } catch (error) {
    console.error('❌ Data reset error:', error)
    return NextResponse.json({ 
      error: 'Data reset failed', 
      details: error 
    }, { status: 500 })
  }
}