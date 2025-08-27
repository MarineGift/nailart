import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: Request) {
  try {
    console.log('=== STAFF LOGIN API START ===');
    const { username, password } = await request.json();
    
    console.log('Login attempt for username:', username);

    // Check if staff exists
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('username', username)
      .eq('status', 'active')
      .single();

    if (error || !staff) {
      console.log('Staff not found or error:', error);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    console.log('Found staff:', staff.first_name, staff.last_name, 'Role:', staff.role);

    // Verify password
    if (!staff.password) {
      console.log('Staff has no password set');
      return NextResponse.json(
        { error: 'Account not properly configured. Contact administrator.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    
    if (!isPasswordValid) {
      console.log('Invalid password provided');
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        staffId: staff.id,
        username: staff.username,
        role: staff.role,
        firstName: staff.first_name,
        lastName: staff.last_name,
        type: 'staff'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for staff:', username);

    return NextResponse.json({
      success: true,
      token,
      staff: {
        id: staff.id,
        username: staff.username,
        firstName: staff.first_name,
        lastName: staff.last_name,
        role: staff.role,
        email: staff.email,
        position: staff.position
      }
    });

  } catch (error) {
    console.error('Staff login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}