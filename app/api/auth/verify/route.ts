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
    const { phoneNumber, action, code, firstName, lastName, email, uid } = body

    console.log('=== API Request ===')
    console.log('Action:', action)
    console.log('Phone:', phoneNumber)
    console.log('Code:', code)
    console.log('IsLogin:', !!uid)
    console.log('Firebase Admin Status:', !!adminAuth)

    // Handle direct login
    if (action === 'login') {
      // Format phone number exactly as stored in Firebase
      let formattedPhone = phoneNumber.replace(/\s+/g, '')
        .replace(/[()-]/g, '')
        .replace(/^00/, '+') // Replace leading 00 with +
      
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`
      }

      console.log('Attempting login with phone:', formattedPhone)

      try {
        const userRecord = await adminAuth.getUserByPhoneNumber(formattedPhone)
        console.log('Found user:', userRecord)
        
        const customToken = await adminAuth.createCustomToken(userRecord.uid)
        console.log('Generated token for:', userRecord.uid)
        
        return NextResponse.json({
          status: 'success',
          customToken,
          uid: userRecord.uid
        })

      } catch (error) {
        console.error('Login error:', error)
        // Log the exact error for debugging
        console.log('Error details:', {
          code: error instanceof Error ? (error as any).code : 'unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          phoneNumber: formattedPhone
        })
        
        return NextResponse.json({
          error: 'User not found',
          details: 'Please register first',
          debug: formattedPhone // This will help us see what number we're trying
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
        await client.messages.create({
          body: `Your GunGroup verification code is: ${verificationCode}`,
          to: formattedPhone,
          from: process.env.TWILIO_PHONE_NUMBER
        })

        return NextResponse.json({ status: 'success' })
      } catch (error) {
        console.error('Send code error:', error)
        return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
      }
    }

    if (action === 'verify') {
      let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`
      }
      
      const storedData = global.verificationCodes?.get(formattedPhone)
      
      if (!storedData || storedData.code !== code) {
        return NextResponse.json({ 
          error: 'Invalid verification code'
        }, { status: 400 })
      }

      try {
        // Update the user's phone number in Firebase
        await adminAuth.updateUser(uid, {
          phoneNumber: formattedPhone,
        })

        // Generate a custom token
        const customToken = await adminAuth.createCustomToken(uid)
        
        // Clean up the verification code
        global.verificationCodes.delete(formattedPhone)

        return NextResponse.json({ 
          status: 'success',
          customToken
        })
      } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Handler error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 