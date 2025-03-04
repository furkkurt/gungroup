'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user)
    })
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('user')
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navItems = [
    { name: 'Markets', href: '/markets', items: ['Forex', 'Stocks', 'Indices', 'Commodities', 'Crypto'] },
    { name: 'Account', href: '/account', items: ['Live Account', 'Demo Account', 'Account Types'] },
    { name: 'Learn to Trade', href: '/learn', items: ['Trading Guides', 'Market Analysis', 'Trading Tools'] },
    { name: 'Partners', href: '/partners', items: ['Affiliate Program', 'IB Program', 'White Label'] },
    { name: 'About', href: '/about', items: ['Company', 'Regulation', 'Contact Us'] },
  ]

  return (
    <nav className="bg-black/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#00ffd5] hover:text-[#00e6c0] transition-colors">
              GunGroup
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`${
                    pathname === '/' 
                      ? 'border-[#00ffd5] text-white'
                      : 'border-transparent text-gray-300 hover:text-[#00ffd5]'
                  } px-3 py-2 text-sm font-medium transition-colors`}
                >
                  {item.name}
                </Link>
                {/* Dropdown */}
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[#111] ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem}
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#00ffd5] hover:text-black transition-colors"
                      >
                        {subItem}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-all transform hover:scale-105"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-[#00ffd5] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-black bg-[#00ffd5] hover:bg-[#00e6c0] rounded-full transition-all transform hover:scale-105"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-[#00ffd5] focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:hidden bg-[#111]`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <div key={item.name}>
              <Link
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[#00ffd5]"
              >
                {item.name}
              </Link>
              {item.items.map((subItem) => (
                <Link
                  key={subItem}
                  href="#"
                  className="block px-6 py-2 text-sm text-gray-400 hover:text-[#00ffd5]"
                >
                  {subItem}
                </Link>
              ))}
            </div>
          ))}
          {/* Mobile Auth Buttons */}
          <div className="pt-4 pb-3 border-t border-gray-700">
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-500 hover:text-red-400"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[#00ffd5]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 text-base font-medium text-black bg-[#00ffd5] hover:bg-[#00e6c0] rounded-full mt-2"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 