import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 영어 고객명 생성용 데이터
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
  'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Kenneth', 'Michelle',
  'Joshua', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah',
  'Edward', 'Dorothy', 'Ronald', 'Lisa', 'Timothy', 'Nancy', 'Jason', 'Karen',
  'Jeffrey', 'Betty', 'Ryan', 'Helen', 'Jacob', 'Sandra', 'Gary', 'Donna',
  'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon', 'Stephen', 'Michelle',
  'Larry', 'Laura', 'Justin', 'Sarah', 'Scott', 'Kimberly', 'Brandon', 'Deborah',
  'Benjamin', 'Dorothy', 'Samuel', 'Amy', 'Frank', 'Angela', 'Raymond', 'Ashley',
  'Alexander', 'Brenda', 'Patrick', 'Emma', 'Jack', 'Olivia', 'Dennis', 'Cynthia'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey'
]

function generatePhoneNumber(): string {
  // (202) xxx-xxxx DC 지역번호 사용
  const middle = Math.floor(Math.random() * 900) + 100
  const last = Math.floor(Math.random() * 9000) + 1000
  return `(202) ${middle}-${last}`
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
}

function getVipLevel(): string {
  const levels = ['Regular', 'VIP', 'Premium']
  const weights = [70, 20, 10] // Regular 70%, VIP 20%, Premium 10%
  const random = Math.random() * 100
  
  if (random < weights[0]) return levels[0]
  if (random < weights[0] + weights[1]) return levels[1]
  return levels[2]
}

export async function POST(request: NextRequest) {
  try {
    console.log('👥 Generating 200 English customers...')
    
    const customers = []
    
    // 200명의 고객 생성
    for (let i = 0; i < 200; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      
      const customer = {
        id: crypto.randomUUID(),
        first_name: firstName,
        last_name: lastName,
        email: generateEmail(firstName, lastName),
        phone_raw: generatePhoneNumber(),
        notes: `VIP Level: ${getVipLevel()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      customers.push(customer)
    }

    console.log(`📝 Inserting ${customers.length} customers...`)
    
    // 배치로 데이터 삽입 (Supabase는 한 번에 1000개까지 지원)
    const { data, error } = await supabase
      .from('customers')
      .insert(customers)

    if (error) {
      console.error('❌ Customer insertion error:', error)
      return NextResponse.json({ 
        error: 'Failed to insert customers', 
        details: error 
      }, { status: 500 })
    }

    console.log(`✅ Successfully inserted ${customers.length} customers`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully generated ${customers.length} English customers`,
      count: customers.length
    })

  } catch (error) {
    console.error('❌ Customer generation error:', error)
    return NextResponse.json({ 
      error: 'Customer generation failed', 
      details: error 
    }, { status: 500 })
  }
}