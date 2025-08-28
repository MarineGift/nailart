import { NextRequest, NextResponse } from 'next/server'

// Mock storage for discount settings
let discountSettings = {
  rate: 10, // Default 10% discount
  lastUpdated: new Date().toISOString()
}

export async function GET() {
  try {
    return NextResponse.json(discountSettings)
  } catch (error) {
    console.error('Error fetching discount settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { rate } = await request.json()
    
    if (typeof rate !== 'number' || rate < 0 || rate > 100) {
      return NextResponse.json({ error: 'Invalid discount rate. Must be between 0 and 100.' }, { status: 400 })
    }
    
    discountSettings = {
      rate,
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json(discountSettings)
  } catch (error) {
    console.error('Error updating discount settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}