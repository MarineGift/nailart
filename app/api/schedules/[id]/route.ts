import { NextRequest, NextResponse } from 'next/server';

// This would be your database in production
const mockSchedules = [
  {
    id: '1',
    staffId: '1',
    date: '2025-08-19',
    startTime: '10:00',
    endTime: '18:00',
    isWorking: true,
    notes: 'Regular shift'
  }
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { staffId, date, startTime, endTime, isWorking, notes } = body;
    const scheduleId = params.id;

    // Find and update schedule
    const scheduleIndex = mockSchedules.findIndex(s => s.id === scheduleId);
    
    if (scheduleIndex === -1) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    const updatedSchedule = {
      ...mockSchedules[scheduleIndex],
      staffId: staffId || mockSchedules[scheduleIndex].staffId,
      date: date || mockSchedules[scheduleIndex].date,
      startTime: startTime || mockSchedules[scheduleIndex].startTime,
      endTime: endTime || mockSchedules[scheduleIndex].endTime,
      isWorking: isWorking !== undefined ? isWorking : mockSchedules[scheduleIndex].isWorking,
      notes: notes !== undefined ? notes : mockSchedules[scheduleIndex].notes
    };

    mockSchedules[scheduleIndex] = updatedSchedule;

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = params.id;

    // Find schedule
    const scheduleIndex = mockSchedules.findIndex(s => s.id === scheduleId);
    
    if (scheduleIndex === -1) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Remove schedule
    mockSchedules.splice(scheduleIndex, 1);

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}