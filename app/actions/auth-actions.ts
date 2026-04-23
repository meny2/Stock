"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function forceChangePasswordByEmail(email: string, newPassword: string) {
  const supabaseAdmin = createAdminClient()

  // 1. ค้นหา User ID จาก Email ก่อน
  const { data: userData, error: findError } = await (await supabaseAdmin).auth.admin.listUsers()
  
  if (findError) return { success: false, message: "ไม่สามารถเชื่อมต่อระบบได้" }

  const targetUser = userData.users.find(u => u.email === email)

  if (!targetUser) {
    return { success: false, message: "ไม่พบอีเมลนี้ในระบบ" }
  }

  // 2. สั่งอัปเดตรหัสผ่านโดยใช้ ID ที่หาได้
  const { error: updateError } = await (await supabaseAdmin).auth.admin.updateUserById(
    targetUser.id,
    { password: newPassword }
  )

  if (updateError) {
    return { success: false, message: updateError.message }
  }

  return { success: true, message: "เปลี่ยนรหัสผ่านสำเร็จแล้ว" }
}
