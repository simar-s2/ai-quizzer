import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  
  // DEBUG LOGGING - Check what we're receiving
  console.log('==== OAUTH CALLBACK DEBUG ====')
  console.log('Full URL:', requestUrl.href)
  console.log('Origin:', requestUrl.origin)
  console.log('Host:', requestUrl.host)
  console.log('Hostname:', requestUrl.hostname)
  console.log('Referer:', request.headers.get('referer'))
  console.log('==============================')
  
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.error('Error setting cookies:', error)
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      const origin = requestUrl.origin
      return NextResponse.redirect(new URL('/auth?error=auth_callback_error', origin))
    }
  }

  // Use the request's origin instead of request.url
  const origin = requestUrl.origin
  const redirectUrl = new URL(next, origin)
  
  console.log('Final redirect URL:', redirectUrl.href)
  
  return NextResponse.redirect(redirectUrl)
}
