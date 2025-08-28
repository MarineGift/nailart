import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { settings } from '@/shared/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({}, { status: 404 })
    }

    const twilioSettings = await db
      .select()
      .from(settings)
      .where(eq(settings.category, 'twilio'))

    const config = twilioSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value || ''
      return acc
    }, {} as Record<string, string>)

    // Return empty object if no settings found
    if (Object.keys(config).length === 0) {
      return NextResponse.json({}, { status: 404 })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching Twilio settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Twilio settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Settings service not available during build' },
        { status: 503 }
      )
    }

    const { account_sid, auth_token, phone_number } = await request.json()

    if (!account_sid || !auth_token || !phone_number) {
      return NextResponse.json(
        { error: 'All Twilio fields are required' },
        { status: 400 }
      )
    }

    // Upsert Twilio settings
    const twilioKeys = [
      { key: 'account_sid', value: account_sid, description: 'Twilio Account SID' },
      { key: 'auth_token', value: auth_token, description: 'Twilio Auth Token' },
      { key: 'phone_number', value: phone_number, description: 'Twilio Phone Number' },
    ]

    for (const setting of twilioKeys) {
      await db
        .insert(settings)
        .values({
          key: setting.key,
          value: setting.value,
          description: setting.description,
          category: 'twilio',
          isEncrypted: setting.key === 'auth_token', // Encrypt auth token
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: {
            value: setting.value,
            updatedAt: new Date(),
          },
        })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Twilio settings saved successfully' 
    })
  } catch (error) {
    console.error('Error saving Twilio settings:', error)
    return NextResponse.json(
      { error: 'Failed to save Twilio settings' },
      { status: 500 }
    )
  }
}