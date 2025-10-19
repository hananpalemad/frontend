'use client'
import { useState, useEffect } from 'react'
import api from '@/utils/api'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'
import PostList from '@/components/PostList'
import CreatePost from '@/components/CreatePost'

interface User {
  id: number
  username: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/check-auth/')
      if (response.data.authenticated) {
        setUser(response.data.user)
      }
    } catch {
      console.error('Auth check failed')
    }
  }

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      console.log('Logging out...')
      await api.post('/auth/logout/')
      console.log('Logout successful')
      setUser(null)
      setShowCreatePost(false)
    } catch {
      console.error('Logout failed')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Campus Creatives</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Create Post
                  </button>
                  <span className="text-gray-700">Welcome, {user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowRegister(false)}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {!user ? (
          showRegister ? (
            <RegisterForm onSuccess={handleLogin} />
          ) : (
            <LoginForm onSuccess={handleLogin} />
          )
        ) : (
          <>
            {showCreatePost && (
              <CreatePost
                onClose={() => setShowCreatePost(false)}
                onPostCreated={() => {
                  setShowCreatePost(false)
                  window.location.reload()
                }}
              />
            )}
            <PostList user={user} />
          </>
        )}
      </div>
    </main>
  )
}