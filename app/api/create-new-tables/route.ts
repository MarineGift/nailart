import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    console.log('=== CREATING NEW TABLES ===');

    // Gallery Images Table
    const galleryTableSQL = `
      CREATE TABLE IF NOT EXISTS gallery_images (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        gradient_color VARCHAR(100),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(100)
      );
    `;

    // Staff Unavailable Schedule Table
    const unavailableTableSQL = `
      CREATE TABLE IF NOT EXISTS staff_unavailable_schedule (
        id SERIAL PRIMARY KEY,
        staff_id VARCHAR REFERENCES staff(id),
        start_date VARCHAR(10) NOT NULL,
        end_date VARCHAR(10) NOT NULL,
        start_time VARCHAR(5) NOT NULL,
        end_time VARCHAR(5) NOT NULL,
        reason VARCHAR(100),
        notes TEXT,
        created_by VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Execute SQL commands directly
    const { error: galleryError } = await supabase.rpc('exec_sql', {
      sql: galleryTableSQL
    });

    if (galleryError) {
      console.error('Error creating gallery_images table:', galleryError);
    } else {
      console.log('✅ gallery_images table created successfully');
    }

    // Create staff_unavailable_schedule table
    const { error: unavailableError } = await supabase.rpc('exec_sql', {
      sql: unavailableTableSQL
    });

    if (unavailableError) {
      console.error('Error creating staff_unavailable_schedule table:', unavailableError);
    } else {
      console.log('✅ staff_unavailable_schedule table created successfully');
    }

    return NextResponse.json({
      success: true,
      message: 'Tables created successfully',
      details: {
        gallery_images: galleryError ? 'Failed' : 'Created',
        staff_unavailable_schedule: unavailableError ? 'Failed' : 'Created'
      }
    });

  } catch (error) {
    console.error('Create tables error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
