import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'

const db = getFirestore()

export async function POST(req: NextRequest) {
  try {
    const { userId, updates } = await req.json()

    // Remove any fields that shouldn't be updated
    const safeUpdates = { ...updates }
    delete safeUpdates.id
    delete safeUpdates.userId
    delete safeUpdates.email
    delete safeUpdates.phoneNumber
    delete safeUpdates.registrationDate
    delete safeUpdates.editing

    // Update verification document
    await db.collection('verification').doc(userId).update(safeUpdates)

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Admin update error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
} 