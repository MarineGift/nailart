// Image management API for gallery and carousel management
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') // 'gallery', 'carousel', 'service', 'general'
    
    console.log(`=== IMAGES GET API CALLED ===`)
    console.log(`Category filter: ${category}`)

    let query = supabase
      .from('images')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: images, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
    }

    console.log(`✅ Found ${images?.length || 0} images from Supabase`)
    return NextResponse.json(images || [])

  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Creating image with data:', body)
    
    const { data: image, error } = await supabase
      .from('images')
      .insert([{
        name: body.name || 'Untitled Image',
        url: body.url,
        description: body.description || '',
        category: body.category || 'general',
        sort_order: body.sort_order || 0,
        is_active: body.is_active !== undefined ? body.is_active : true
      }])
      .select('*')
      .single()

    if (error) {
      console.error('Error creating image in Supabase:', error)
      return NextResponse.json({ error: 'Failed to create image', details: error }, { status: 500 })
    }

    console.log('✅ Image created successfully in Supabase:', image)
    return NextResponse.json(image)

  } catch (error) {
    console.error('Error creating image:', error)
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Updating image with data:', body)
    
    if (!body.id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    const { data: image, error } = await supabase
      .from('images')
      .update({
        name: body.name,
        url: body.url,
        description: body.description,
        category: body.category,
        sort_order: body.sort_order,
        is_active: body.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating image in Supabase:', error)
      return NextResponse.json({ error: 'Failed to update image', details: error }, { status: 500 })
    }

    console.log('✅ Image updated successfully in Supabase:', image)
    return NextResponse.json(image)

  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')
    
    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    console.log('🗑️ Deleting image with ID:', imageId)

    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error('Error deleting image in Supabase:', error)
      return NextResponse.json({ error: 'Failed to delete image', details: error }, { status: 500 })
    }

    console.log('✅ Image deleted successfully from Supabase')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}