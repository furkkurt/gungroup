'use client'
import { useEffect } from 'react'

export default function TradingViewChart() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true

    // Create the container div first
    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    widgetDiv.style.height = 'calc(100% - 32px)'
    widgetDiv.style.width = '100%'

    // Find the container and add the widget div
    const container = document.getElementsByClassName('tradingview-chart-container')[0]
    if (container) {
      container.appendChild(widgetDiv)
    }

    // Configure the widget
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "symbol": "INDEX:DXY",
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "backgroundColor": "rgba(0, 0, 0, 1)",
      "gridColor": "rgba(42, 46, 57, 0.06)",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com"
    })

    // Add the script after the widget div
    if (container) {
      container.appendChild(script)
    }

    return () => {
      const container = document.getElementsByClassName('tradingview-chart-container')[0]
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="tradingview-chart-container bg-[#1E1E1E] rounded-3xl overflow-hidden" style={{ height: '700px' }}>
        {/* Widget will be injected here */}
      </div>
    </div>
  )
} 