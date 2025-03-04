import type { NextApiRequest, NextApiResponse } from 'next'
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('=== API Request ===')
  console.log('Method:', req.method)
  console.log('Body:', req.body)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const { phoneNumber, action, code, firstName, lastName, email, isLogin } = req.body

  try {
    // Handle direct login
    if (action === 'login') {
      let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`
      }

      try {
        // Check if user exists
        const userRecord = await adminAuth.getUserByPhoneNumber(formattedPhone)
        const customToken = await adminAuth.createCustomToken(userRecord.uid)
        
        return res.status(200).json({
          status: 'success',
          customToken,
          uid: userRecord.uid
        })
      } catch (error) {
        return res.status(400).json({
          error: 'User not found',
          details: 'Please register first'
        })
      }
    }

    if (action === 'send') {
      console.log('=== Send Code Process ===')
      
      // Format phone number
      let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`
      }
      console.log('Formatted phone:', formattedPhone)

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
        console.log('Sending SMS to:', formattedPhone)
        console.log('Using Twilio number:', process.env.TWILIO_PHONE_NUMBER)
        
        const message = await client.messages.create({
          body: `Your GunGroup verification code is: ${verificationCode}`,
          to: formattedPhone,
          from: process.env.TWILIO_PHONE_NUMBER
        })

        console.log('SMS sent successfully:', message.sid)

        return res.status(200).json({ 
          status: 'success',
          message: 'Verification code sent'
        })

      } catch (error) {
        console.error('Twilio Error:', error)
        return res.status(400).json({
          error: 'Failed to send verification code',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    if (action === 'verify') {
      console.log('=== Verify Code Process ===')
      console.log('Verifying code for phone:', phoneNumber)
      
      // Format phone number consistently
      let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`
      }
      
      // Get stored verification code
      const storedData = global.verificationCodes?.get(formattedPhone)
      const isValid = isLogin || (storedData && storedData.code === code)
      console.log('Code valid:', isValid)

      if (!isValid) {
        return res.status(200).json({ 
          valid: false,
          status: 'failed',
          error: 'Invalid verification code'
        })
      }

      try {
        // Try to get user or create if doesn't exist
        let userRecord;
        try {
          userRecord = await adminAuth.getUserByPhoneNumber(formattedPhone)
          console.log('Existing user found:', userRecord.uid)
        } catch (error) {
          // User doesn't exist, create new user
          console.log('Creating new user...')
          userRecord = await adminAuth.createUser({
            phoneNumber: formattedPhone,
            displayName: `${firstName} ${lastName}`,
            email: email,
            disabled: false
          })
          console.log('New user created:', userRecord.uid)
        }

        console.log('Creating custom token...')
        const customToken = await adminAuth.createCustomToken(userRecord.uid)
        console.log('Custom token created')

        // Clean up
        global.verificationCodes.delete(formattedPhone)

        return res.status(200).json({ 
          valid: true,
          status: 'approved',
          uid: userRecord.uid,
          customToken
        })
      } catch (error) {
        console.error('Verification Error:', error)
        return res.status(500).json({
          error: 'Failed to verify user',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

  } catch (error) {
    console.error('Handler Error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 