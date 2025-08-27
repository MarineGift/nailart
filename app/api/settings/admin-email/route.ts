import { NextRequest, NextResponse } from 'next/server'

// In a real app, this would be stored in database
let adminEmailSettings = {
  admin_email: 'admin@connienail.com',
  notification_enabled: true,
  booking_notifications: true,
  payment_notifications: true
}

export async function GET() {
  try {
    return NextResponse.json(adminEmailSettings, { status: 200 })
  } catch (error) {
    console.error('Error fetching admin email settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.admin_email || !emailRegex.test(data.admin_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Update settings
    adminEmailSettings = {
      admin_email: data.admin_email,
      notification_enabled: data.notification_enabled || false,
      booking_notifications: data.booking_notifications || false,
      payment_notifications: data.payment_notifications || false
    }

    return NextResponse.json({ 
      message: 'Admin email settings saved successfully',
      settings: adminEmailSettings 
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error saving admin email settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}