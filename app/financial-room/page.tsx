'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarketTicker from '@/components/MarketTicker'
import TradingViewChart from '@/components/TradingViewChart'
import MarketEvents from '@/components/MarketEvents'
import MarketTimeline from '@/components/MarketTimeline'

export default function FinancialRoom() {
  const [activeTab] = useState('financial')
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex space-x-4">
          <Link
            href="/dashboard"
            className="px-6 py-2 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-all"
          >
            Dashboard
          </Link>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'financial'
                ? 'bg-[#00ffd5] text-black'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Financial Room
          </button>
        </div>
      </div>

      {/* Market Ticker */}
      <div className="mt-8 mb-12">
        <MarketTicker />
      </div>

      {/* Trading Chart */}
      <div className="mb-12">
        <TradingViewChart />
      </div>

      {/* Market Widgets */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MarketEvents />
          <MarketTimeline />
        </div>
      </div>

      <Footer />
    </main>
  )
} 