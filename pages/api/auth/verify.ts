import type { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import { adminAuth } from '@/lib/firebase-admin'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const MESSAGING_SERVICE_SID = 'MG123e11ea198ac4584d76846391716aff'

// Store verification codes temporarily (in production, use Redis or similar)
const verificationCodes = new Map<string, { code: string, expires: number }>()

// Generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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
        // Generate a new verification code
        const verificationCode = generateVerificationCode()
        
        // Store the code with 5-minute expiration
        verificationCodes.set(formattedPhone, {
          code: verificationCode,
          expires: Date.now() + 5 * 60 * 1000 // 5 minutes
        })

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

        // Send SMS with the generated code
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

      } catch (error) {
        console.error('Detailed error:', error)
        throw error
      }

    } else if (action === 'verify') {
      // Get the stored verification data
      const storedVerification = verificationCodes.get(phoneNumber)
      
      if (!storedVerification) {
        return res.status(200).json({ 
          valid: false,
          status: 'failed',
          error: 'No verification code found'
        })
      }

      // Check if code has expired
      if (Date.now() > storedVerification.expires) {
        verificationCodes.delete(phoneNumber) // Clean up expired code
        return res.status(200).json({ 
          valid: false,
          status: 'failed',
          error: 'Verification code has expired'
        })
      }

      // Verify the code
      const isValid = code === storedVerification.code

      if (!isValid) {
        return res.status(200).json({ 
          valid: false,
          status: 'failed',
          error: 'Invalid verification code'
        })
      }

      try {
        // Clean up used code
        verificationCodes.delete(phoneNumber)

        // Get user and create token
        const userRecord = await adminAuth.getUserByPhoneNumber(phoneNumber)
        const customToken = await adminAuth.createCustomToken(userRecord.uid)

        return res.status(200).json({ 
          valid: true,
          status: 'approved',
          uid: userRecord.uid,
          customToken
        })
      } catch (error) {
        console.error('Error during verification:', error)
        return res.status(500).json({
          error: 'Failed to verify user',
          details: error.message
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