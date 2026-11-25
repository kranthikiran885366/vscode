"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function EditorRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const projectId = searchParams.get("projectId")
    router.replace(projectId ? `/editor-enhanced?projectId=${projectId}` : "/dashboard")
  }, [router, searchParams])

  return null
}

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <EditorRedirect />
    </Suspense>
  )
}
