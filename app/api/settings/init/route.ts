import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to avoid build issues
    const { db } = await import('@/server/db')
    const { settings } = await import('@/shared/schema')
    const { eq } = await import('drizzle-orm')

    // Default settings to initialize
    const defaultSettings = [
      // Twilio SMS Settings
      {
        key: 'account_sid',
        value: 'ACa24a87159bf2e5d77376bb0da09b5218',
        description: 'Twilio Account SID for SMS service',
        category: 'twilio'
      },
      {
        key: 'auth_token', 
        value: 'e95bad8ab333f397b3a810b7e6799833',
        description: 'Twilio Auth Token for SMS service',
        category: 'twilio',
        isEncrypted: true
      },
      {
        key: 'phone_number',
        value: '+18885493238',
        description: 'Twilio Phone Number for sending SMS',
        category: 'twilio'
      },
      
      // Email Settings
      {
        key: 'smtp_host',
        value: 'smtp.gmail.com',
        description: 'SMTP server host',
        category: 'email'
      },
      {
        key: 'smtp_port',
        value: '587',
        description: 'SMTP server port',
        category: 'email'
      },
      {
        key: 'email_from',
        value: 'noreply@connienail.com',
        description: 'From email address',
        category: 'email'
      },
      
      // Business Settings
      {
        key: 'business_name',
        value: 'ConnieNail Salon',
        description: 'Business name',
        category: 'business'
      },
      {
        key: 'business_address',
        value: 'Ronald Reagan Building, Space C-044, 1300 Pennsylvania Ave NW, Washington DC',
        description: 'Business address',
        category: 'business'
      },
      {
        key: 'business_phone',
        value: '(202) 898-0826',
        description: 'Business phone number',
        category: 'business'
      },
      {
        key: 'booking_cutoff_time',
        value: '18:00',
        description: 'Customer booking cutoff time (24h format)',
        category: 'business'
      },
      {
        key: 'work_end_time',
        value: '19:00', 
        description: 'Staff work end time (24h format)',
        category: 'business'
      },
      
      // Discount Settings
      {
        key: 'vip_discount_rate',
        value: '10',
        description: 'VIP customer discount rate (percentage)',
        category: 'discounts'
      },
      {
        key: 'new_customer_discount',
        value: '15',
        description: 'New customer discount rate (percentage)',
        category: 'discounts'
      },
      {
        key: 'bulk_booking_discount',
        value: '20',
        description: 'Bulk booking discount rate (percentage)',
        category: 'discounts'
      }
    ]

    let insertCount = 0
    let updateCount = 0

    // Insert or update each setting
    for (const setting of defaultSettings) {
      try {
        // Check if setting already exists
        const existingSetting = await db
          .select()
          .from(settings)
          .where(eq(settings.key, setting.key))
          .limit(1)

        if (existingSetting.length > 0) {
          // Update existing setting
          await db
            .update(settings)
            .set({
              value: setting.value,
              description: setting.description,
              category: setting.category,
              isEncrypted: setting.isEncrypted || false,
              updatedAt: new Date()
            })
            .where(eq(settings.key, setting.key))
          updateCount++
        } else {
          // Insert new setting
          await db
            .insert(settings)
            .values({
              key: setting.key,
              value: setting.value,
              description: setting.description,
              category: setting.category,
              isEncrypted: setting.isEncrypted || false
            })
          insertCount++
        }
      } catch (settingError) {
        console.error(`Error processing setting ${setting.key}:`, settingError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Settings initialized successfully',
      stats: {
        inserted: insertCount,
        updated: updateCount,
        total: defaultSettings.length
      }
    })

  } catch (error) {
    console.error('Error initializing settings:', error)
    return NextResponse.json(
      { error: 'Failed to initialize settings', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Dynamic imports to avoid build issues
    const { db } = await import('@/server/db')
    const { settings } = await import('@/shared/schema')

    // Get all settings grouped by category
    const allSettings = await db.select().from(settings)
    
    const groupedSettings = allSettings.reduce((acc, setting) => {
      const category = setting.category || 'general'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({
        key: setting.key,
        value: setting.value,
        description: setting.description,
        isEncrypted: setting.isEncrypted
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      success: true,
      settings: groupedSettings,
      totalCount: allSettings.length
    })

  } catch (error) {
    console.error('Error fetching all settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error.message },
      { status: 500 }
    )
  }
}