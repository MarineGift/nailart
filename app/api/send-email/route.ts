import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// SMTP transporter 생성 함수
function createEmailTransporter() {
  // 환경변수 확인
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'), 
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      // 자체 인증서 사용시 필요할 수 있음
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, customerName } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      )
    }

    // SMTP 설정 확인
    const transporter = createEmailTransporter()
    if (!transporter) {
      return NextResponse.json(
        { 
          error: 'SMTP configuration not available. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in environment variables.' 
        },
        { status: 503 }
      )
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER, // 발신자 이메일
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">ConnieNail Salon</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Professional Nail Care Services</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Dear ${customerName || 'Valued Customer'},
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Best regards,<br>
                ConnieNail Salon Team
              </p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #888; font-size: 12px;">
                📍 The Ronald Reagan Building, Space C-044<br>
                1300 Pennsylvania Avenue NW, Washington, DC 20004<br>
                📞 (202) 898-0826
              </p>
            </div>
          </div>
        </div>
      `,
      text: `ConnieNail Salon

Dear ${customerName || 'Valued Customer'},

${message}

Best regards,
ConnieNail Salon Team

📍 The Ronald Reagan Building, Space C-044
1300 Pennsylvania Avenue NW, Washington, DC 20004
📞 (202) 898-0826`
    }

    await transporter.sendMail(mailOptions)
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    })

  } catch (error: any) {
    console.error('SMTP email error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error.message 
      },
      { status: 500 }
    )
  }
}