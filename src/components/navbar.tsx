"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Menu, LogOutIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const { session, supabase, user, loading } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }
  
  if (loading) return null

  return (
    <header className="sticky top-0 z-50 border-b bg-background text-foreground">
      <div className="h-16 flex items-center justify-between px-4 max-w-7xl mx-auto">
        <Link href="/" className="font-semibold text-xl tracking-tight">
          MyQuizApp
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex gap-6">
            <NavigationMenuItem>
              <Link href="/">
                <Button variant="ghost" className="text-sm font-medium">Home</Button>
              </Link>
            </NavigationMenuItem>
            {session && (
              <NavigationMenuItem>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-sm font-medium">Dashboard</Button>
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          {!session ? (
            <Link href="/auth">
              <Button variant="outline" >
                <UserIcon className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          ) : (
            <div>
              <p></p>
              <Button variant="outline"  onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Logout
              </Button>
          </div>
          )}
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="mt-6 space-y-4">
                <Link href="/" className="block">Home</Link>
                {session && <Link href="/dashboard" className="block">Dashboard</Link>}
                {!session ? (
                  <Link href="/auth">
                    <Button variant="outline" >
                      <UserIcon className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline"  onClick={handleLogout}>
                  <LogOutIcon className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

