'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * 1. เพิ่มสมาชิกใหม่ (ส่ง Invite ทางอีเมล + บันทึกสิทธิ์)
 */
export async function addMember(payload: {
  email: string,
  shopId: string,
  roleId: string,
  branchIds: string[],
  status: 'active' | 'inactive'
}) {
  try {
    const supabaseAdmin = await createAdminClient()

    /* ---------------------------------------------------------
     * 🚩 ส่วนที่แก้ไข: เปลี่ยนจาก Fix Password เป็นการส่ง Invite
     * --------------------------------------------------------- */
    
    // ส่งอีเมลเชิญเพื่อให้พนักงานตั้งรหัสผ่านเอง
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      payload.email,
      {
        data: { invited_by_shop: payload.shopId },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password` // ถ้าต้องการระบุหน้าที่จะให้พนักงานไปหลังกดยอมรับ
      }
    )

    /* ---------------------------------------------------------
     * [COMMENTED] โค้ดเดิมสำหรับสร้าง User แบบระบุรหัสผ่านโดยตรง
     * ---------------------------------------------------------
     * const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
     *   email: payload.email,
     *   password: 'ChangeMe1234!', 
     *   email_confirm: true,
     *   user_metadata: { invited_by_shop: payload.shopId }
     * })
     * --------------------------------------------------------- */

    let userId: string

    if (inviteError) {
      // กรณีมี User อยู่แล้ว (เคยถูกเชิญหรือสมัครไว้แล้ว)
      if (inviteError.message.includes("already registered") || inviteError.message.includes("already invited")) {
        const supabase = await createClient(); 
        
        // ค้นหา ID จาก Table auth.users (ผ่าน Admin API)
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = usersData.users.find(u => u.email === payload.email)
        
        if (!existingUser) throw new Error("ไม่พบข้อมูลผู้ใช้งานเดิมในระบบ")
        userId = existingUser.id
      } else {
        throw new Error(`ส่งอีเมลเชิญไม่สำเร็จ: ${inviteError.message}`)
      }
    } else {
      userId = inviteData.user.id
      console.log('--------------------------------------------------')
      console.log('✅ ส่งคำเชิญสำเร็จ:', payload.email)
      console.log('📧 ระบบส่ง Link ตั้งรหัสผ่านไปที่อีเมลพนักงานแล้ว')
      console.log('--------------------------------------------------')
    }

    // --- ส่วนที่ 2: บันทึกสิทธิ์ (user_shop / user_branches) ---
    const supabase = await createClient()

    const { error: shopError } = await supabase
      .from('user_shop')
      .upsert({
        user_id: userId,
        shop_id: payload.shopId,
        role_id: payload.roleId,
        status: payload.status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, shop_id' })

    if (shopError) throw new Error(`ผูกสิทธิ์ร้านค้าไม่สำเร็จ: ${shopError.message}`)

    await updateUserBranches(userId, payload.shopId, payload.branchIds)

    revalidatePath(`/dashboard/${payload.shopId}/settings/users`)
    return { success: true, userId: userId }

  } catch (error) {
    console.error("🔥 Add Member Error:", error instanceof Error ? error.message : error);
    throw new Error(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * 2. บันทึกหรือแก้ไขสิทธิ์ผู้ใช้งาน
 */
export async function saveUserAccess(payload: {
  userId: string,
  shopId: string,
  roleId: string,
  branchIds: string[],
  status?: string
}) {
  const supabase = await createClient()

  const { error: shopError } = await supabase
    .from('user_shop')
    .update({ 
      role_id: payload.roleId,
      status: payload.status || 'active',
      updated_at: new Date().toISOString() 
    })
    .match({ user_id: payload.userId, shop_id: payload.shopId })

  if (shopError) throw new Error(`ไม่สามารถอัปเดตสิทธิ์ร้านค้า: ${shopError.message}`)

  await updateUserBranches(payload.userId, payload.shopId, payload.branchIds)
  revalidatePath(`/dashboard/${payload.shopId}/settings/users`)
  return { success: true }
}

/**
 * 3. จัดการสาขา (Helper)
 */
async function updateUserBranches(userId: string, shopId: string, branchIds: string[]) {
  const supabase = await createClient()
  await supabase.from('user_branches').delete().match({ user_id: userId, shop_id: shopId })

  if (branchIds.length > 0) {
    const branchEntries = branchIds.map(bId => ({
      user_id: userId,
      shop_id: shopId,
      branch_id: bId,
      assigned_at: new Date().toISOString()
    }))
    await supabase.from('user_branches').insert(branchEntries)
  }
}

/**
 * 4. ลบสมาชิก
 */
export async function removeMember(id: string, shopId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('user_shop').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/settings/users`)
  return { success: true }
}
