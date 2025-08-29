import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { settings } from '@/shared/schema'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  try {
    const stripeSettings = await db
      .select()
      .from(settings)
      .where(eq(settings.category, 'stripe'))

    const settingsObject = stripeSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string | null>)

    return NextResponse.json({
      publishable_key: settingsObject.stripe_publishable_key || '',
      secret_key: settingsObject.stripe_secret_key || '',
      webhook_secret: settingsObject.stripe_webhook_secret || '',
    })
  } catch (error) {
    console.error('Error fetching Stripe settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Stripe settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { publishable_key, secret_key, webhook_secret } = await request.json()

    if (!publishable_key || !secret_key) {
      return NextResponse.json(
        { error: 'Publishable key and secret key are required' },
        { status: 400 }
      )
    }

    // Upsert Stripe settings
    const settingsToUpdate = [
      { key: 'stripe_publishable_key', value: publishable_key },
      { key: 'stripe_secret_key', value: secret_key },
      { key: 'stripe_webhook_secret', value: webhook_secret || '' },
    ]

    for (const setting of settingsToUpdate) {
      await db
        .insert(settings)
        .values({
          key: setting.key,
          value: setting.value,
          category: 'stripe',
          description: `Stripe ${setting.key.replace('stripe_', '').replace('_', ' ')}`,
          isEncrypted: setting.key.includes('secret'),
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
      message: 'Stripe settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating Stripe settings:', error)
    return NextResponse.json(
      { error: 'Failed to update Stripe settings' },
      { status: 500 }
    )
  }
}