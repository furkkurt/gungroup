'use client'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import Header from './Header'
import Footer from './Footer'
import ForexChart from './ForexChart'
import ForexDashboard from './ForexDashboard'

export default function Dashboard() {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.displayName) {
        setUserName(user.displayName)
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <main className="min-h-screen bg-black">
    <Header />
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-[#111] rounded-3xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-6">
            Welcome, {userName}
          </h1>
          <p className="text-gray-400">
            This is your personal trading dashboard. More features coming soon!
            </p>
          </div>
        </div>
        <div className='w-5/6 mx-auto'>
          <ForexDashboard />
          <ForexChart fromCurrency="USD" toCurrency="EUR" />
        </div>
      </div>
      <Footer />
    </main>
  )
} 