'use client'
import ForexDashboard from '@/components/ForexDashboard'
import TradeOnGo from '@/components/TradeOnGo'
import GetStartedSteps from '@/components/GetStartedSteps'
import Newsletter from '@/components/Newsletter'
import Achievements from '@/components/Achievements'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import Header from '@/components/Header'
import ForexChart from '@/components/ForexChart'
import Solutions from '@/components/Solutions'
import AccountTypes from '@/components/AccountTypes'
import TradingJourney from '@/components/TradingJourney'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <div className="w-5/6 mx-auto">
        <Header />
        <Hero />
        <ForexDashboard />
        <ForexChart fromCurrency="EUR" toCurrency="USD" />
        <ForexChart fromCurrency="EUR" toCurrency="JPY" />
        <Solutions />
        <TradingJourney />
        <AccountTypes />
        <TradeOnGo />
        <GetStartedSteps />
        <Newsletter />
        <Achievements />
        <Footer />
      </div>
    </main>
  )
}
