import { NextRequest, NextResponse } from 'next/server'

// Mock storage for discount settings
let discountSettings = {
  rate: 10, // Default 10% discount
  lastUpdated: new Date().toISOString()
}

export async function GET() {
  try {
    return NextResponse.json({ discountRate: discountSettings.rate, ...discountSettings })
  } catch (error) {
    console.error('Error fetching discount settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rate = body.discountRate || body.rate
    
    if (typeof rate !== 'number' || rate < 0 || rate > 100) {
      return NextResponse.json({ error: 'Invalid discount rate. Must be between 0 and 100.' }, { status: 400 })
    }
    
    discountSettings = {
      rate,
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json({ discountRate: discountSettings.rate, ...discountSettings })
  } catch (error) {
    console.error('Error updating discount settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}