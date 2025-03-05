'use client'
import { useState, useEffect } from 'react'
import { getFirestore, collection, onSnapshot } from 'firebase/firestore'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const db = getFirestore();

interface User {
  id: string
  name?: string
  email?: string
  phoneNumber?: string
  verified: boolean
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState('')
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === '123456') {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Invalid password')
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/get-users')
        const data = await response.json()
        if (data.users) {
          setUsers(data.users)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
    
    // Listen for real-time updates
    const unsubscribe = onSnapshot(collection(db, 'verification'), () => {
      fetchUsers()
    })

    return () => unsubscribe()
  }, [isAuthenticated])

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to verify user')
      }
    } catch (error) {
      console.error('Error verifying user:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full bg-[#111] rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#00ffd5] text-black rounded-full hover:bg-[#00e6c0] transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-[#111] rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800">
                    <td className="py-4 text-white">{user.name}</td>
                    <td className="py-4 text-white">{user.email}</td>
                    <td className="py-4 text-white">{user.phoneNumber}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.verified 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {user.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4">
                      {!user.verified && (
                        <button
                          onClick={() => handleVerifyUser(user.id)}
                          className="px-3 py-1 bg-[#00ffd5] text-black rounded-full text-sm hover:bg-[#00e6c0] transition-all"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}