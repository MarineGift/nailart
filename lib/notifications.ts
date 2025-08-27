import sgMail from '@sendgrid/mail'

// SendGrid API 키 설정
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

interface BookingNotificationData {
  id?: string
  customer_id?: string
  booking_time?: string
  status?: string
  source?: string
  notes?: string
  customers?: {
    last_name?: string
    phone_raw?: string
    email?: string
  }
  booking_details?: Array<{
    service_id: number
    quantity: number
    price_cents: number
    services?: {
      name: string
      description?: string
      category?: string
    }
  }>
  // Legacy fields for backward compatibility
  customerName?: string
  customerPhone?: string
  bookingDate?: string
  timeSlot?: string
  serviceName?: string
  bookingSource?: string
}

// 관리자에게 새 예약 알림 이메일 발송
export async function sendNewBookingEmailToAdmin(bookingData: BookingNotificationData) {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured')
    return { success: false, error: 'SendGrid not configured' }
  }

  // 설정된 관리자 이메일 가져오기
  let adminEmail = 'ceo@marine-gift.com' // 기본값
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/settings/admin-email`)
    if (response.ok) {
      const settings = await response.json()
      if (settings.admin_email && settings.notification_enabled) {
        adminEmail = settings.admin_email
      }
    }
  } catch (error) {
    console.log('Failed to fetch admin email settings, using default')
  }

  // Extract data from new or legacy format
  const customerName = bookingData.customers?.last_name || bookingData.customerName || 'Unknown Customer'
  const customerPhone = bookingData.customers?.phone_raw || bookingData.customerPhone || 'No phone'
  const customerEmail = bookingData.customers?.email || ''
  const bookingSource = bookingData.source || bookingData.bookingSource || 'Unknown'
  const notes = bookingData.notes || ''
  
  // Format booking time
  let bookingDateTime = 'Unknown time'
  if (bookingData.booking_time) {
    const date = new Date(bookingData.booking_time)
    bookingDateTime = date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul'
    })
  } else if (bookingData.bookingDate && bookingData.timeSlot) {
    bookingDateTime = `${bookingData.bookingDate} ${bookingData.timeSlot}`
  }

  // Format services information
  let servicesHtml = ''
  let totalAmount = 0
  
  if (bookingData.booking_details && bookingData.booking_details.length > 0) {
    servicesHtml = bookingData.booking_details.map(detail => {
      const serviceName = detail.services?.name || `Service ID: ${detail.service_id}`
      const serviceCategory = detail.services?.category || ''
      const price = detail.price_cents * detail.quantity
      totalAmount += price
      
      return `
        <div style="background: #f0f4f8; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #4a90e2;">
          <div style="font-weight: bold; color: #2c3e50;">${serviceName}</div>
          ${serviceCategory ? `<div style="color: #7f8c8d; font-size: 12px; margin-top: 4px;">${serviceCategory}</div>` : ''}
          <div style="display: flex; justify-content: between; margin-top: 8px;">
            <span style="color: #34495e;">Quantity: ${detail.quantity}</span>
            <span style="color: #27ae60; font-weight: bold; margin-left: auto;">$${(price / 100).toFixed(2)}</span>
          </div>
        </div>
      `
    }).join('')
    
    servicesHtml += `
      <div style="text-align: right; margin-top: 16px; padding-top: 12px; border-top: 2px solid #3498db;">
        <span style="font-size: 18px; font-weight: bold; color: #2c3e50;">
          Total Amount: <span style="color: #27ae60;">$${(totalAmount / 100).toFixed(2)}</span>
        </span>
      </div>
    `
  } else if (bookingData.serviceName) {
    servicesHtml = `<div style="color: #333;">${bookingData.serviceName}</div>`
  } else {
    servicesHtml = '<div style="color: #e74c3c;">No services specified</div>'
  }

  const emailContent = {
    to: [adminEmail], // 설정된 관리자 이메일
    from: 'noreply@connienail.com', // SendGrid에서 인증된 발신자 이메일
    subject: `🎉 새로운 예약 알림 - ${customerName} (${bookingSource})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 새로운 예약 알림</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0;">ConnieNail Salon</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">고객 정보</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; width: 30%;">고객명:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">전화번호:</td>
                <td style="padding: 8px 0; color: #333;">${customerPhone}</td>
              </tr>
              ${customerEmail ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">이메일:</td>
                <td style="padding: 8px 0; color: #333;">${customerEmail}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">예약일시:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold; color: #e74c3c;">${bookingDateTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">예약 경로:</td>
                <td style="padding: 8px 0; color: #333;">
                  <span style="background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold;">
                    ${bookingSource}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">예약 서비스</h2>
            ${servicesHtml}
          </div>
          
          ${notes ? `
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">고객 메모:</h3>
            <p style="color: #856404; margin: 0;">${notes}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #e8f5e8; border-radius: 8px;">
            <p style="color: #2d5a2d; font-size: 14px; margin: 0; font-weight: bold;">
              📋 관리자 패널에서 직원 배정 및 예약 관리를 진행해 주세요.
            </p>
          </div>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          ConnieNail Salon Management System<br>
          이 메시지는 자동으로 발송된 알림입니다.
        </div>
      </div>
    `
  }

  try {
    await sgMail.send(emailContent)
    console.log(`✅ 새 예약 이메일 알림 발송 성공: ${customerName}`)
    return { success: true }
  } catch (error) {
    console.error('❌ 새 예약 이메일 알림 발송 실패:', error)
    return { success: false, error }
  }
}

// SMS 알림 발송 (Twilio 사용)
export async function sendNewBookingSMSToAdmin(bookingData: BookingNotificationData) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('Twilio credentials not configured')
    return { success: false, error: 'Twilio not configured' }
  }

  // Twilio 클라이언트는 API route에서 호출하는 방식으로 구현
  const { customerName, customerPhone, bookingDate, timeSlot, bookingSource } = bookingData
  
  const message = `🎉 새 예약 알림
  
고객: ${customerName}
연락처: ${customerPhone}
일시: ${bookingDate} ${timeSlot}
경로: ${bookingSource}

관리자 패널에서 확인해 주세요.`

  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+1234567890', // 관리자 전화번호 - 실제 번호로 변경 필요
        message: message
      })
    })

    if (response.ok) {
      console.log(`✅ 새 예약 SMS 알림 발송 성공: ${customerName}`)
      return { success: true }
    } else {
      const error = await response.text()
      console.error('❌ 새 예약 SMS 알림 발송 실패:', error)
      return { success: false, error }
    }
  } catch (error) {
    console.error('❌ 새 예약 SMS 알림 발송 실패:', error)
    return { success: false, error }
  }
}

