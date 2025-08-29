import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    console.log('=== INITIALIZE STAFF ACCOUNTS ===');
    
    // Get all current staff
    const { data: staffList, error: fetchError } = await supabase
      .from('staff')
      .select('*');

    if (fetchError) {
      console.error('Error fetching staff:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }

    const updates = [];
    
    for (const staff of staffList || []) {
      // Create username from first name
      const username = staff.first_name.toLowerCase();
      // Default password is same as username for initial setup
      const hashedPassword = await bcrypt.hash(username, 12);
      
      // Update staff with username and password
      const { error: updateError } = await supabase
        .from('staff')
        .update({
          username: username,
          password: hashedPassword
        })
        .eq('id', staff.id);

      if (updateError) {
        console.error(`Error updating staff ${staff.id}:`, updateError);
      } else {
        updates.push({
          id: staff.id,
          name: `${staff.first_name} ${staff.last_name}`,
          username: username,
          role: staff.role || 'staff'
        });
        console.log(`Updated staff: ${staff.first_name} -> username: ${username}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Initialized ${updates.length} staff accounts`,
      updates: updates
    });

  } catch (error) {
    console.error('Initialize staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}