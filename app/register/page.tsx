'use client'
import { useState } from 'react'
import { auth } from '@/lib/firebase'
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  ConfirmationResult,
  updateProfile
} from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FirebaseError, ReCaptchaResponse } from '@/types/firebase'

interface FormData {
  name: string
  surname: string
  email: string
  phone: string
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    surname: '',
    email: '',
    phone: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const setupRecaptcha = async () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }

      const verifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'normal',
          callback: (response: ReCaptchaResponse) => {
            console.log('reCAPTCHA solved with response:', response)
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired')
            setError('reCAPTCHA expired. Please solve it again.')
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear()
              window.recaptchaVerifier = undefined
            }
          }
        }
      )

      await verifier.render()
      return verifier
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError
      console.error('Detailed reCAPTCHA setup error:', firebaseError)
      if (firebaseError.message.includes('are-blocked')) {
        setError('Please enable third-party cookies for reCAPTCHA to work')
      }
      return null
    }
  }

  const sendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const verifier = await setupRecaptcha()
      if (!verifier) {
        setError('Failed to setup verification. Please try again.')
        return
      }

      const formattedPhone = formData.phone.startsWith('+') ? formData.phone : `+90${formData.phone}`
      console.log('Attempting verification for:', formattedPhone)
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier)
      setConfirmationResult(confirmation)
      setStep(2)
      setError('')
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError
      console.error('Phone auth error:', firebaseError)
      setError(firebaseError.message)
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    }
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userCredential = await confirmationResult?.confirm(verificationCode)
      if (userCredential?.user) {
        await updateProfile(userCredential.user, {
          displayName: `${formData.name} ${formData.surname}`
        })
        router.push('/')
      } else {
        throw new Error('Failed to get user credentials')
      }
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError
      setError(firebaseError.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-blue-400">
          Register
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {step === 1 ? (
            <form id="register-form" onSubmit={sendVerificationCode} className="space-y-6">
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

              <div id="recaptcha-container"></div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send Code
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

          {error && (
            <div className="mt-4 text-red-400 text-sm">
              {error}
              {error.includes('third-party cookies') && (
                <div className="mt-2">
                  <a 
                    href="https://support.google.com/accounts/answer/61416"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Learn how to enable third-party cookies
                  </a>
                </div>
              )}
            </div>
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