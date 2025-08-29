import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { customers } from '@/shared/schema'
import { insertCustomerSchema } from '@/shared/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    
    // Validate the customer data
    const validatedData = insertCustomerSchema.parse(body)
    
    // Check if customer already exists with this phone number
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.phoneNumber, validatedData.phoneNumber))
      .limit(1)
    
    if (existingCustomer.length > 0) {
      return NextResponse.json(
        { error: 'Customer with this phone number already exists' },
        { status: 409 }
      )
    }
    
    // Create the customer
    const result = await db.insert(customers).values(validatedData).returning()
    
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid customer data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const result = await db.select().from(customers)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}