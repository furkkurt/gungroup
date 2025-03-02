'use client'
import { useState, useEffect } from 'react'
import { getRealTimeForexRate, ForexQuote } from '@/services/forexService'
import ForexChart from './ForexChart'
import { CURRENCY_PAIRS } from '@/constants/forex'
import type { FirebaseError } from '@/types/firebase'

export default function ForexDashboard() {
  const [selectedPair, setSelectedPair] = useState(CURRENCY_PAIRS[0])
  const [quotes, setQuotes] = useState<ForexQuote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchQuotes = async () => {
      try {
        const results = []
        for (const pair of CURRENCY_PAIRS) {
          if (!mounted) return

          try {
            const quote = await getRealTimeForexRate(pair.from, pair.to)
            results.push(quote)
            if (mounted) {
              setQuotes(prev => [...prev, quote])
            }
            await new Promise(resolve => setTimeout(resolve, 2000))
          } catch (err: unknown) {
            const error = err as FirebaseError
            console.error(`Error fetching ${pair.from}/${pair.to}:`, error)
          }
        }

        if (results.length === 0 && mounted) {
          throw new Error('Unable to fetch any forex data')
        }
      } catch (err: unknown) {
        const error = err as FirebaseError
        if (mounted) {
          setErrorMessage(error.message)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    setQuotes([])
    fetchQuotes()

    // Refresh every 5 minutes
    const interval = setInterval(fetchQuotes, 300000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (errorMessage) {
    return <div>{errorMessage}</div>
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Live Exchange Rates</h2>

      <div>
        {/* Currency Pair Selector */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {CURRENCY_PAIRS.map((pair) => (
            <button
              key={`${pair.from}-${pair.to}`}
              onClick={() => setSelectedPair(pair)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedPair === pair
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {pair.name}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <ForexChart 
            fromCurrency={selectedPair.from} 
            toCurrency={selectedPair.to} 
          />
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CURRENCY_PAIRS.map(pair => {
          const quote = quotes.find(q => 
            q.fromCurrency === pair.from && q.toCurrency === pair.to
          )
          return (
            <div 
              key={`${pair.from}-${pair.to}`}
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-200">{pair.name}</h3>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                  Live
                </span>
              </div>
              <div className="mt-2">
                <span className="text-4xl font-bold text-blue-400">
                  {quote?.exchangeRate.toFixed(4) || '...'}
                </span>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                Last updated: {quote ? new Date(quote.lastRefreshed).toLocaleString('tr-TR') : '...'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 