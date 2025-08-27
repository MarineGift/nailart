import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check existing tables and their structures
    const results = {}
    
    // Check each table structure
    const tables = ['customers', 'staff', 'services', 'bookings', 'booking_details']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          results[table] = { error: error.message }
        } else {
          results[table] = { 
            exists: true,
            sample_columns: data && data.length > 0 ? Object.keys(data[0]) : [],
            count: data?.length || 0
          }
        }
      } catch (err) {
        results[table] = { error: 'Table does not exist or access denied' }
      }
    }

    return NextResponse.json({
      message: '테이블 구조 확인 결과',
      tables: results
    })
  } catch (error) {
    console.error('Error checking structure:', error)
    return NextResponse.json({ error: 'Failed to check structure' }, { status: 500 })
  }
}