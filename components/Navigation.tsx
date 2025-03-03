'use client'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'

export default function Navigation() {
  const { user, signOut } = useUser()

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
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          GunGroup
        </Link>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => scrollToSection('top')} 
            className="text-white hover:text-gray-300"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="text-white hover:text-gray-300"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('subsidiaries')}
            className="text-white hover:text-gray-300"
          >
            Subsidiaries
          </button>
          {user ? (
            <>
              <span className="text-white">
                {user.displayName || user.phoneNumber}
              </span>
              <button
                onClick={signOut}
                className="text-white hover:text-gray-300"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white hover:text-gray-300"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-white hover:text-gray-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 