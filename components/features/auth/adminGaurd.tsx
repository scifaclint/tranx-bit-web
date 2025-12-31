"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores"
import { useRouter } from "next/navigation"
import AdminAuthCode from "@/components/features/auth/admin-auth-code"
import LoadingAnimation from "@/components/features/LoadingAnimation"

interface AdminGuardProps {
    children: React.ReactNode
}
export default function AdminGuard({ children }: AdminGuardProps) {
    const { user, token } = useAuthStore()
    const router = useRouter()

    // Local verification state - in a real app this might be in a session store or easier contexts
    const [isVerified, setIsVerified] = useState(false)
    const [isChecking, setIsChecking] = useState(true)

    // Check basic auth first
    useEffect(() => {
        if (!token) {
            router.back()
        } else {
            // Determine if we need to show the loading screen for any other reason
            // For now, once auth is loaded and user is auth'd, we are done checking
            setIsChecking(false)
        }
    }, [token, router])

    if (isChecking) {
        return <LoadingAnimation />
    }

    if (!token) return null

    if (!isVerified) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <AdminAuthCode onSuccess={() => setIsVerified(true)} />
            </div>
        )
    }

    return <>{children}</>
}
