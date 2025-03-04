import type { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import { adminAuth } from '@/lib/firebase-admin'

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
  console.log('Headers:', req.headers)
  console.log('Body:', req.body)
  console.log('=================')

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { phoneNumber, action, code, firstName, lastName, email, isLogin } = req.body;
  console.log('Processing request:', { action, phoneNumber, firstName, lastName, email, isLogin });

  try {
    if (action === 'send') {
      console.log('=== Send Code Process ===')
      let formattedPhone = phoneNumber.trim().replace(/\s+/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`
      }
      if (!formattedPhone.startsWith('+90')) {
        formattedPhone = `+90${formattedPhone.substring(1)}`
      }
      console.log('Formatted phone:', formattedPhone)

      try {
        // Check if user exists
        let userRecord
        try {
          userRecord = await adminAuth.getUserByPhoneNumber(formattedPhone)
          
          // If this is a registration attempt and user exists, return error
          if (!isLogin) {
            return res.status(400).json({
              error: 'Phone number already registered',
              details: 'Please login instead'
            })
          }
        } catch (authError) {
          // If this is a login attempt and user doesn't exist, return error
          if (isLogin) {
            return res.status(400).json({
              error: 'Phone number not found',
              details: 'Please register first'
            })
          }
          
          // For registration, create new user
          userRecord = await adminAuth.createUser({
            phoneNumber: formattedPhone,
            disabled: false
          })
        }

        console.log('User record:', userRecord)

        // Create custom token
        console.log('Creating custom token...')
        const customToken = await adminAuth.createCustomToken(userRecord.uid)
        console.log('Custom token created')

        // Only send SMS for registration
        if (!isLogin) {
          console.log('Sending SMS...')
          const verificationCode = generateVerificationCode()
          
          // Store the code in a secure way (you might want to use Redis or similar)
          // For now, we'll store it in memory (not recommended for production)
          global.verificationCodes = global.verificationCodes || new Map()
          global.verificationCodes.set(formattedPhone, {
            code: verificationCode,
            timestamp: Date.now()
          })

          await client.messages.create({
            body: `Your verification code is: ${verificationCode}`,
            to: formattedPhone,
            from: process.env.TWILIO_PHONE_NUMBER
          })
        }

        return res.status(200).json({ 
          status: 'pending', 
          messageSid: isLogin ? 'LOGIN_MODE' : 'SMS_SENT',
          customToken,
          uid: userRecord.uid,
          skipVerification: isLogin // Add this flag
        })

      } catch (error: unknown) {
        console.error('=== Detailed Error ===')
        console.error(error)
        if (error instanceof Error) {
          console.error('Name:', error.name)
          console.error('Message:', error.message)
          console.error('Stack:', error.stack)
        }
        throw error
      }

    } else if (action === 'verify') {
      console.log('=== Verify Code Process ===')
      console.log('Verifying code for phone:', phoneNumber)
      
      // Skip verification for login
      const isValid = isLogin || code === DEV_VERIFICATION_CODE
      console.log('Code valid:', isValid)

      if (!isValid) {
        return res.status(200).json({ 
          valid: false,
          status: 'failed',
          error: 'Invalid verification code'
        })
      }

      try {
        console.log('Getting user record...')
        const userRecord = await adminAuth.getUserByPhoneNumber(phoneNumber)
        console.log('User found:', userRecord.uid)

        console.log('Creating custom token...')
        const customToken = await adminAuth.createCustomToken(userRecord.uid)
        console.log('Custom token created')

        // Clean up
        global.verificationCodes.delete(phoneNumber)

        return res.status(200).json({ 
          valid: true,
          status: 'approved',
          uid: userRecord.uid,
          customToken
        })
      } catch (error: unknown) {
        console.error('=== Verification Error ===')
        console.error(error)
        if (error instanceof Error) {
          console.error('Name:', error.name)
          console.error('Message:', error.message)
          console.error('Stack:', error.stack)
        }
        return res.status(500).json({
          error: 'Failed to verify user',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

  } catch (error: unknown) {
    console.error('=== Handler Error ===')
    console.error(error)
    if (error instanceof Error) {
      console.error('Name:', error.name)
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
    
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 