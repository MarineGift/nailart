import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Create customer_inquiries table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS customer_inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(150),
        inquiry_type VARCHAR(50) DEFAULT 'general',
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'new',
        priority VARCHAR(10) DEFAULT 'normal',
        assigned_staff_id UUID REFERENCES staff(id),
        response_message TEXT,
        responded_at TIMESTAMPTZ,
        responded_by UUID REFERENCES staff(id),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `

    const { error: createError } = await supabase.rpc('exec_sql', { sql_query: createTableQuery })
    
    // If rpc method doesn't exist, try direct table creation
    if (createError) {
      const { error: tableError } = await supabase
        .from('customer_inquiries')
        .select('count')
        .limit(1)
      
      if (tableError && tableError.message.includes('does not exist')) {
        // Table doesn't exist, we need to create it manually through a different approach
        console.log('Table does not exist, creating sample data...')
      }
    }

    // Create sample inquiry data
    const sampleInquiries = [
      {
        customer_name: '김미영',
        customer_phone: '202-555-1001',
        customer_email: 'mikim@email.com',
        inquiry_type: 'booking',
        subject: '예약 변경 요청',
        message: '8월 25일 오후 2시 예약을 오후 3시로 변경하고 싶습니다.',
        status: 'new',
        priority: 'normal'
      },
      {
        customer_name: '박지수',
        customer_phone: '202-555-1002',
        customer_email: 'jpark@email.com',
        inquiry_type: 'service',
        subject: '서비스 문의',
        message: '젤 네일과 일반 매니큐어의 차이점과 가격을 알고 싶습니다.',
        status: 'in_progress',
        priority: 'normal'
      },
      {
        customer_name: '이영희',
        customer_phone: '202-555-1003',
        customer_email: 'yhlee@email.com',
        inquiry_type: 'complaint',
        subject: '서비스 불만',
        message: '지난번 방문했을 때 서비스가 만족스럽지 않았습니다. 개선 요청드립니다.',
        status: 'new',
        priority: 'high'
      },
      {
        customer_name: '최수진',
        customer_phone: '202-555-1004',
        customer_email: 'sjchoi@email.com',
        inquiry_type: 'general',
        subject: '운영시간 문의',
        message: '토요일 영업시간과 예약 가능 시간을 알고 싶습니다.',
        status: 'resolved',
        priority: 'low'
      },
      {
        customer_name: '정민정',
        customer_phone: '202-555-1005',
        customer_email: 'mjjung@email.com',
        inquiry_type: 'booking',
        subject: '그룹 예약 문의',
        message: '친구 3명과 함께 같은 시간에 예약하고 싶은데 가능한지 문의드립니다.',
        status: 'new',
        priority: 'normal'
      }
    ]

    // Insert sample data
    const { data: insertedData, error: insertError } = await supabase
      .from('customer_inquiries')
      .insert(sampleInquiries)
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      // If insert fails due to table not existing, return a message
      return NextResponse.json({
        message: '고객 문의 테이블이 데이터베이스에 생성되지 않았습니다.',
        note: 'Supabase 관리자 패널에서 customer_inquiries 테이블을 수동으로 생성해주세요.',
        table_sql: createTableQuery,
        sample_data: sampleInquiries
      })
    }

    return NextResponse.json({
      message: '고객 문의 시스템 구축 완료!',
      created_inquiries: insertedData?.length || 0,
      inquiries: insertedData?.map(inquiry => ({
        id: inquiry.id,
        customerName: inquiry.customer_name,
        subject: inquiry.subject,
        status: inquiry.status,
        priority: inquiry.priority,
        createdAt: inquiry.created_at
      })) || []
    })

  } catch (error) {
    console.error('Error creating inquiries system:', error)
    return NextResponse.json({ error: 'Failed to create inquiries system' }, { status: 500 })
  }
}