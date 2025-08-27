import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - 갤러리 이미지 조회
export async function GET(request: Request) {
  try {
    console.log('=== GALLERY IMAGES GET API START ===');

    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .eq('category', 'gallery')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching gallery images:', error);
      return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 });
    }

    console.log(`✅ Found ${images?.length || 0} gallery images`);

    // Map images from new format to legacy format for compatibility
    const mappedImages = images?.map(image => ({
      id: image.id,
      title: image.name,
      description: image.description,
      image_url: image.url,
      gradient_color: '#667eea',
      sort_order: image.sort_order,
      is_active: image.is_active
    })) || []

    return NextResponse.json({
      success: true,
      images: mappedImages
    });

  } catch (error) {
    console.error('Gallery images API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - 갤러리 이미지 추가
export async function POST(request: Request) {
  try {
    console.log('=== GALLERY IMAGES POST API START ===');
    const { title, description, imageUrl, gradientColor, sortOrder, createdBy } = await request.json();

    const { data: newImage, error } = await supabase
      .from('images')
      .insert({
        name: title,
        description: description || '',
        url: imageUrl,
        category: 'gallery',
        sort_order: sortOrder || 0,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating gallery image:', error);
      return NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 });
    }

    console.log('✅ Gallery image created:', newImage.name);

    return NextResponse.json({
      success: true,
      image: newImage
    });

  } catch (error) {
    console.error('Gallery images POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