// 관리자에게 예약 수정 알림 이메일 발송
export async function sendBookingUpdateEmailToAdmin(bookingData: BookingNotificationData) {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured')
    return { success: false, error: 'SendGrid not configured' }
  }

  // 설정된 관리자 이메일 가져오기
  let adminEmail = 'ceo@marine-gift.com' // 기본값
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/settings/admin-email`)
    if (response.ok) {
      const settings = await response.json()
      if (settings.admin_email && settings.notification_enabled) {
        adminEmail = settings.admin_email
      }
    }
  } catch (error) {
    console.log('Failed to fetch admin email settings, using default')
  }

  // Extract data from new or legacy format
  const customerName = bookingData.customers?.last_name || bookingData.customerName || 'Unknown Customer'
  const customerPhone = bookingData.customers?.phone_raw || bookingData.customerPhone || 'No phone'
  const customerEmail = bookingData.customers?.email || ''
  const bookingSource = bookingData.source || bookingData.bookingSource || 'Unknown'
  const notes = bookingData.notes || ''
  
  // Format booking time
  let bookingDateTime = 'Unknown time'
  if (bookingData.booking_time) {
    const date = new Date(bookingData.booking_time)
    bookingDateTime = date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul'
    })
  } else if (bookingData.bookingDate && bookingData.timeSlot) {
    bookingDateTime = `${bookingData.bookingDate} ${bookingData.timeSlot}`
  }

  // Format services information
  let servicesHtml = ''
  let totalAmount = 0
  
  if (bookingData.booking_details && bookingData.booking_details.length > 0) {
    servicesHtml = bookingData.booking_details.map(detail => {
      const serviceName = detail.services?.name || `Service ID: ${detail.service_id}`
      const serviceCategory = detail.services?.category || ''
      const price = detail.price_cents * detail.quantity
      totalAmount += price
      
      return `
        <div style="background: #f0f4f8; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #4a90e2;">
          <div style="font-weight: bold; color: #2c3e50;">${serviceName}</div>
          ${serviceCategory ? `<div style="color: #7f8c8d; font-size: 12px; margin-top: 4px;">${serviceCategory}</div>` : ''}
          <div style="display: flex; justify-content: between; margin-top: 8px;">
            <span style="color: #34495e;">Quantity: ${detail.quantity}</span>
            <span style="color: #27ae60; font-weight: bold; margin-left: auto;">$${(price / 100).toFixed(2)}</span>
          </div>
        </div>
      `
    }).join('')
    
    servicesHtml += `
      <div style="text-align: right; margin-top: 16px; padding-top: 12px; border-top: 2px solid #3498db;">
        <span style="font-size: 18px; font-weight: bold; color: #2c3e50;">
          Total Amount: <span style="color: #27ae60;">$${(totalAmount / 100).toFixed(2)}</span>
        </span>
      </div>
    `
  } else if (bookingData.serviceName) {
    servicesHtml = `<div style="color: #333;">${bookingData.serviceName}</div>`
  } else {
    servicesHtml = '<div style="color: #e74c3c;">No services specified</div>'
  }

  const emailContent = {
    to: [adminEmail], // 설정된 관리자 이메일
    from: 'noreply@connienail.com', // SendGrid에서 인증된 발신자 이메일
    subject: `✏️ 예약 수정 알림 - ${customerName} (${bookingSource})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✏️ 예약 수정 알림</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0;">ConnieNail Salon</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39c12;">
            <h2 style="color: #856404; margin-top: 0;">예약 정보가 수정되었습니다</h2>
            <p style="color: #856404; margin: 0;">관리자가 고객 예약 정보를 변경했습니다. 업데이트된 내용을 확인해 주세요.</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">고객 정보</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; width: 30%;">고객명:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">전화번호:</td>
                <td style="padding: 8px 0; color: #333;">${customerPhone}</td>
              </tr>
              ${customerEmail ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">이메일:</td>
                <td style="padding: 8px 0; color: #333;">${customerEmail}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">예약일시:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold; color: #e74c3c;">${bookingDateTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">예약 경로:</td>
                <td style="padding: 8px 0; color: #333;">
                  <span style="background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold;">
                    ${bookingSource}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">예약 서비스</h2>
            ${servicesHtml}
          </div>
          
          ${notes ? `
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">수정 내용 & 메모:</h3>
            <p style="color: #856404; margin: 0;">${notes}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #e8f5e8; border-radius: 8px;">
            <p style="color: #2d5a2d; font-size: 14px; margin: 0; font-weight: bold;">
              📋 관리자 패널에서 수정된 예약 내용을 확인하고 필요한 조치를 취해 주세요.
            </p>
          </div>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          ConnieNail Salon Management System<br>
          이 메시지는 자동으로 발송된 알림입니다.
        </div>
      </div>
    `
  }

  try {
    await sgMail.send(emailContent)
    console.log(`✅ 예약 수정 이메일 알림 발송 성공: ${customerName}`)
    return { success: true }
  } catch (error) {
    console.error('❌ 예약 수정 이메일 알림 발송 실패:', error)
    return { success: false, error }
  }
}