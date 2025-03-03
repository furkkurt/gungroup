import type { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import { adminAuth } from '@/lib/firebase-admin'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const MESSAGING_SERVICE_SID = 'MG123e11ea198ac4584d76846391716aff'

// For development, we'll use a fixed code
const DEV_VERIFICATION_CODE = '123456'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API called with method:', req.method);
  console.log('Request body:', req.body);

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { phoneNumber, action, code, firstName, lastName, email } = req.body;
  console.log('Processing request:', { action, phoneNumber, firstName, lastName, email });

  try {
    if (action === 'send') {
      let formattedPhone = phoneNumber.trim().replace(/\s+/g, '')
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`
      }
      if (!formattedPhone.startsWith('+90')) {
        formattedPhone = `+90${formattedPhone.substring(1)}`
      }

      console.log('Formatted phone:', formattedPhone) // Debug log

      try {
        // First try to create/get Firebase user
        const userRecord = await adminAuth.createUser({
          phoneNumber: formattedPhone,
          disabled: false
        }).catch(async (error) => {
          if (error.code === 'auth/phone-number-already-exists') {
            return await adminAuth.getUserByPhoneNumber(formattedPhone)
          }
          throw error
        })

        // In development, we'll just send a fixed code
        // In production, you should use a proper verification service
        const verificationCode = DEV_VERIFICATION_CODE

        // Send SMS with the code
        const message = await client.messages.create({
          messagingServiceSid: MESSAGING_SERVICE_SID,
          to: formattedPhone,
          body: `Your verification code is: ${verificationCode}`
        })

        // Create custom token
        const customToken = await adminAuth.createCustomToken(userRecord.uid)

        return res.status(200).json({ 
          status: 'pending', 
          messageSid: message.sid,
          customToken,
          uid: userRecord.uid
        })

      } catch (error: unknown) {
        const err = error as Error
        console.error('Detailed error:', err)
        throw err
      }

    } else if (action === 'verify') {
      // In development, we'll just check against the fixed code
      const isValid = code === DEV_VERIFICATION_CODE

      if (!isValid) {
        return res.status(200).json({ 
          valid: false,
          status: 'failed',
          error: 'Invalid verification code'
        })
      }

      try {
        // Get user and create token
        const userRecord = await adminAuth.getUserByPhoneNumber(phoneNumber)
        const customToken = await adminAuth.createCustomToken(userRecord.uid)

        return res.status(200).json({ 
          valid: true,
          status: 'approved',
          uid: userRecord.uid,
          customToken
        })
      } catch (error: unknown) {
        const err = error as Error
        console.error('Error during verification:', err)
        return res.status(500).json({
          error: 'Failed to verify user',
          details: err.message
        })
      }
    }

  } catch (error: unknown) {
    const err = error as Error
    console.error('Handler error:', {
      message: err.message,
      stack: err.stack
    })
    
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: err.message
    })
  }
} 