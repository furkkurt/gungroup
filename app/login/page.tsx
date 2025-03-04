'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhoneInput from 'react-phone-input-2'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import 'react-phone-input-2/lib/style.css'

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber, 
          action: 'login',
          isLogin: true 
        }),
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      // Sign in with the custom token
      if (data.customToken) {
        await signInWithCustomToken(auth, data.customToken)
        router.push('/')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111] py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                Phone Number
              </label>
              <div className="mt-1">
                <PhoneInput
                  country={'tr'}
                  value={phoneNumber}
                  onChange={(phone) => setPhoneNumber('+' + phone)}
                  inputStyle={{
                    width: '100%',
                    height: '42px',
                    fontSize: '1rem',
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #333',
                    color: 'white',
                  }}
                  buttonStyle={{
                    backgroundColor: '#1E1E1E',
                    border: '1px solid #333',
                  }}
                  dropdownStyle={{
                    backgroundColor: '#1E1E1E',
                    color: 'white',
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-black bg-[#00ffd5] hover:bg-[#00e6c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ffd5] transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-300 bg-[#1E1E1E] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
            >
              Register
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-300 bg-[#1E1E1E] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 