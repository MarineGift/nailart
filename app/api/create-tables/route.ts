import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('=== CREATE TABLES API START ===');

    // Using direct SQL through fetch to create tables
    const galleryResponse = await fetch('https://hkqudtzlgzohxhevvcem.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: `
          CREATE TABLE IF NOT EXISTS gallery_images (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            image_url TEXT NOT NULL,
            gradient_color VARCHAR(20) DEFAULT '#8B5CF6',
            sort_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_by VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    });

    const scheduleResponse = await fetch('https://hkqudtzlgzohxhevvcem.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: `
          CREATE TABLE IF NOT EXISTS staff_unavailable_schedule (
            id SERIAL PRIMARY KEY,
            staff_id VARCHAR(255),
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            start_time TIME,
            end_time TIME,
            reason VARCHAR(255) NOT NULL,
            notes TEXT,
            created_by VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    });

    const galleryResult = galleryResponse.ok ? await galleryResponse.json() : null;
    const scheduleResult = scheduleResponse.ok ? await scheduleResponse.json() : null;

    console.log('Gallery table creation result:', galleryResult);
    console.log('Schedule table creation result:', scheduleResult);

    return NextResponse.json({
      success: true,
      message: 'Tables creation attempted',
      results: {
        gallery: galleryResult,
        schedule: scheduleResult
      }
    });

  } catch (error) {
    console.error('Create tables API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}