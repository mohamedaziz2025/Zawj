import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api/auth'

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token && !isAuthenticated) {
        try {
          const userData = await authApi.getCurrentUser()
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('accessToken')
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [isAuthenticated, setUser, setLoading])

  return { user, isAuthenticated, isLoading }
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  return { isAuthenticated, isLoading }
}