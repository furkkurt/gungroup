'use client'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { getForexTimeSeries, TimeSeriesData } from '@/services/forexService'
import { CURRENCY_PAIRS } from '@/constants/forex'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ForexChartProps {
  fromCurrency: string
  toCurrency: string
}

export default function ForexChart({ fromCurrency, toCurrency }: ForexChartProps) {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getForexTimeSeries(fromCurrency, toCurrency)
        setTimeSeriesData(data)
        setError('')
      } catch (err) {
        setError('Failed to fetch chart data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fromCurrency, toCurrency])

  const pair = CURRENCY_PAIRS.find(p => p.from === fromCurrency && p.to === toCurrency)
  
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `${pair?.name || `${fromCurrency}/${toCurrency}`} Exchange Rate`,
        color: '#94a3b8'
      }
    },
    scales: {
      x: {
        grid: {
          color: '#1f2937'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      y: {
        grid: {
          color: '#1f2937'
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value: number | string) {
            if (typeof value === 'number') {
              return value.toFixed(4)
            }
            return value
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-gray-400">Loading chart...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/50 text-red-400 rounded-lg">
        Error loading chart: {error}
      </div>
    )
  }

  const chartData = {
    labels: timeSeriesData.map(data => 
      new Date(data.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: `${fromCurrency}/${toCurrency}`,
        data: timeSeriesData.map(data => data.close),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1
      }
    ]
  }

  return (
    <div className="h-[400px] w-full">
      <Line 
        data={chartData} 
        options={options}
        className="bg-gray-800 rounded-lg p-4"
      />
    </div>
  )
} 