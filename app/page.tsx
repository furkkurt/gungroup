import ForexDashboard from '@/components/ForexDashboard'
import Navigation from '@/components/Navigation'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900" id="top">
      <Navigation />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-blue-600/10 to-gray-900 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">
              Shape Your <span className="text-blue-400">Financial Future</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Forex Dashboard */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <ForexDashboard />
      </div>

      {/* About Section */}
      <section id="about" className="bg-gray-800/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="md:col-span-2 space-y-6 text-gray-300">
              <p>
                Gün Group Holding is a group of companies founded by Mehmet Yahya Gün on June 14, 2024. Gün Group Holding has adopted the principle of pioneering firsts in the field of economics in Turkey and the World by compiling the culture and experiences of different geographies in globalizing markets.
              </p>
              <p>
                Our founder Mehmet Yahya Gün has worked with his imagination and belief in success since childhood, attracting the attention of the world&apos;s leading trade groups with his commercial activities in various regions of the world, different entrepreneurship characteristics, and vision that shapes the future.
              </p>
              <p>
                Gün Group Holding continues to carry out its activities with international standards and social responsibility understanding.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-blue-400/20">
                <Image
                  src="/profile.jpg"
                  alt="Mehmet Yahya Gün"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subsidiaries Section */}
      <section id="subsidiaries" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="md:col-span-1">
              <div className="relative w-full h-80 overflow-visible">
                <Image
                  src="/trading.png"
                  alt="Financial Expert"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-2 rounded-2xl p-8 backdrop-blur-sm">
              <p className="text-gray-300">
                Founded on August 13, 2024, under Gün Group Holding. Financial Expert Financial Consulting Limited Company continues to share its knowledge and experience in the finance sector through consultancy services, with the vision of spreading financial literacy to all layers of society.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@gungroup.com</li>
                <li>Tel: +90 (212) 555 0000</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Exchange Rates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Market Analysis</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">Address</h3>
              <p className="text-gray-400">
                Istanbul, Turkey
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2025 Gün Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
