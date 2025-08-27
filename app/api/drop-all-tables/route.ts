import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE() {
  try {
    // Drop all tables in reverse dependency order to avoid foreign key constraints
    const tables = [
      'treatment_details',
      'staff_work_summary', 
      'booking_history',
      'staff_schedules',
      'treatments',
      'payments',
      'booking_details',
      'bookings',
      'staff_work_schedule',
      'staff',
      'services',
      'customers',
      'users',
      'sessions'
    ]
    
    for (const table of tables) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP TABLE IF EXISTS "${table}" CASCADE;`
      })
      if (error) {
        console.log(`Table ${table} may not exist or already dropped:`, error.message)
      }
    }
    
    return NextResponse.json({ 
      message: 'All tables dropped successfully',
      droppedTables: tables.length
    })
  } catch (error) {
    console.error('Error dropping tables:', error)
    return NextResponse.json({ error: 'Failed to drop tables' }, { status: 500 })
  }
}