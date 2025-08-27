import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments, bookings, customers } from '@/shared/schema'
import { eq, and, gte, lte } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const paymentStatus = searchParams.get('paymentStatus')
    
    const conditions = []
    
    if (startDate) {
      conditions.push(gte(payments.paymentDate, new Date(startDate)))
    }
    
    if (endDate) {
      conditions.push(lte(payments.paymentDate, new Date(endDate)))
    }
    
    if (paymentStatus) {
      conditions.push(eq(payments.paymentStatus, paymentStatus))
    }

    const query = db.select({
      id: payments.id,
      bookingId: payments.bookingId,
      customerId: payments.customerId,
      amount: payments.amount,
      paymentMethod: payments.paymentMethod,
      paymentStatus: payments.paymentStatus,
      transactionId: payments.transactionId,
      paymentDate: payments.paymentDate,
      notes: payments.notes,
      customerName: customers.name,
      createdAt: payments.createdAt
    }).from(payments)
    .leftJoin(customers, eq(payments.customerId, customers.id))
    .leftJoin(bookings, eq(payments.bookingId, bookings.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)

    const result = await query
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await db.insert(payments).values(body).returning()
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}