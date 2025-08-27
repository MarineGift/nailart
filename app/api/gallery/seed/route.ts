import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhldnZjZW0iLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NTUxMTQ4LCJleHAiOjIwNTExMjcxNDh9.9HZJUhGMOxQI8n6vH8DtuUtJ6z2mE8TQKGE5x6qwPR8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 기존 하드코딩된 갤러리 데이터
const galleryData = [
  {
    title: "Professional Nail Art",
    description: "Expert nail artistry and design",
    image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop",
    gradient_color: "from-pink-400 to-rose-400",
    sort_order: 1
  },
  {
    title: "Nail Technician at Work", 
    description: "Skilled professionals creating beautiful nails",
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop",
    gradient_color: "from-purple-400 to-indigo-400",
    sort_order: 2
  },
  {
    title: "Gel Polish Application",
    description: "Precise application techniques", 
    image_url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&h=600&fit=crop",
    gradient_color: "from-blue-400 to-cyan-400",
    sort_order: 3
  },
  {
    title: "Creative Nail Designs",
    description: "Artistic expression on nails",
    image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop", 
    gradient_color: "from-green-400 to-emerald-400",
    sort_order: 4
  },
  {
    title: "Pedicure Service",
    description: "Complete foot and nail care",
    image_url: "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=800&h=600&fit=crop",
    gradient_color: "from-indigo-400 to-purple-400",
    sort_order: 5
  },
  {
    title: "Manicure Treatment",
    description: "Professional hand and nail care",
    image_url: "https://images.unsplash.com/photo-1562887250-3c85ee2151e5?w=800&h=600&fit=crop",
    gradient_color: "from-teal-400 to-blue-400",
    sort_order: 6
  }
];

export async function POST(request: Request) {
  try {
    console.log('=== SEED GALLERY IMAGES ===');

    // 기존 갤러리 이미지 삭제
    const { error: deleteError } = await supabase
      .from('gallery_images')
      .delete()
      .neq('id', 0); // Delete all

    if (deleteError) {
      console.error('Error deleting existing gallery images:', deleteError);
    }

    // 새 갤러리 이미지 삽입
    const { data: createdImages, error: insertError } = await supabase
      .from('gallery_images')
      .insert(galleryData.map(image => ({
        ...image,
        is_active: true,
        created_by: 'system'
      })))
      .select();

    if (insertError) {
      console.error('Error creating gallery images:', insertError);
      return NextResponse.json({ error: 'Failed to seed gallery images' }, { status: 500 });
    }

    console.log(`✅ Seeded ${createdImages?.length || 0} gallery images`);

    return NextResponse.json({
      success: true,
      message: `Seeded ${createdImages?.length || 0} gallery images`,
      images: createdImages
    });

  } catch (error) {
    console.error('Seed gallery images error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
