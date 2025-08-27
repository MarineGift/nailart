import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTU1MTE0OCwiZXhwIjoyMDUxMTI3MTQ4fQ.0xHOA5vNRObiJrAcULVOAhOUVqiAprB58VDyB3GX6k8';

const supabase = createClient(supabaseUrl, supabaseKey);

// POST - Create tables using SQL commands
export async function POST(request: Request) {
  try {
    console.log('=== CREATE SUPABASE TABLES API START ===');

    // Create gallery_images table
    const { error: galleryError } = await supabase.rpc('sql', {
      query: `
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
    });

    if (galleryError) {
      console.error('Error creating gallery_images table:', galleryError);
    } else {
      console.log('✅ gallery_images table created successfully');
    }

    // Create staff_unavailable_schedule table
    const { error: scheduleError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS staff_unavailable_schedule (
          id SERIAL PRIMARY KEY,
          staff_id VARCHAR(255), -- null for salon-wide holidays
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
    });

    if (scheduleError) {
      console.error('Error creating staff_unavailable_schedule table:', scheduleError);
    } else {
      console.log('✅ staff_unavailable_schedule table created successfully');
    }

    return NextResponse.json({
      success: true,
      message: 'Tables created successfully',
      errors: {
        gallery: galleryError?.message || null,
        schedule: scheduleError?.message || null
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