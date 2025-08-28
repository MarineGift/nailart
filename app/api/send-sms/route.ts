import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'SMS service not configured. Please configure Twilio settings in admin panel.' },
    { status: 503 }
  )
}