import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 Starting database schema fix...')

    // Add staff_id column to bookings table
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        -- Add staff_id column to bookings table if it doesn't exist
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='bookings' 
            AND column_name='staff_id'
          ) THEN
            ALTER TABLE bookings 
            ADD COLUMN staff_id VARCHAR REFERENCES staff(id);
            
            -- Add source column if it doesn't exist
            IF NOT EXISTS (
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name='bookings' 
              AND column_name='source'
            ) THEN
              ALTER TABLE bookings 
              ADD COLUMN source VARCHAR(50) DEFAULT 'Homepage';
            END IF;
            
            -- Add duration_minutes column if it doesn't exist  
            IF NOT EXISTS (
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name='bookings' 
              AND column_name='duration_minutes'
            ) THEN
              ALTER TABLE bookings 
              ADD COLUMN duration_minutes INTEGER DEFAULT 60;
            END IF;

            RAISE NOTICE 'Successfully added missing columns to bookings table';
          ELSE
            RAISE NOTICE 'staff_id column already exists in bookings table';
          END IF;
        END $$;
      `
    })

    if (error) {
      console.error('❌ Database schema fix failed:', error)
      return NextResponse.json({ 
        error: 'Failed to fix database schema', 
        details: error 
      }, { status: 500 })
    }

    console.log('✅ Database schema fix completed successfully')
    
    return NextResponse.json({
      success: true,
      message: '데이터베이스 스키마가 성공적으로 수정되었습니다',
      data: data
    })

  } catch (error) {
    console.error('❌ Error fixing database schema:', error)
    return NextResponse.json({ 
      error: 'Failed to fix database schema', 
      details: error 
    }, { status: 500 })
  }
}