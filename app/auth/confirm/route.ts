// app/auth/confirm/route.ts
export const dynamic = 'force-dynamic'

import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  
  // 1. ดักจับค่าพารามิเตอร์ (รองรับทั้ง token_hash และ code)
  const token_hash = searchParams.get('token_hash')
  const code = searchParams.get('code') // บางครั้ง Supabase ส่งมาเป็น code
  const type = searchParams.get('type') as EmailOtpType | null
  
  // Debug เพื่อดูว่าค่าที่เข้ามาจริงๆ คืออะไร
  console.log("🔍 [Confirm Route] token_hash:", !!token_hash, "code:", !!code, "type:", type);

  // 2. ถ้าเป็น PKCE Flow (ได้มาเป็น code)
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // ถ้าแลก Code สำเร็จ ให้ไปหน้าตั้งรหัสผ่าน
      return redirect(`${origin}/auth/reset-password`)
    }
  }

  // 3. ถ้าเป็น Token Flow (ได้มาเป็น token_hash)
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return redirect(`${origin}/auth/reset-password`)
    }
  }

  // ❌ หากเกิดข้อผิดพลาดหรือไม่มีค่าส่งมา
  console.error("❌ Auth Confirmation Failed");
  return redirect(`${origin}/login?error=confirmation_failed`)
}
