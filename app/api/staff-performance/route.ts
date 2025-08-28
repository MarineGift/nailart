import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { treatments, customers, services, staff } from '@/shared/schema'
import { eq, and, gte, lte, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const staffId = searchParams.get('staffId')
    
    // Build conditions array
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

    // Get detailed service records for each staff
    const baseQuery = db.select({
      staffId: treatments.staffId,
      staffName: sql<string>`concat(${staff.firstName}, ' ', ${staff.lastName})`,
      customerId: treatments.customerId,
      customerName: customers.name,
      serviceId: treatments.serviceId,
      serviceName: services.name,
      serviceDate: treatments.serviceDate,
      actualDuration: treatments.actualDuration,
      actualPrice: treatments.actualPrice,
      customerSatisfaction: treatments.customerSatisfaction,
      serviceNotes: treatments.serviceNotes
    }).from(treatments)
    .leftJoin(customers, eq(treatments.customerId, customers.id))
    .leftJoin(services, eq(treatments.serviceId, services.id))
    .leftJoin(staff, eq(treatments.staffId, staff.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)

    const detailedRecords = await baseQuery

    // Get summary statistics per staff
    const summaryQuery = db.select({
      staffId: serviceRecords.staffId,
      staffName: sql<string>`concat(${staffs.firstName}, ' ', ${staffs.lastName})`,
      totalCustomers: sql<number>`count(distinct ${serviceRecords.customerId})`,
      totalServices: sql<number>`count(${serviceRecords.id})`,
      totalRevenue: sql<number>`sum(${serviceRecords.actualPrice})`,
      totalHours: sql<number>`sum(${serviceRecords.actualDuration}) / 60.0`,
      averageRating: sql<number>`avg(${serviceRecords.customerSatisfaction})`,
      averageServiceDuration: sql<number>`avg(${serviceRecords.actualDuration})`
    }).from(serviceRecords)
    .leftJoin(staffs, eq(serviceRecords.staffId, staffs.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(serviceRecords.staffId, staffs.firstName, staffs.lastName)

    const summaryStats = await summaryQuery

    // Combine detailed records with summary stats
    const result = summaryStats.map(summary => ({
      ...summary,
      detailedServices: detailedRecords.filter(record => record.staffId === summary.staffId)
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching staff performance:', error)
    return NextResponse.json({ error: 'Failed to fetch staff performance' }, { status: 500 })
  }
}