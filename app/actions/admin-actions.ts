"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function adminChangeUserPassword(userId: string, newPassword: string) {
  const supabaseAdmin = createAdminClient()
  
  // ใช้ Admin API ในการอัปเดต User โดยตรงผ่าน ID
  const { data, error } = await (await supabaseAdmin).auth.admin.updateUserById(
    userId,
    { password: newPassword }
  )

  if (error) {
    return { success: false, message: error.message }
  }

  // เคลียร์ Cache หน้าที่เกี่ยวข้อง (ถ้ามี)
  revalidatePath('/admin/users') 
  
  return { success: true, message: "Password updated successfully" }
}
