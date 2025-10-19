'use client'
import { useState, useEffect } from 'react'
import api from '@/utils/api'

interface User {
  id: number
  username: string
}

interface Post {
  id: number
  user: User
  title: string
  content: string
  content_type: string
  image: string | null
  created_at: string
  likes_count: number
  is_liked: boolean
  comments: Comment[]
}

interface Comment {
  id: number
  user: User
  content: string
  created_at: string
}

interface PostListProps {
  user: User
}

export default function PostList({ user }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts/')
      setPosts(response.data)
    } catch (error: any) {
      console.error('Failed to fetch posts:', error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: number) => {
    try {
      await api.post(`/posts/${postId}/like/`)
      fetchPosts() // Refresh posts to update like status
    } catch (error: any) {
      console.error('Failed to like post:', error.response?.data || error.message)
    }
  }

  const handleDelete = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${postId}/`)
        fetchPosts() // Refresh posts
      } catch (error: any) {
        console.error('Failed to delete post:', error.response?.data || error.message)
      }
    }
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setEditTitle(post.title)
    setEditContent(post.content)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPost) return

    try {
      await api.put(`/posts/${editingPost.id}/`, {
        title: editTitle,
        content: editContent,
        content_type: editingPost.content_type
      })
      setEditingPost(null)
      fetchPosts() // Refresh posts
    } catch (error: any) {
      console.error('Failed to update post:', error.response?.data || error.message)
    }
  }

  const cancelEdit = () => {
    setEditingPost(null)
    setEditTitle('')
    setEditContent('')
  }

  if (loading) {
    return <div className="text-center">Loading posts...</div>
  }

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="text-center text-gray-500">
          No posts yet. Be the first to create one!
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            {editingPost?.id === post.id ? (
              // Edit Form
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Content
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // Post Display
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                    <p className="text-sm text-gray-600">
                      By {post.user.username} • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {post.user.id === user.id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                
                {post.image && (
                  <div className="mb-4">
                    <img 
                      src={post.image}
                      alt={post.title}
                      className="max-w-full h-auto rounded-lg max-h-96 object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', post.image);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      onLoad={() => console.log('Image loaded successfully:', post.image)}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-4 border-t pt-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 ${
                      post.is_liked ? 'text-red-500' : 'text-gray-500'
                    }`}
                  >
                    <span className="text-lg">❤️</span>
                    <span>{post.likes_count}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  )
}