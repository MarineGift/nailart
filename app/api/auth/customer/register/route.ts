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
    console.log('=== CUSTOMER REGISTER API START ===');
    const { phoneNumber, password, firstName, lastName, email } = await request.json();
    
    console.log('Registration attempt for phone:', phoneNumber);

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone_raw', phoneNumber)
      .single();

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        phone_raw: phoneNumber,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        email: email || '',
        total_visits: 0,
        total_spent: '0',
        vip_level: 'Bronze'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
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

    console.log('Registration successful for customer:', phoneNumber);

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
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}