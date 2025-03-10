'use client'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'
import Header from './Header'
import Footer from './Footer'
import ForexChart from './ForexChart'
import ForexDashboard from './ForexDashboard'

const db = getFirestore()

interface UserDetails {
  userId: number
  displayName: string | null
  accountAgent: string
  dateOfBirth: string
  products: string
  email: string | null
  phoneNumber: string | null
  registrationDate: string
  documents: string
  securityLevel: string
  nationality: string
}

export default function Dashboard() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Listen to the verification document for additional details
        const verificationDoc = doc(db, 'verification', user.uid)
        const unsubscribeDoc = onSnapshot(verificationDoc, (doc) => {
          if (doc.exists()) {
            const data = doc.data()
            setUserDetails({
              userId: data.userId,
              displayName: user.displayName,
              accountAgent: data.accountAgent,
              dateOfBirth: data.dateOfBirth,
              products: data.products,
              email: user.email,
              phoneNumber: user.phoneNumber,
              registrationDate: data.registrationDate,
              documents: data.documents,
              securityLevel: data.securityLevel,
              nationality: data.nationality
            })
          }
        })

        return () => unsubscribeDoc()
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-[#111] rounded-3xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-8">Account Details</h1>
          
          {userDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400">Account Number</p>
                <p className="text-white text-lg">#{userDetails.userId}</p>
              </div>
              <div>
                <p className="text-gray-400">Account Status</p>
                <p className="text-white text-lg">BASIC</p>
              </div>
              <div>
                <p className="text-gray-400">Personal Name / Company Name</p>
                <p className="text-white text-lg">{userDetails.displayName}</p>
              </div>
              <div>
                <p className="text-gray-400">Account Agent</p>
                <p className="text-white text-lg">{userDetails.accountAgent}</p>
              </div>
              <div>
                <p className="text-gray-400">Date of Birth / Incorporate</p>
                <p className="text-white text-lg">{userDetails.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-gray-400">Products</p>
                <p className="text-white text-lg">{userDetails.products}</p>
              </div>
              <div>
                <p className="text-gray-400">Nationality / Based</p>
                <p className="text-white text-lg">{userDetails.nationality}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white text-lg">{userDetails.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Registration Date</p>
                <p className="text-white text-lg">{new Date(userDetails.registrationDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone Number</p>
                <p className="text-white text-lg">{userDetails.phoneNumber}</p>
              </div>
              <div>
                <p className="text-gray-400">Documents</p>
                <p className="text-white text-lg">{userDetails.documents}</p>
              </div>
              <div>
                <p className="text-gray-400">Security Level</p>
                <p className="text-white text-lg">{userDetails.securityLevel}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
} 