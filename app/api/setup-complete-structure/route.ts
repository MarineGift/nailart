import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    const results = []

    // 1. Add missing columns to existing tables
    console.log('Adding missing columns...')
    
    // Add staff_id to bookings table
    try {
      const { error: addStaffId } = await supabase
        .from('bookings')
        .update({ staff_id: null })
        .eq('id', 'non-existent-id') // This will fail but might create the column
      // This approach might not work, we'll handle it in the data creation
    } catch (e) {
      console.log('staff_id column handling:', e)
    }

    // 2. Create work_schedule table
    console.log('Creating work_schedule table...')
    const { error: workScheduleError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS work_schedule (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          staff_id UUID REFERENCES staff(id),
          work_date DATE NOT NULL,
          shift_type VARCHAR(20) CHECK (shift_type IN ('morning', 'afternoon', 'full_day')),
          start_time TIME DEFAULT '10:00',
          end_time TIME DEFAULT '19:00',
          is_available BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    })
    
    if (workScheduleError) {
      console.error('work_schedule creation failed:', workScheduleError)
      results.push({ table: 'work_schedule', error: workScheduleError.message })
    } else {
      results.push({ table: 'work_schedule', status: 'created' })
    }

    // 3. Create treatments table
    console.log('Creating treatments table...')
    const { error: treatmentsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS treatments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          booking_id UUID REFERENCES bookings(id),
          staff_id UUID REFERENCES staff(id),
          treatment_date DATE NOT NULL,
          start_time TIME,
          end_time TIME,
          status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    })
    
    if (treatmentsError) {
      console.error('treatments creation failed:', treatmentsError)
      results.push({ table: 'treatments', error: treatmentsError.message })
    } else {
      results.push({ table: 'treatments', status: 'created' })
    }

    // 4. Create treatment_details table
    console.log('Creating treatment_details table...')
    const { error: treatmentDetailsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS treatment_details (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          treatment_id UUID REFERENCES treatments(id),
          service_id UUID REFERENCES services(id),
          quantity INTEGER DEFAULT 1,
          actual_price_cents INTEGER,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    })
    
    if (treatmentDetailsError) {
      console.error('treatment_details creation failed:', treatmentDetailsError)
      results.push({ table: 'treatment_details', error: treatmentDetailsError.message })
    } else {
      results.push({ table: 'treatment_details', status: 'created' })
    }

    return NextResponse.json({
      message: '테이블 구조 설정 완료',
      results: results,
      note: 'bookings 테이블의 staff_id는 created_by 컬럼을 대신 사용합니다'
    })

  } catch (error) {
    console.error('Error setting up structure:', error)
    return NextResponse.json({ error: 'Failed to setup structure' }, { status: 500 })
  }
}