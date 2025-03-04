'use client'
import { useState } from 'react'
import ForexChart from './ForexChart'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useForexData } from '@/hooks/useForexData'
import Link from 'next/link'

const FOREX_DATA = [
  {
    symbol: 'EURJPY',
    subText: 'EURJPY',
    flag1: '🇪🇺',
    flag2: '🇯🇵',
    bid: '156.823',
    ask: '156.847',
    spread: '3'
  },
  {
    symbol: 'EURUSD',
    subText: 'EURUSD',
    flag1: '🇪🇺',
    flag2: '🇺🇸',
    bid: '1.04902',
    ask: '1.04919',
    spread: '2.1'
  },
  {
    symbol: 'GBPJPY',
    subText: 'GBPJPY',
    flag1: '🇬🇧',
    flag2: '🇯🇵',
    bid: '189.95',
    ask: '189.97',
    spread: '2.6'
  },
  {
    symbol: 'GBPUSD',
    subText: 'GBPUSD',
    flag1: '🇬🇧',
    flag2: '🇺🇸',
    bid: '1.27058',
    ask: '1.27078',
    spread: '2.4'
  },
  {
    symbol: 'USDCAD',
    subText: 'USDCAD',
    flag1: '🇺🇸',
    flag2: '🇨🇦',
    bid: '1.44822',
    ask: '1.44846',
    spread: '3'
  },
  {
    symbol: 'USDJPY',
    subText: 'USDJPY',
    flag1: '🇺🇸',
    flag2: '🇯🇵',
    bid: '149.485',
    ask: '149.506',
    spread: '2.7'
  }
]

const TRADING_CARDS = [
  {
    title: 'Indices',
    description: 'Gain instant access and trade indices from across the globe, including US500, UK100, and more. Trade with leverage up to 1:100 and low spreads',
    image: '/newindicescardbg.webp',
    href: '/indices'
  },
  {
    title: 'Commodities',
    description: 'Our leading trading platform offers Gold, Oil, Silver, Gas, and many other commodities.',
    image: '/newcomm.webp',
    href: '/commodities'
  },
  {
    title: 'Stocks',
    description: 'Trade Leveraged products on shares of the biggest companies in the world, including Apple, Microsoft, Tesla, Facebook, Netflix, and Amazon.',
    image: '/newstock.webp',
    href: '/stocks'
  },
  {
    title: 'Crypto',
    description: "Trade the world's most popular cryptocurrencies with 10x leverage",
    image: '/newcrypto.webp',
    href: '/crypto'
  },
  {
    title: 'Forex',
    description: "Trade the world's most popular currency leverage products",
    image: '/newforexphoto.webp',
    href: '/forex'
  }
]

export default function ForexDashboard() {
  const [isChartVisible, setIsChartVisible] = useState(true)
  const [selectedPair, setSelectedPair] = useState('EURUSD')

  return (
    <div className="w-full bg-black p-4">
      {/* Forex Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-left">
              <th className="py-3 px-4">Symbol</th>
              <th className="py-3 px-4">BID</th>
              <th className="py-3 px-4">Ask</th>
              <th className="py-3 px-4">
                SPREAD
              </th>
            </tr>
          </thead>
          <tbody>
            {FOREX_DATA.map((pair) => (
              <tr
                key={pair.symbol}
                className="border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                onClick={() => setSelectedPair(pair.symbol)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1">
                      <span className="text-2xl">{pair.flag1}</span>
                      <span className="text-2xl">{pair.flag2}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{pair.symbol}</div>
                      <div className="text-gray-400 text-sm">{pair.subText}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-white">{pair.bid}</td>
                <td className="py-3 px-4 text-white">{pair.ask}</td>
                <td className="py-3 px-auto text-white">{pair.spread}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 