import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('Creating 200 customers...')
    
    const customers = []
    const firstNames = ['Jennifer', 'Sarah', 'Jessica', 'Emily', 'Ashley', 'Amanda', 'Stephanie', 'Nicole', 'Rachel', 'Heather', 'Amy', 'Michelle', 'Kimberly', 'Angela', 'Tiffany', 'Christina', 'Lisa', 'Melissa', 'Kelly', 'Crystal', 'Maria', 'Nancy', 'Donna', 'Laura', 'Linda']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'White', 'Harris', 'Clark', 'Lewis']
    
    for (let i = 1; i <= 200; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const phoneNumber = `202-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
      
      customers.push({
        first_name: firstName,
        last_name: lastName,
        phone_raw: phoneNumber,
        city: 'Washington',
        state: 'DC',
        country: 'USA'
      })
    }

    // Insert customers in smaller batches
    const batchSize = 25
    let totalInserted = 0
    const errors = []
    
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize)
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .insert(batch)
          .select()
        
        if (error) {
          console.error(`Batch ${i/batchSize + 1} error:`, error.message)
          errors.push(`Batch ${i/batchSize + 1}: ${error.message}`)
        } else {
          totalInserted += data?.length || 0
          console.log(`Batch ${i/batchSize + 1}: inserted ${data?.length || 0} customers`)
        }
      } catch (batchError) {
        console.error(`Batch ${i/batchSize + 1} exception:`, batchError)
        errors.push(`Batch ${i/batchSize + 1}: ${batchError}`)
      }
    }

    return NextResponse.json({
      message: '고객 데이터 생성 완료',
      inserted: totalInserted,
      target: 200,
      errors: errors.length > 0 ? errors : null
    })

  } catch (error) {
    console.error('Error creating customers:', error)
    return NextResponse.json({ error: 'Failed to create customers' }, { status: 500 })
  }
}