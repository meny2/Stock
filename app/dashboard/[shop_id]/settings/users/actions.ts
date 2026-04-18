'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * 1. เพิ่มสมาชิกใหม่ (สร้างบัญชีโดยตรง + บันทึกสิทธิ์)
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

    // --- ส่วนที่ 1: สร้างบัญชีพนักงานโดยตรง (ไม่ต้องรออีเมล) ---
    // วิธีนี้ Admin จะเป็นคนกำหนดรหัสผ่านเริ่มต้นให้พนักงานเลย
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: 'ChangeMe1234!', // 🚩 รหัสผ่านเริ่มต้น (พนักงานไปเปลี่ยนเองทีหลังได้)
      email_confirm: true,       // ยืนยันอีเมลให้ทันที ไม่ต้องกดลิงก์
      user_metadata: { invited_by_shop: payload.shopId }
    })

    let userId: string

    if (createError) {
      // กรณีมี User อยู่แล้ว (เคยสมัครไว้แล้ว) ให้ดึง ID มาใช้ต่อ
      if (createError.message.includes("already registered")) {
        const supabase = await createClient(); 
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', payload.email)
          .single()
        
        if (!existingUser) throw new Error("ไม่พบข้อมูลโปรไฟล์เดิมในระบบ")
        userId = existingUser.id
      } else {
        throw new Error(`สร้างพนักงานไม่สำเร็จ: ${createError.message}`)
      }
    } else {
      userId = userData.user.id
      console.log('--------------------------------------------------')
      console.log('✅ สร้างพนักงานสำเร็จ:', payload.email)
      console.log('🔑 รหัสผ่านเริ่มต้นคือ: ChangeMe1234!')
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
