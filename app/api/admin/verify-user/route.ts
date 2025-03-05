import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'

const db = getFirestore()

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    // Update verification status
    await db.collection('verification').doc(userId).update({
      verified: true
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Admin verification error:', error)
    return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 })
  }
} 