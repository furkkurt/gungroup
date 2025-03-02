'use client'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

export default function Navigation() {
  const { user, loading } = useUser()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-anton text-blue-400">Gün Group</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => scrollToSection('top')} 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('subsidiaries')}
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Subsidiaries
            </button>
            <div className="ml-4 flex items-center space-x-3">
              {loading ? (
                <div className="animate-pulse bg-gray-700 h-8 w-24 rounded-lg"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">
                    Welcome, <span className="text-blue-400">{user.displayName || 'User'}</span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-red-400 hover:text-red-300"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 border border-blue-400 hover:border-blue-300 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 