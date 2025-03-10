'use client'
import { useState, useEffect } from 'react'
import { getFirestore, collection, onSnapshot } from 'firebase/firestore'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const db = getFirestore();

interface User {
  id: string
  userId: number
  name?: string
  email?: string
  phoneNumber?: string
  verified: boolean
  registrationDate: string
  products: string
  securityLevel: string
  documents: string
  accountAgent: string
  dateOfBirth: string
  nationality: string
  editing?: boolean  // To track edit mode for each user
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<Partial<User>>({})
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

  const handleEdit = (userId: string) => {
    setUsers(users.map(user => ({
      ...user,
      editing: user.id === userId ? true : false
    })))
  }

  const handleSave = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          updates: editingUser
        })
      })

      if (!response.ok) throw new Error('Failed to update user')
      
      setUsers(users.map(user => ({
        ...user,
        ...(user.id === userId ? editingUser : {}),
        editing: false
      })))
      setEditingUser({})
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleCancel = (userId: string) => {
    setUsers(users.map(user => ({
      ...user,
      editing: false
    })))
    setEditingUser({})
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
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Products</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 text-white">#{user.userId}</td>
                    <td className="py-4 text-white">{user.name}</td>
                    <td className="py-4 text-white">{user.email}</td>
                    <td className="py-4 text-white">{user.phoneNumber}</td>
                    <td className="py-4 text-white">{user.products}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.verified 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {user.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 space-x-2">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="px-3 py-1 bg-[#00ffd5] text-black rounded-full text-sm hover:bg-[#00e6c0] transition-all"
                      >
                        Edit Details
                      </button>
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

            {/* Edit Modal */}
            {users.find(u => u.editing) && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="relative bg-[#111] rounded-3xl p-8 max-w-md w-full my-8">
                  <h2 className="text-xl font-bold text-white mb-6">Edit User Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Account Agent
                      </label>
                      <input
                        type="text"
                        value={editingUser.accountAgent || ''}
                        onChange={(e) => setEditingUser({...editingUser, accountAgent: e.target.value})}
                        className="w-full bg-[#222] text-white px-3 py-2 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Date of Birth / Incorporate
                      </label>
                      <input
                        type="text"
                        value={editingUser.dateOfBirth || ''}
                        onChange={(e) => setEditingUser({...editingUser, dateOfBirth: e.target.value})}
                        className="w-full bg-[#222] text-white px-3 py-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Nationality / Based
                      </label>
                      <input
                        type="text"
                        value={editingUser.nationality || ''}
                        onChange={(e) => setEditingUser({...editingUser, nationality: e.target.value})}
                        className="w-full bg-[#222] text-white px-3 py-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Documents
                      </label>
                      <input
                        type="text"
                        value={editingUser.documents || ''}
                        onChange={(e) => setEditingUser({...editingUser, documents: e.target.value})}
                        className="w-full bg-[#222] text-white px-3 py-2 rounded"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                      <button
                        onClick={() => handleCancel(users.find(u => u.editing)?.id!)}
                        className="px-4 py-2 bg-red-500 text-black rounded-full text-sm hover:bg-red-400 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(users.find(u => u.editing)?.id!)}
                        className="px-4 py-2 bg-green-500 text-black rounded-full text-sm hover:bg-green-400 transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}