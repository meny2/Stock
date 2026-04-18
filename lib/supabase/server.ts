import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies() // ✅ ต้องใช้ await สำหรับ Next.js 15

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // ใน Server Components บางครั้งเราไม่สามารถ set cookies ได้โดยตรง
          // แต่เราใส่ try-catch ไว้เพื่อป้องกัน error ใน Middleware หรือ Action
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // คุกกี้อาจจะถูกเซ็ตจาก Server Component ไม่ได้ในบางจังหวะ (ข้ามได้)
          }
        },
      },
    }
  )
}
