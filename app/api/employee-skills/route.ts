import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employee_id')

    if (employeeId) {
      // Get skills for specific employee
      const { data: employeeSkills, error } = await supabase
        .from('employee_skills')
        .select(`
          *,
          skills (
            id,
            name,
            description,
            skill_level,
            skill_categories (
              name
            )
          )
        `)
        .eq('employee_id', employeeId)

      if (error) {
        console.error('Database query failed:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(employeeSkills)
    } else {
      // Get all employee skills with employee info
      const { data: allEmployeeSkills, error } = await supabase
        .from('employee_skills')
        .select(`
          *,
          employees (
            id,
            first_name,
            last_name,
            email
          ),
          skills (
            id,
            name,
            description,
            skill_level,
            skill_categories (
              name
            )
          )
        `)

      if (error) {
        console.error('Database query failed:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(allEmployeeSkills)
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employee_id, skill_id, proficiency_level, certification_date, notes } = body

    const { data, error } = await supabase
      .from('employee_skills')
      .insert({
        employee_id,
        skill_id,
        proficiency_level,
        certification_date,
        notes
      })
      .select()

    if (error) {
      console.error('Database insert failed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}