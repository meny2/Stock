// app/switch-shop/route.ts
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const shopId = searchParams.get('shop_id')

  if (!shopId) {
    return NextResponse.redirect(new URL('/shop', req.url))
  }

  const res = NextResponse.redirect(new URL(`/dashboard/${shopId}`, req.url))
  // ✅ set cookie
  res.cookies.set('last_shop_id', shopId, {
    path: '/',
    httpOnly: false, // client อ่านได้ (optional)
    maxAge: 60 * 60 * 24 * 30, // 30 วัน
  })

  return res
}