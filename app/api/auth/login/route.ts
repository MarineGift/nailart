import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { staffId } = await request.json()

    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 })
    }

    // Find employee by staff ID (using existing staff table)
    const { data: employee, error } = await supabase
      .from('staff')
      .select('id, first_name, last_name, email, role, position, status')
      .eq('id', staffId)
      .single()

    if (error || !employee) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    // Skip login recording for now - login_info table may not exist
    // TODO: Add login tracking later if needed

    const user = {
      id: employee.id,
      firstName: employee.first_name,
      lastName: employee.last_name,
      email: employee.email || '',
      role: employee.role || 'staff',
      position: employee.position || 'Staff',
      status: employee.status || 'active'
    }
    
    // Return user data
    return NextResponse.json(user)

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}