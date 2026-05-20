'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LandingPage from './landing'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    if (token) {
      // Redirect to editor if logged in
      router.push('/editor')
    }
  }, [router])

  // Show landing page by default
  return <LandingPage />
}
