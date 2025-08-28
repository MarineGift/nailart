import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  // CRITICAL: Always return safe response during build time
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV && !process.env.RUNTIME_ENV
  
  if (isBuildTime) {
    return NextResponse.json({
      message: 'Settings service ready - build mode',
      buildMode: true
    })
  }

  try {
    // Runtime-only database access
    const { db } = await import('@/server/db')
    const { settings } = await import('@/shared/schema')  
    const { eq } = await import('drizzle-orm')

    let twilioSettings: any[] = []
    
    try {
      twilioSettings = await db
        .select()
        .from(settings)
        .where(eq(settings.category, 'twilio'))
    } catch (dbError) {
      console.log('Database error, returning empty settings:', dbError)
      return NextResponse.json({}, { status: 404 })
    }

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
  // CRITICAL: Always return safe response during build time
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV && !process.env.RUNTIME_ENV
  
  if (isBuildTime) {
    return NextResponse.json({
      success: true,
      message: 'Settings service ready - build mode',
      buildMode: true
    })
  }

  try {
    // Runtime-only database access
    const { db } = await import('@/server/db')
    const { settings } = await import('@/shared/schema')
    const { eq } = await import('drizzle-orm')

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
      try {
        // Check if setting exists, if so update, else insert
        const existingSetting = await db
          .select()
          .from(settings)
          .where(eq(settings.key, setting.key))
          .limit(1)
        
        if (existingSetting.length > 0) {
          // Update existing
          await db
            .update(settings)
            .set({
              value: setting.value,
              updatedAt: new Date(),
            })
            .where(eq(settings.key, setting.key))
        } else {
          // Insert new
          await db
            .insert(settings)
            .values({
              key: setting.key,
              value: setting.value,
              description: setting.description,
              category: 'twilio',
              isEncrypted: setting.key === 'auth_token',
            })
        }
      } catch (settingError) {
        console.error(`Error processing Twilio setting ${setting.key}:`, settingError)
      }
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