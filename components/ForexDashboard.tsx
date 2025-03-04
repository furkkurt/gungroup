'use client'
import { useState } from 'react'

export default function ForexDashboard() {
  const [isChartVisible] = useState(true)
  const [selectedPair] = useState('EURUSD')

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