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
    console.log('=== CUSTOMER LOGIN API START ===');
    const { phoneNumber, password } = await request.json();
    
    console.log('Login attempt for phone:', phoneNumber);

    // Check if customer exists
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone_raw', phoneNumber) // Use phone_raw field
      .single();

    if (error || !customer) {
      console.log('Customer not found or error:', error);
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    console.log('Found customer:', customer.first_name, customer.last_name);

    // Verify password
    if (!customer.password) {
      console.log('Customer has no password set');
      return NextResponse.json(
        { error: 'Account not properly configured. Please contact the salon.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    
    if (!isPasswordValid) {
      console.log('Invalid password provided');
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        customerId: customer.id,
        phoneNumber: customer.phone_raw,
        firstName: customer.first_name,
        lastName: customer.last_name,
        type: 'customer'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for customer:', phoneNumber);

    return NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        phoneNumber: customer.phone_raw,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        vipLevel: customer.vip_level,
        totalVisits: customer.total_visits
      }
    });

  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}