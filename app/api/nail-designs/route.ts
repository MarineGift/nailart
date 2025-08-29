import { NextResponse } from 'next/server'

export async function GET() {
  const nailDesigns = [
    {
      id: '1',
      name: 'Chrome Glass',
      category: 'Premium',
      colors: ['#E8E8E8', '#C0C0C0', '#808080'],
      pattern: 'chrome-mirror',
      thumbnail: '/api/placeholder/nail-chrome.jpg',
      price: 85000,
      duration: 90,
      description: '2024년 가장 인기 있는 크롬 미러 네일. 거울처럼 빛나는 고급스러운 피니시',
      trending: true
    },
    {
      id: '2',
      name: '3D Butterfly',
      category: 'Luxury',
      colors: ['#FFB6C1', '#DDA0DD', '#98FB98'],
      pattern: '3d-butterfly',
      thumbnail: '/api/placeholder/nail-butterfly.jpg',
      price: 120000,
      duration: 120,
      description: '입체적인 나비 장식으로 완성되는 아트 네일. 특별한 날을 위한 선택',
      trending: false
    },
    {
      id: '3',
      name: 'Aura Gradient',
      category: 'Premium',
      colors: ['#E6E6FA', '#F8BBD9', '#E0BBE4'],
      pattern: 'aura-gradient',
      thumbnail: '/api/placeholder/nail-aura.jpg',
      price: 75000,
      duration: 75,
      description: '신비로운 오라 그라데이션 효과. 은은하고 몽환적인 분위기',
      trending: true
    },
    {
      id: '4',
      name: 'Holographic',
      category: 'Premium',
      colors: ['#FF69B4', '#00CED1', '#FFD700'],
      pattern: 'holographic',
      thumbnail: '/api/placeholder/nail-holo.jpg',
      price: 90000,
      duration: 80,
      description: '각도에 따라 변하는 홀로그램 효과. 미래적이고 독특한 매력',
      trending: true
    },
    {
      id: '5',
      name: 'Marble French',
      category: 'Classic',
      colors: ['#FFFFFF', '#F5F5F5', '#FFD1DC'],
      pattern: 'marble-french',
      thumbnail: '/api/placeholder/nail-marble.jpg',
      price: 65000,
      duration: 70,
      description: '클래식한 프렌치에 마블 패턴을 더한 세련된 디자인',
      trending: false
    },
    {
      id: '6',
      name: 'Glitter Fade',
      category: 'Party',
      colors: ['#FFD700', '#FFA500', '#FF69B4'],
      pattern: 'glitter-fade',
      thumbnail: '/api/placeholder/nail-glitter.jpg',
      price: 70000,
      duration: 65,
      description: '파티를 위한 화려한 글리터 페이드 네일. 반짝이는 매력',
      trending: false
    }
  ]

  return NextResponse.json({
    success: true,
    designs: nailDesigns,
    total: nailDesigns.length
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, category, colors, pattern, price, duration, description } = body

    // In a real application, this would save to the database
    const newDesign = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      colors,
      pattern,
      price,
      duration,
      description,
      trending: false,
      thumbnail: `/api/placeholder/nail-${pattern}.jpg`,
      created_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      design: newDesign,
      message: '새로운 네일 디자인이 추가되었습니다.'
    })
  } catch (error) {
    console.error('Failed to create nail design:', error)
    return NextResponse.json(
      { success: false, error: '네일 디자인 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}