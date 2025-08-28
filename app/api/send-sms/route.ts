import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Skip only during actual build process (not development)
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL && !process.env.VERCEL_ENV) {
      return NextResponse.json(
        { error: 'SMS service not available during build' },
        { status: 503 }
      )
    }

    // Use provided Twilio credentials for testing
    const twilioSettings = {
      account_sid: 'ACa24a87159bf2e5d77376bb0da09b5218',
      auth_token: 'e95bad8ab333f397b3a810b7e6799833',
      phone_number: '+18885493238'
    }
    
    if (!twilioSettings.account_sid || !twilioSettings.auth_token || !twilioSettings.phone_number) {
      return NextResponse.json(
        { error: 'SMS service not configured.' },
        { status: 503 }
      )
    }

    // Dynamically import Twilio to avoid build issues
    const { default: twilio } = await import('twilio')
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

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}