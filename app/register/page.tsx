'use client'
import { useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { signInWithCustomToken } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const sendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      let formattedPhone = formData.phone.trim()
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.startsWith('0') 
          ? `+90${formattedPhone.substring(1)}` 
          : `+90${formattedPhone}`
      }

      console.log('Sending verification to:', formattedPhone)
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          action: 'send',
          firstName: formData.name,
          lastName: formData.surname,
          email: formData.email
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error response:', errorText)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.status === 'pending') {
        // Store the customToken and uid for later use
        if (data.customToken) {
          localStorage.setItem('firebaseCustomToken', data.customToken)
        }
        if (data.uid) {
          localStorage.setItem('userId', data.uid)
        }
        
        console.log('Setting step to 2') // Debug log
        setStep(2) // Change to verification step
        setError('')
      } else if (data.error) {
        throw new Error(data.details || data.error)
      } else {
        throw new Error('Failed to send verification code')
      }
    } catch (err) {
      console.error('SMS error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    console.log('=== Starting Verification ===')

    try {
      console.log('Sending verification request...')
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formData.phone,
          code: verificationCode,
          action: 'verify'
        })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.valid) {
        console.log('Verification successful, getting custom token...')
        const customToken = localStorage.getItem('firebaseCustomToken')
        if (!customToken) {
          throw new Error('Authentication token not found')
        }

        console.log('Signing in with custom token...')
        try {
          // Sign out first to clear any existing auth state
          await auth.signOut()
          
          // Sign in with the custom token
          const userCredential = await signInWithCustomToken(auth, customToken)
          console.log('Sign in successful:', userCredential.user)
          
          localStorage.removeItem('firebaseCustomToken')
          
          const user = {
            phoneNumber: formData.phone,
            displayName: `${formData.name} ${formData.surname}`,
            uid: data.uid
          }
          localStorage.setItem('user', JSON.stringify(user))

          // Use router instead of window.location
          router.push('/')
        } catch (signInError) {
          console.error('Sign in error details:', signInError)
          // Log more details about the error
          if (signInError instanceof Error) {
            console.error('Error name:', signInError.name)
            console.error('Error message:', signInError.message)
            console.error('Error stack:', signInError.stack)
          }
          throw new Error('Failed to sign in with custom token')
        }
      } else {
        setError(data.error || 'Invalid verification code')
      }
    } catch (err) {
      console.error('=== Verification Error ===')
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to verify code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-blue-400">
          Register
        </h2>
      </div>

      {error && (
        <div className="mt-2 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {step === 1 ? (
            <form onSubmit={sendVerificationCode} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="surname" className="block text-sm font-medium text-gray-300">
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    required
                    value={formData.surname}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter verification code"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Verify and Register
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Sign In
              </Link>
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 