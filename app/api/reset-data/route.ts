import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    console.log('Starting data cleanup...')
    
    // Delete in order (child tables first to avoid foreign key constraints)
    const tables = [
      'booking_details',
      'treatment_details', 
      'treatments',
      'bookings',
      'customers'
    ]
    
    for (const table of tables) {
      console.log(`Deleting data from ${table}...`)
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', 'impossible-id') // Delete all records
      
      if (error) {
        console.log(`Warning: Could not delete from ${table}:`, error.message)
      } else {
        console.log(`Successfully cleaned ${table}`)
      }
    }
    
    return NextResponse.json({ 
      message: 'Data cleanup completed',
      cleaned_tables: tables
    })
  } catch (error) {
    console.error('Error during data cleanup:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup data' },
      { status: 500 }
    )
  }
}