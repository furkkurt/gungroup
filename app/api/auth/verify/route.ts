import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { adminAuth } from '@/lib/firebase-admin'

declare global {
  var verificationCodes: Map<string, { code: string; timestamp: number }>;
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phoneNumber, action, code, firstName, lastName, email, isLogin } = body

    console.log('=== API Request ===')
    console.log('Action:', action)
    console.log('Environment check:', {
      hasTwilioSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasTwilioToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasTwilioPhone: !!process.env.TWILIO_PHONE_NUMBER,
    })

    // Handle direct login
    if (action === 'login') {
      let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`
      }

      try {
        const userRecord = await adminAuth.getUserByPhoneNumber(formattedPhone)
        const customToken = await adminAuth.createCustomToken(userRecord.uid)
        
        return NextResponse.json({
          status: 'success',
          customToken,
          uid: userRecord.uid
        })
      } catch (error) {
        return NextResponse.json({
          error: 'User not found',
          details: 'Please register first'
        }, { status: 400 })
      }
    }

    if (action === 'send') {
      let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`
      }

      try {
        const verificationCode = generateVerificationCode()
        console.log('Generated code:', verificationCode)

        // Store the code
        global.verificationCodes = global.verificationCodes || new Map()
        global.verificationCodes.set(formattedPhone, {
          code: verificationCode,
          timestamp: Date.now()
        })

        // Send SMS
        const message = await client.messages.create({
          body: `Your GunGroup verification code is: ${verificationCode}`,
          to: formattedPhone,
          from: process.env.TWILIO_PHONE_NUMBER
        })

        console.log('SMS sent successfully:', message.sid)

        return NextResponse.json({ 
          status: 'success',
          message: 'Verification code sent'
        })
      } catch (error) {
        console.error('Twilio Error:', error)
        return NextResponse.json({
          error: 'Failed to send verification code',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 })
      }
    }

    if (action === 'verify') {
      let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`
      }
      
      const storedData = global.verificationCodes?.get(formattedPhone)
      const isValid = isLogin || (storedData && storedData.code === code)

      if (!isValid) {
        return NextResponse.json({ 
          valid: false,
          status: 'failed',
          error: 'Invalid verification code'
        })
      }

      try {
        let userRecord;
        try {
          userRecord = await adminAuth.getUserByPhoneNumber(formattedPhone)
        } catch (error) {
          userRecord = await adminAuth.createUser({
            phoneNumber: formattedPhone,
            displayName: `${firstName} ${lastName}`,
            email: email,
            disabled: false
          })
        }

        const customToken = await adminAuth.createCustomToken(userRecord.uid)
        global.verificationCodes.delete(formattedPhone)

        return NextResponse.json({ 
          valid: true,
          status: 'approved',
          uid: userRecord.uid,
          customToken
        })
      } catch (error) {
        console.error('Verification Error:', error)
        return NextResponse.json({
          error: 'Failed to verify user',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Handler Error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 