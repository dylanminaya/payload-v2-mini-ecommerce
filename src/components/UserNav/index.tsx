'use client'

import { useAuth } from '@/providers/Auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User } from 'lucide-react'

export const UserNav: React.FC = () => {
  const { user } = useAuth()

  // Show user account button if logged in
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="flex items-center gap-2">
          <Link href="/account">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">
              {user.name || user.email?.split('@')[0] || 'Account'}
            </span>
          </Link>
        </Button>
      </div>
    )
  }

  // Show login/signup buttons for logged out or loading states
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm" className="text-sm">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild size="sm" className="text-sm">
        <Link href="/create-account">Sign Up</Link>
      </Button>
    </div>
  )
}
