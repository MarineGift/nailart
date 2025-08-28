import sgMail from '@sendgrid/mail'

// SendGrid API 키 설정
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

interface BookingNotificationData {
  customerName: string
  customerPhone: string
  bookingDate: string
  timeSlot: string
  serviceName?: string
  bookingSource: string
  notes?: string
}

// 관리자에게 새 예약 알림 이메일 발송
export async function sendNewBookingEmailToAdmin(bookingData: BookingNotificationData) {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured')
    return { success: false, error: 'SendGrid not configured' }
  }

  const { customerName, customerPhone, bookingDate, timeSlot, serviceName, bookingSource, notes } = bookingData

  const emailContent = {
    to: ['connienail@gmail.com'], // 관리자 이메일 - 실제 이메일로 변경 필요
    from: 'noreply@connienail.com', // SendGrid에서 인증된 발신자 이메일
    subject: `🎉 새로운 예약 알림 - ${customerName} (${bookingSource})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 새로운 예약 알림</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0;">ConnieNail Salon</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">예약 정보</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; width: 30%;">고객명:</td>
                <td style="padding: 8px 0; color: #333;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">전화번호:</td>
                <td style="padding: 8px 0; color: #333;">${customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">예약일시:</td>
                <td style="padding: 8px 0; color: #333;">${bookingDate} ${timeSlot}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">서비스:</td>
                <td style="padding: 8px 0; color: #333;">${serviceName || '미지정'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">예약 경로:</td>
                <td style="padding: 8px 0; color: #333;">
                  <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${bookingSource}
                  </span>
                </td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; vertical-align: top;">메모:</td>
                <td style="padding: 8px 0; color: #333;">${notes}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              관리자 패널에서 예약 배정 및 관리를 진행해 주세요.
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
  console.log('SMS service not configured - skipping SMS notification')
  return { success: false, error: 'SMS service not configured' }
}