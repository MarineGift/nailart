import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 직원 스킬 테이블 생성 및 관리
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const staffId = url.searchParams.get('staffId')

    // 특정 직원의 스킬 조회
    if (staffId) {
      const { data: skills, error } = await supabase
        .from('staff_skills')
        .select(`
          id,
          staff_id,
          service_id,
          skill_level,
          is_primary,
          created_at,
          services!inner(
            id,
            name,
            category,
            code
          ),
          staff!inner(
            id,
            first_name,
            last_name
          )
        `)
        .eq('staff_id', staffId)
        .order('is_primary', { ascending: false })

      if (error) {
        console.error('Database query failed:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(skills || [])
    }

    // 모든 직원 스킬 조회 (대시보드용)
    const { data: allSkills, error } = await supabase
      .from('staff_skills')
      .select(`
        id,
        staff_id,
        service_id,
        skill_level,
        is_primary,
        services!inner(
          id,
          name,
          category,
          code
        ),
        staff!inner(
          id,
          first_name,
          last_name
        )
      `)
      .order('is_primary', { ascending: false })

    if (error) {
      console.error('Database query failed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 직원별로 그룹핑
    const staffSkills = (allSkills || []).reduce((acc: any, skill: any) => {
      const staffId = skill.staff_id
      if (!acc[staffId]) {
        acc[staffId] = {
          staffId: staffId,
          staffName: `${skill.staff.first_name} ${skill.staff.last_name}`,
          skills: []
        }
      }
      acc[staffId].skills.push({
        id: skill.id,
        serviceId: skill.service_id,
        serviceName: skill.services.name,
        serviceCategory: skill.services.category,
        skillLevel: skill.skill_level,
        isPrimary: skill.is_primary
      })
      return acc
    }, {})

    return NextResponse.json(Object.values(staffSkills))
  } catch (error) {
    console.error('Error fetching staff skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { staffId, serviceId, skillLevel, isPrimary } = body

    if (!staffId || !serviceId) {
      return NextResponse.json({ error: 'Staff ID and Service ID are required' }, { status: 400 })
    }

    // 스킬 추가
    const { data, error } = await supabase
      .from('staff_skills')
      .insert({
        id: crypto.randomUUID(),
        staff_id: staffId,
        service_id: serviceId,
        skill_level: skillLevel || 'intermediate',
        is_primary: isPrimary || false,
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        staff_id,
        service_id,
        skill_level,
        is_primary,
        services!inner(name, category),
        staff!inner(first_name, last_name)
      `)
      .single()

    if (error) {
      console.error('Database insert failed:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating staff skill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const skillId = url.searchParams.get('id')

    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('staff_skills')
      .delete()
      .eq('id', skillId)

    if (error) {
      console.error('Database delete failed:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting staff skill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 초기 데이터 설정 함수 (개발용)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'init_staff_skills') {
      // 기존 staff와 services 조회
      const { data: staff } = await supabase
        .from('staff')
        .select('id, first_name, last_name')
        .limit(6)

      const { data: services } = await supabase
        .from('services')
        .select('id, name, category')
        .limit(10)

      if (!staff || !services) {
        return NextResponse.json({ error: 'Failed to fetch staff or services' }, { status: 400 })
      }

      // 샘플 스킬 데이터 생성
      const skillsData = [
        // Connie Lee (Admin) - 모든 서비스 가능
        { staff_id: staff[0]?.id, service_id: services[0]?.id, skill_level: 'expert', is_primary: true },
        { staff_id: staff[0]?.id, service_id: services[1]?.id, skill_level: 'expert', is_primary: false },
        { staff_id: staff[0]?.id, service_id: services[2]?.id, skill_level: 'advanced', is_primary: false },

        // Sarah Kim (Manager) - 고급 서비스 전문
        { staff_id: staff[1]?.id, service_id: services[0]?.id, skill_level: 'expert', is_primary: true },
        { staff_id: staff[1]?.id, service_id: services[3]?.id, skill_level: 'expert', is_primary: false },
        { staff_id: staff[1]?.id, service_id: services[4]?.id, skill_level: 'advanced', is_primary: false },

        // Michelle Park (Manager) - 디자인 전문
        { staff_id: staff[2]?.id, service_id: services[2]?.id, skill_level: 'expert', is_primary: true },
        { staff_id: staff[2]?.id, service_id: services[5]?.id, skill_level: 'expert', is_primary: false },
        { staff_id: staff[2]?.id, service_id: services[1]?.id, skill_level: 'advanced', is_primary: false },

        // Jessica Wang (Staff) - 기본 서비스
        { staff_id: staff[3]?.id, service_id: services[1]?.id, skill_level: 'advanced', is_primary: true },
        { staff_id: staff[3]?.id, service_id: services[6]?.id, skill_level: 'intermediate', is_primary: false },

        // Amy Chen (Staff) - 젤 전문
        { staff_id: staff[4]?.id, service_id: services[2]?.id, skill_level: 'advanced', is_primary: true },
        { staff_id: staff[4]?.id, service_id: services[7]?.id, skill_level: 'intermediate', is_primary: false },

        // Sophia Williams (Staff) - 네일아트 전문
        { staff_id: staff[5]?.id, service_id: services[4]?.id, skill_level: 'advanced', is_primary: true },
        { staff_id: staff[5]?.id, service_id: services[8]?.id, skill_level: 'intermediate', is_primary: false }
      ].filter(skill => skill.staff_id && skill.service_id)
        .map(skill => ({
          ...skill,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        }))

      const { error } = await supabase
        .from('staff_skills')
        .insert(skillsData)

      if (error) {
        console.error('Failed to initialize staff skills:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `Initialized ${skillsData.length} staff skills` 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in PUT request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}