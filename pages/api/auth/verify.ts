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

  const { phoneNumber, action, code, firstName, lastName, email } = req.body;
  console.log('Processing request:', { action, phoneNumber, firstName, lastName, email });

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
        console.log('Creating/getting Firebase user...')
        const userRecord = await adminAuth.createUser({
          phoneNumber: formattedPhone,
          disabled: false
        }).catch(async (error) => {
          console.log('User creation failed, attempting to get existing user:', error)
          if (error.code === 'auth/phone-number-already-exists') {
            return await adminAuth.getUserByPhoneNumber(formattedPhone)
          }
          throw error
        })
        console.log('User record:', userRecord)

        console.log('Creating custom token...')
        const customToken = await adminAuth.createCustomToken(userRecord.uid)
        console.log('Custom token created')

        console.log('Sending SMS...')
        const message = await client.messages.create({
          messagingServiceSid: MESSAGING_SERVICE_SID,
          to: formattedPhone,
          body: `Your verification code is: ${DEV_VERIFICATION_CODE}`
        })
        console.log('SMS sent:', message.sid)

        return res.status(200).json({ 
          status: 'pending', 
          messageSid: message.sid,
          customToken,
          uid: userRecord.uid
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
      
      const isValid = code === DEV_VERIFICATION_CODE
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