import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get all settings or specific setting by key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (key) {
      // Get specific setting
      const { data: setting, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .eq('is_active', true)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ key, value: null }, { status: 200 })
        }
        console.error('Error fetching setting:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
      
      return NextResponse.json({ 
        key: setting.key, 
        value: setting.value,
        type: setting.type,
        description: setting.description 
      })
    } else {
      // Get all settings
      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('is_active', true)
        .order('key', { ascending: true })
      
      if (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
      
      return NextResponse.json(settings || [])
    }
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create or update setting
export async function POST(request: NextRequest) {
  try {
    const { key, value, description, type = 'string' } = await request.json()
    
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }
    
    // Upsert (insert or update) the setting
    const { data: setting, error } = await supabase
      .from('settings')
      .upsert({
        key,
        value: String(value),
        description,
        type,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error upserting setting:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      key: setting.key, 
      value: setting.value, 
      type: setting.type,
      description: setting.description,
      success: true 
    })
  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete setting
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }
    
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('settings')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('key', key)
    
    if (error) {
      console.error('Error deleting setting:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}