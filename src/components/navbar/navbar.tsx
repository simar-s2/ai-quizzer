"use client"

import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import { NavMenu } from "./nav-menu"
import { NavigationSheet } from "./navigation-sheet"
import Link from "next/link"
import { SunIcon } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"

const Navbar = () => {
  const { session, supabase, user, loading } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Optional: redirect or refresh
    location.reload()
  }
  if (loading) return null;
  
  else return (
    <nav className="h-16 sticky z-50 top-0 bg-gradient-to-r from-white via-slate-50 to-white shadow-sm border-b">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo />
          {/* Desktop Menu */}
          <NavMenu className="hidden md:block" />
        </div>

        <div className="flex items-center gap-3">
        {!session ? (
          // Show login/signup if not logged in
          <Link href={"/auth"}>
            <Button variant="default" className="hidden sm:inline-flex">
              Login / Sign up
            </Button>
          </Link>
        ) : (
          // Show logout if logged in
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        )}

          <Button size="icon" variant="outline">
            <SunIcon />
          </Button>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
