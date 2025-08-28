import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { settings } from '@/shared/schema'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  try {
    const emailSettings = await db
      .select()
      .from(settings)
      .where(eq(settings.category, 'email'))

    const settingsObject = emailSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string | null>)

    return NextResponse.json({
      sendgrid_api_key: settingsObject.sendgrid_api_key || '',
      from_email: settingsObject.from_email || '',
      from_name: settingsObject.from_name || '',
      admin_email: settingsObject.admin_email || '',
    })
  } catch (error) {
    console.error('Error fetching email settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sendgrid_api_key, from_email, from_name, admin_email } = await request.json()

    if (!sendgrid_api_key || !from_email || !admin_email) {
      return NextResponse.json(
        { error: 'SendGrid API key, from email, and admin email are required' },
        { status: 400 }
      )
    }

    // Upsert email settings
    const settingsToUpdate = [
      { key: 'sendgrid_api_key', value: sendgrid_api_key },
      { key: 'from_email', value: from_email },
      { key: 'from_name', value: from_name || 'ConnieNail Salon' },
      { key: 'admin_email', value: admin_email },
    ]

    for (const setting of settingsToUpdate) {
      await db
        .insert(settings)
        .values({
          key: setting.key,
          value: setting.value,
          category: 'email',
          description: `Email ${setting.key.replace('_', ' ')}`,
          isEncrypted: setting.key.includes('key'),
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
      message: 'Email settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating email settings:', error)
    return NextResponse.json(
      { error: 'Failed to update email settings' },
      { status: 500 }
    )
  }
}