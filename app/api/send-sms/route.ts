import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  throw new Error('Twilio environment variables are required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER')
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function POST(request: NextRequest) {
  try {
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
    const fromPhone = process.env.TWILIO_PHONE_NUMBER
    
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
      from: process.env.TWILIO_PHONE_NUMBER,
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