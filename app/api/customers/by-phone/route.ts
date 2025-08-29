import { NextRequest, NextResponse } from 'next/server'

// Mock customer data for demonstration
const mockCustomers = [
  {
    id: 1,
    name: '김미영',
    phone_number: '010-1234-5678',
    email: 'miyoung.kim@email.com',
    total_visits: 15,
    vip_level: 'Gold',
    last_visit: '2024-01-15',
    created_at: '2023-01-15'
  },
  {
    id: 2,
    name: '이지은',
    phone_number: '010-9876-5432',
    email: 'jieun.lee@email.com',
    total_visits: 8,
    vip_level: 'Silver',
    last_visit: '2024-01-10',
    created_at: '2023-06-20'
  },
  {
    id: 3,
    name: '박서연',
    phone_number: '010-5555-1234',
    email: 'seoyeon.park@email.com',
    total_visits: 3,
    vip_level: 'Regular',
    last_visit: '2024-01-08',
    created_at: '2023-11-15'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Remove any formatting from phone number for comparison
    const cleanPhone = phone.replace(/[^\d]/g, '')
    
    // Find customer by phone number
    const customer = mockCustomers.find(c => {
      const cleanCustomerPhone = c.phone_number.replace(/[^\d]/g, '')
      return cleanCustomerPhone === cleanPhone
    })

    if (customer) {
      return NextResponse.json(customer)
    } else {
      return NextResponse.json(null)
    }
  } catch (error) {
    console.error('Error finding customer by phone:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}