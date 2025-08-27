import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    
    console.log('=== CAROUSEL API START ===')
    console.log('Limit:', limit)

    // Return mock carousel data for now
    const carouselItems = [
      {
        id: '1',
        title: 'Premium Gel Manicure',
        description: 'Experience our signature gel manicure service with long-lasting shine and vibrant colors.',
        image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop',
        link_url: '/booking',
        order_index: 1,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2', 
        title: 'Luxury Nail Art',
        description: 'Custom nail art designs created by our expert technicians using premium materials.',
        image_url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&h=600&fit=crop',
        link_url: '/booking',
        order_index: 2,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Relaxing Spa Pedicure',
        description: 'Indulge in our spa pedicure treatment with soothing massage and premium care.',
        image_url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=600&fit=crop',
        link_url: '/booking',
        order_index: 3,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Bridal Nail Package',
        description: 'Complete bridal nail package including manicure, pedicure, and elegant design.',
        image_url: 'https://images.unsplash.com/photo-1576662712957-9c79ae1280f8?w=800&h=600&fit=crop',
        link_url: '/booking',
        order_index: 4,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Men\'s Grooming Services',
        description: 'Professional nail care and grooming services specifically designed for men.',
        image_url: 'https://images.unsplash.com/photo-1599582909645-2173f0b3b6da?w=800&h=600&fit=crop',
        link_url: '/booking',
        order_index: 5,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ].slice(0, parseInt(limit))

    console.log('✅ Returning', carouselItems.length, 'carousel items')
    return NextResponse.json(carouselItems)
  } catch (error) {
    console.error('Error fetching carousel items:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, image_url, link_url, order_index } = body

    if (!title || !image_url) {
      return NextResponse.json({ error: 'Title and image_url are required' }, { status: 400 })
    }

    const newCarouselItem = {
      id: Date.now().toString(),
      title,
      description: description || '',
      image_url,
      link_url: link_url || '/booking',
      order_index: order_index || 0,
      is_active: true,
      created_at: new Date().toISOString()
    }

    console.log('✅ Created carousel item:', newCarouselItem)
    return NextResponse.json(newCarouselItem)
  } catch (error) {
    console.error('Error creating carousel item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}