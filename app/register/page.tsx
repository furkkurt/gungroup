'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function Register() {
  const [step, setStep] = useState('details') // 'details' or 'verify'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, action: 'send' }),
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setStep('verify')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: verificationCode,
          action: 'verify'
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
      setError(error instanceof Error ? error.message : 'Failed to verify code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-white">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111] py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {step === 'details' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ffd5] focus:border-[#00ffd5] bg-[#1E1E1E] text-white sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ffd5] focus:border-[#00ffd5] bg-[#1E1E1E] text-white sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ffd5] focus:border-[#00ffd5] bg-[#1E1E1E] text-white sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                  Phone Number
                </label>
                <div className="mt-1">
                  <PhoneInput
                    country={'tr'}
                    value={formData.phoneNumber}
                    onChange={(phone) => setFormData({ ...formData, phoneNumber: '+' + phone })}
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
                  {isLoading ? 'Sending...' : 'Continue'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ffd5] focus:border-[#00ffd5] bg-[#1E1E1E] text-white sm:text-sm"
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
                  {isLoading ? 'Verifying...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-300 bg-[#1E1E1E] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
            >
              Sign In
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