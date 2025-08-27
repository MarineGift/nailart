import { NextRequest, NextResponse } from 'next/server'

// This would update the booking's status in a real database
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json()
    const resolvedParams = await params
    const bookingId = parseInt(resolvedParams.id)

    // Validate status
    const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // In a real application, this would update the database
    // For now, we'll simulate a successful response
    console.log(`Updating booking ${bookingId} status to ${status}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Status updated successfully',
      booking_id: bookingId,
      status 
    })
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}