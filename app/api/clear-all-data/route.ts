import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE() {
  try {
    // Delete in correct order to avoid foreign key constraints
    await supabase.from('booking_details').delete().neq('id', 0)
    await supabase.from('treatments').delete().neq('id', 0)
    await supabase.from('payments').delete().neq('id', 0)
    await supabase.from('bookings').delete().neq('id', '')
    await supabase.from('customers').delete().neq('id', '')
    
    return NextResponse.json({ message: 'All data cleared successfully' })
  } catch (error) {
    console.error('Error clearing data:', error)
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 })
  }
}