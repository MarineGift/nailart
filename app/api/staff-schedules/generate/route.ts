import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 근무 시간 패턴들 (평일만, 다양한 시간대)
const workPatterns = [
  { start: '10:00', end: '14:00' }, // 오전 근무
  { start: '14:00', end: '20:00' }, // 오후 근무
  { start: '10:00', end: '16:00' }, // 오전-오후
  { start: '12:00', end: '18:00' }, // 점심-저녁
  { start: '16:00', end: '20:00' }, // 저녁 근무
  { start: '10:00', end: '20:00' }, // 풀타임
];

// 평일 여부 확인 (월~금)
function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5; // 1=Monday, 5=Friday
}

// 날짜 문자열 변환 (YYYY-MM-DD)
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 랜덤 선택 함수
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function POST(request: Request) {
  try {
    console.log('=== GENERATE STAFF SCHEDULES ===');
    const { startDate, endDate } = await request.json();

    // 모든 스태프 조회
    const { data: staffList, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('status', 'active');

    if (staffError) {
      console.error('Error fetching staff:', staffError);
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }

    const schedules = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 각 날짜별로 스케줄 생성
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // 평일인지 확인
      if (!isWeekday(date)) {
        console.log(`Skipping weekend/holiday: ${formatDate(date)}`);
        continue;
      }

      const dateStr = formatDate(date);
      
      // 하루에 4-5명의 스태프를 랜덤으로 선택
      const workingStaffCount = Math.floor(Math.random() * 2) + 4; // 4 or 5
      const workingStaff = getRandomItems(staffList || [], workingStaffCount);

      console.log(`${dateStr}: ${workingStaffCount} staff working`);

      // 각 스태프에게 랜덤 근무시간 할당
      for (const staff of workingStaff) {
        const workPattern = workPatterns[Math.floor(Math.random() * workPatterns.length)];
        
        const schedule = {
          staff_id: staff.id,
          work_date: dateStr,
          start_time: workPattern.start,
          end_time: workPattern.end,
          is_available: true,
          notes: `Auto-generated schedule (${workPattern.start}-${workPattern.end})`
        };

        schedules.push(schedule);
        console.log(`  ${staff.first_name} ${staff.last_name}: ${workPattern.start}-${workPattern.end}`);
      }
    }

    // 기존 스케줄 삭제 (해당 기간)
    const { error: deleteError } = await supabase
      .from('staff_schedules')
      .delete()
      .gte('work_date', formatDate(start))
      .lte('work_date', formatDate(end));

    if (deleteError) {
      console.error('Error deleting existing schedules:', deleteError);
    }

    // 새 스케줄 삽입
    const { data: createdSchedules, error: insertError } = await supabase
      .from('staff_schedules')
      .insert(schedules)
      .select();

    if (insertError) {
      console.error('Error creating schedules:', insertError);
      return NextResponse.json({ error: 'Failed to create schedules' }, { status: 500 });
    }

    console.log(`Generated ${schedules.length} schedules for ${schedules.length / workingStaffCount} weekdays`);

    return NextResponse.json({
      success: true,
      message: `Generated ${schedules.length} staff schedules`,
      schedules: createdSchedules,
      summary: {
        totalSchedules: schedules.length,
        dateRange: `${formatDate(start)} to ${formatDate(end)}`,
        avgStaffPerDay: workingStaffCount
      }
    });

  } catch (error) {
    console.error('Generate schedules error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}