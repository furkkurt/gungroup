import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, verified } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    const userRef = adminDb.collection('verification').doc(userId)
    await userRef.update({
      verified: verified,
      verifiedAt: verified ? new Date().toISOString() : null
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating verification status:', error)
    return NextResponse.json({ 
      error: 'Failed to update verification status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 