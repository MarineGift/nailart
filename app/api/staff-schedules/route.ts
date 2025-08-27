import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    console.log('=== STAFF SCHEDULES GET API START ===');
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');

    let query = supabase
      .from('staff_schedules')
      .select(`
        *,
        staff:staff_id (
          id,
          first_name,
          last_name,
          position,
          role
        )
      `);

    if (date) {
      query = query.eq('work_date', date);
    }

    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    const { data: schedules, error } = await query.order('work_date', { ascending: true });

    if (error) {
      console.error('Error fetching schedules:', error);
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }

    console.log(`✅ Found ${schedules?.length || 0} schedules`);

    return NextResponse.json({
      success: true,
      schedules: schedules || []
    });

  } catch (error) {
    console.error('Staff schedules error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}