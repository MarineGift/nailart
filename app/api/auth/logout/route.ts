import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { staffId } = await request.json()

    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 })
    }

    // Update the latest login record with logout time
    const { error } = await supabase
      .from('login_info')
      .update({ logout_time: new Date().toISOString() })
      .eq('login_id', staffId)
      .is('logout_time', null)
      .order('login_time', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Failed to record logout:', error)
      return NextResponse.json({ error: 'Failed to record logout' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}