import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { staffWorkSchedule, staff } from '@/shared/schema'
import { format, addDays } from 'date-fns'

// POST /api/staff-schedules/seed - Seed sample staff schedule data
export async function POST(request: NextRequest) {
  try {
    const today = new Date()
    const scheduleData: {
      staffId: string;
      workDate: string;
      startTime: string;
      endTime: string;
      isWorking: boolean;
      notes: string | null;
    }[] = []

    // Sample staff IDs (assuming these exist in staff table)
    const staffIds = ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005']
    
    // Create schedules for the next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const workDate = format(addDays(today, dayOffset), 'yyyy-MM-dd')
      
      // Only 5 out of 10 staff work each day (rotating schedule)
      const workingStaffs = staffIds.slice(0, 5)
      
      workingStaffs.forEach((staffId, index) => {
        // Vary work hours slightly
        const startTimes = ['09:00', '10:00', '11:00', '12:00', '09:30']
        const endTimes = ['17:00', '18:00', '19:00', '20:00', '17:30']
        
        scheduleData.push({
          staffId,
          workDate,
          startTime: startTimes[index],
          endTime: endTimes[index],
          isWorking: true,
          notes: dayOffset === 0 ? 'Today schedule' : null
        })
      })
    }

    // Insert the schedule data
    const insertedSchedules = await db
      .insert(staffWorkSchedule)
      .values(scheduleData)
      .returning()

    return NextResponse.json({
      message: `Successfully created ${insertedSchedules.length} staff schedule entries`,
      schedules: insertedSchedules
    })
  } catch (error) {
    console.error('Error seeding staff schedules:', error)
    return NextResponse.json({ 
      error: 'Failed to seed staff schedule data',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}