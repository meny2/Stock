'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createBranch(formData: FormData) {
  const supabase = await createClient();
  
  const shopId = parseInt(formData.get('shop_id') as string);
  const branchName = formData.get('branch_name') as string;
  const branchCode = formData.get('branch_code') as string;
  const isMainBranch = formData.get('is_main_branch') === 'true';

  try {
    // --- Logic ข้อ 3: จัดการ is_main_branch ---
    if (isMainBranch) {
      // ถ้าตัวใหม่จะเป็นสาขาหลัก ให้ไปปลดสาขาหลักตัวเก่าของร้านนี้ออกก่อน
      await supabase
        .from('branches')
        .update({ is_main_branch: false })
        .eq('shop_id', shopId)
        .eq('is_main_branch', true);
    }

    // --- Insert ข้อมูลใหม่ ---
    const { error } = await supabase
      .from('branches')
      .insert([{
        shop_id: shopId,
        branch_name: branchName,
        branch_code: branchCode,
        location_address: formData.get('location_address'),
        is_main_branch: isMainBranch
      }]);

    if (error) {
      // ถ้า Error เพราะติด Unique Constraint (ข้อ 1)
      if (error.code === '23505') return { error: 'รหัสสาขานี้มีอยู่แล้วในระบบ' };
      throw error;
    }

    revalidatePath(`/dashboard/${shopId}`); // Update หน้าจอทันที
    return { success: true };

  } catch (err) {
    console.error(err);
    return { error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' };
  }
}
