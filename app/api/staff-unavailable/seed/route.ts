import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 샘플 근무 불가 일정 데이터
const sampleUnavailableSchedules = [
  {
    staff_id: null, // null = 전체 살롱 휴일
    start_date: '2025-09-10',
    end_date: '2025-09-13',
    start_time: '00:00',
    end_time: '24:00',
    reason: 'Salon Holiday',
    notes: '추석 연휴 - 살롱 전체 휴무',
    created_by: 'admin'
  },
  {
    staff_id: null, // 전체 직원 적용
    start_date: '2025-09-20',
    end_date: '2025-09-20',
    start_time: '14:00',
    end_time: '19:00',
    reason: 'Shortened Hours',
    notes: '9월 20일 단축 근무 (14:00-19:00만 근무)',
    created_by: 'admin'
  },
  {
    staff_id: null, // 전체 살롱 적용
    start_date: '2025-12-25',
    end_date: '2025-12-25',
    start_time: '00:00',
    end_time: '24:00',
    reason: 'Holiday',
    notes: '크리스마스 휴무',
    created_by: 'admin'
  },
  {
    staff_id: null, // 전체 살롱 적용  
    start_date: '2025-01-01',
    end_date: '2025-01-01',
    start_time: '00:00',
    end_time: '24:00',
    reason: 'Holiday',
    notes: '신정 휴무',
    created_by: 'admin'
  }
];

export async function POST(request: Request) {
  try {
    console.log('=== SEED STAFF UNAVAILABLE SCHEDULES ===');

    // 기존 근무 불가 일정 삭제
    const { error: deleteError } = await supabase
      .from('staff_unavailable_schedule')
      .delete()
      .neq('id', 0); // Delete all

    if (deleteError) {
      console.error('Error deleting existing unavailable schedules:', deleteError);
    }

    // 새 근무 불가 일정 삽입
    const { data: createdSchedules, error: insertError } = await supabase
      .from('staff_unavailable_schedule')
      .insert(sampleUnavailableSchedules)
      .select();

    if (insertError) {
      console.error('Error creating unavailable schedules:', insertError);
      return NextResponse.json({ error: 'Failed to seed unavailable schedules' }, { status: 500 });
    }

    console.log(`✅ Seeded ${createdSchedules?.length || 0} unavailable schedules`);

    return NextResponse.json({
      success: true,
      message: `Seeded ${createdSchedules?.length || 0} unavailable schedules`,
      schedules: createdSchedules
    });

  } catch (error) {
    console.error('Seed unavailable schedules error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
