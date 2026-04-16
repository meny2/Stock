import { createClient } from '@/lib/supabase/server' // สร้าง helper ไว้ตาม doc supabase
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { email, password } = await req.json()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ! กรุณาเช็ค Email" })
}
