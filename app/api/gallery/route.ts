import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8';

const supabase = createClient(supabaseUrl, supabaseKey);

// GET - 갤러리 이미지 조회
export async function GET(request: Request) {
  try {
    console.log('=== GALLERY IMAGES GET API START ===');

    const { data: images, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching gallery images:', error);
      return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 });
    }

    console.log(`✅ Found ${images?.length || 0} gallery images`);

    return NextResponse.json({
      success: true,
      images: images || []
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
      .from('gallery_images')
      .insert({
        title,
        description,
        image_url: imageUrl,
        gradient_color: gradientColor,
        sort_order: sortOrder || 0,
        is_active: true,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating gallery image:', error);
      return NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 });
    }

    console.log('✅ Gallery image created:', newImage.title);

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
