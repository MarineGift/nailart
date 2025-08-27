import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { treatments, customers, services, staff } from '@/shared/schema'
import { eq, and, gte, lte } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const staffId = searchParams.get('staffId')
    
    const conditions = []
    
    if (startDate) {
      conditions.push(gte(treatments.serviceDate, new Date(startDate)))
    }
    
    if (endDate) {
      conditions.push(lte(treatments.serviceDate, new Date(endDate)))
    }
    
    if (staffId) {
      conditions.push(eq(treatments.staffId, staffId))
    }

    const query = db.select({
      id: treatments.id,
      bookingId: treatments.bookingId,
      customerId: treatments.customerId,
      staffId: treatments.staffId,
      serviceId: treatments.serviceId,
      actualStartTime: treatments.actualStartTime,
      actualEndTime: treatments.actualEndTime,
      actualDuration: treatments.actualDuration,
      actualPrice: treatments.actualPrice,
      serviceNotes: treatments.serviceNotes,
      customerSatisfaction: treatments.customerSatisfaction,
      serviceDate: treatments.serviceDate,
      status: treatments.status,
      customerName: customers.name,
      serviceName: services.name,
      staffName: staff.firstName,
      staffLastName: staff.lastName
    }).from(treatments)
    .leftJoin(customers, eq(treatments.customerId, customers.id))
    .leftJoin(services, eq(treatments.serviceId, services.id))
    .leftJoin(staff, eq(treatments.staffId, staff.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)

    const result = await query
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching service records:', error)
    return NextResponse.json({ error: 'Failed to fetch service records' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await db.insert(treatments).values(body).returning()
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error creating service record:', error)
    return NextResponse.json({ error: 'Failed to create service record' }, { status: 500 })
  }
}