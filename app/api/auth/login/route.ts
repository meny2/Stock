import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { email, password } = await req.json()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // ใน data.session จะมี access_token สำหรับเอาไปใช้ใน Postman
  return NextResponse.json({
    message: "Login success",
    token: data.session.access_token 
  })
}
