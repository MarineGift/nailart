import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8';

const supabase = createClient(supabaseUrl, supabaseKey);

// GET - 근무 불가 일정 조회
export async function GET(request: Request) {
  try {
    console.log('=== STAFF UNAVAILABLE SCHEDULE GET API START ===');
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('staff_unavailable_schedule')
      .select(`
        *,
        staff:staff_id (
          id,
          first_name,
          last_name,
          position
        )
      `);

    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    if (startDate) {
      query = query.gte('end_date', startDate);
    }

    if (endDate) {
      query = query.lte('start_date', endDate);
    }

    const { data: schedules, error } = await query.order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching unavailable schedules:', error);
      return NextResponse.json({ error: 'Failed to fetch unavailable schedules' }, { status: 500 });
    }

    console.log(`✅ Found ${schedules?.length || 0} unavailable schedules`);

    return NextResponse.json({
      success: true,
      schedules: schedules || []
    });

  } catch (error) {
    console.error('Staff unavailable schedule API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - 근무 불가 일정 추가
export async function POST(request: Request) {
  try {
    console.log('=== STAFF UNAVAILABLE SCHEDULE POST API START ===');
    const { 
      staffId, 
      startDate, 
      endDate, 
      startTime, 
      endTime, 
      reason, 
      notes, 
      createdBy 
    } = await request.json();

    const { data: newSchedule, error } = await supabase
      .from('staff_unavailable_schedule')
      .insert({
        staff_id: staffId, // null for salon-wide holidays
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        reason: reason,
        notes: notes,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating unavailable schedule:', error);
      return NextResponse.json({ error: 'Failed to create unavailable schedule' }, { status: 500 });
    }

    console.log('✅ Unavailable schedule created:', `${startDate} to ${endDate}`);

    return NextResponse.json({
      success: true,
      schedule: newSchedule
    });

  } catch (error) {
    console.error('Staff unavailable schedule POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - 근무 불가 일정 삭제
export async function DELETE(request: Request) {
  try {
    console.log('=== STAFF UNAVAILABLE SCHEDULE DELETE API START ===');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('staff_unavailable_schedule')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting unavailable schedule:', error);
      return NextResponse.json({ error: 'Failed to delete unavailable schedule' }, { status: 500 });
    }

    console.log('✅ Unavailable schedule deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Unavailable schedule deleted successfully'
    });

  } catch (error) {
    console.error('Staff unavailable schedule DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
