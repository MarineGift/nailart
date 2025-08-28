import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get Twilio settings from database
    const settingsResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:5000'}/api/settings/twilio`)
    
    if (!settingsResponse.ok) {
      return NextResponse.json(
        { error: 'SMS service not configured. Please configure Twilio settings in admin panel.' },
        { status: 503 }
      )
    }

    const twilioSettings = await settingsResponse.json()
    
    if (!twilioSettings.account_sid || !twilioSettings.auth_token || !twilioSettings.phone_number) {
      return NextResponse.json(
        { error: 'SMS service not configured. Please configure Twilio settings in admin panel.' },
        { status: 503 }
      )
    }

    // Dynamically import and initialize Twilio only when needed
    const twilio = (await import('twilio')).default
    const client = twilio(twilioSettings.account_sid, twilioSettings.auth_token)
    const { to, message, customerName } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      )
    }

    // Format phone number (remove any formatting and ensure it starts with +1 for US numbers)
    let formattedPhone = to.replace(/\D/g, '') // Remove all non-digits
    if (formattedPhone.length === 10) {
      formattedPhone = '+1' + formattedPhone // Add +1 for US numbers
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
      formattedPhone = '+' + formattedPhone // Add + if it starts with 1
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone // Add + if not present
    }

    // Check if from and to numbers are the same
    const fromPhone = twilioSettings.phone_number
    
    if (formattedPhone === fromPhone) {
      return NextResponse.json(
        { 
          error: 'Cannot send SMS to the same number as the sender',
          details: `From: ${fromPhone}, To: ${formattedPhone}` 
        },
        { status: 400 }
      )
    }

    const smsMessage = `ConnieNail Salon

Hi ${customerName || 'there'},

${message}

Best regards,
ConnieNail Team

📍 Ronald Reagan Building, Space C-044
1300 Pennsylvania Ave NW, Washington DC
📞 (202) 898-0826`

    const result = await client.messages.create({
      body: smsMessage,
      from: twilioSettings.phone_number,
      to: formattedPhone
    })

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      messageSid: result.sid
    })

  } catch (error: any) {
    console.error('Twilio error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send SMS',
        details: error.message 
      },
      { status: 500 }
    )
  }
}