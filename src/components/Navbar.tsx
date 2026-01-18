"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, Home, LayoutDashboard, Zap, Sun, Moon, Settings, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Navbar() {
  const { session, user, loading, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    await signOut()
  }

  if (loading) return null

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-foreground">Quizzera</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Home
              </Button>
            </Link>
            {session && (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Button>
              </Link>
            )}
            <Link href="/help">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Help
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {!session ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/#quiz-generator">
                <Button size="sm" className="gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  New Quiz
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Free Plan</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex items-center gap-2.5 mb-8">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">Quizzera</span>
              </div>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Home</span>
                </Link>
                {session && (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </>
                )}
                <Link
                  href="/help"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Help</span>
                </Link>
                <div className="pt-4 mt-4 border-t space-y-3">
                  {!session ? (
                    <Link href="/auth">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  ) : (
                    <>
                      <div className="px-3 py-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
                        <p className="text-sm font-medium truncate">{user?.email}</p>
                      </div>
                      <Button variant="outline" onClick={handleLogout} className="w-full gap-2 bg-transparent">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
