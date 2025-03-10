import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    const userRef = adminDb.collection('verification').doc(userId)
    await userRef.update({
      verified: true,
      verifiedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying user:', error)
    return NextResponse.json({ 
      error: 'Failed to verify user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 