import { createClient } from '@/lib/supabase/server';
import { ChevronLeft, Save, Mail, Shield, MapPin, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { saveUserAccess } from '../../actions';
import { redirect } from 'next/navigation';

export default async function EditUserPage({ 
  params 
}: { 
  params: Promise<{ shop_id: string, user_id: string }> 
}) {
  const { shop_id, user_id } = await params;
  const supabase = await createClient();

  // 1. ดึงข้อมูลแบบขนานเพื่อความรวดเร็ว
  const [
    { data: userData, error: userError },
    { data: currentBranches },
    { data: roles },
    { data: branches }
  ] = await Promise.all([
    supabase.from('user_shop').select(`status, role_id, profiles (first_name, last_name, email)`).eq('shop_id', shop_id).eq('user_id', user_id).single(),
    supabase.from('user_branches').select('branch_id').eq('shop_id', shop_id).eq('user_id', user_id),
    supabase.from('roles').select('id, role_name').eq('shop_id', shop_id).is('deleted_at', null),
    supabase.from('branches').select('id, branch_name').eq('shop_id', shop_id).is('deleted_at', null)
  ]);

  if (userError || !userData) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="bg-red-50 p-4 rounded-full text-red-500"><UserCheck size={40} /></div>
        <h2 className="text-xl font-bold text-gray-800">ไม่พบข้อมูลสมาชิก</h2>
        <Link href={`/dashboard/${shop_id}/settings/users`} className="text-blue-600 font-semibold hover:underline">กลับไปหน้ารายชื่อ</Link>
      </div>
    );
  }

  // จัดการข้อมูล Profile (ป้องกัน Array Error)
  const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'ไม่ระบุชื่อ';
  const activeBranchIds = currentBranches?.map(b => b.branch_id) || [];

  async function handleUpdate(formData: FormData) {
    'use server'
    const payload = {
      userId: user_id,
      shopId: shop_id,
      roleId: formData.get('role_id') as string,
      branchIds: formData.getAll('branch_ids') as string[],
      status: formData.get('status') as string
    };

    await saveUserAccess(payload);
    redirect(`/dashboard/${shop_id}/settings/users`);
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href={`/dashboard/${shop_id}/settings/users`}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">แก้ไขข้อมูลสมาชิก</h1>
          <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
            <span className="text-blue-600 font-bold">{fullName}</span> • {profile?.email}
          </p>
        </div>
      </div>

      <form action={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* คอลัมน์ซ้าย: สิทธิ์และสถานะ */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
            
            {/* สถานะ */}
            <div className="space-y-3">
              <label className="text-[13px] font-bold text-gray-700 uppercase flex items-center gap-2 tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                สถานะพนักงาน
              </label>
              <select 
                name="status" 
                defaultValue={userData.status} 
                className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium"
              >
                <option value="active">🟢 ใช้งานปกติ (Active)</option>
                <option value="inactive">⚪ ปิดการใช้งาน (Inactive)</option>
                <option value="suspended">🔴 ระงับการเข้าถึง (Suspended)</option>
              </select>
            </div>

            <hr className="border-gray-100" />

            {/* ระดับสิทธิ์ */}
            <div className="space-y-3">
              <label className="text-[13px] font-bold text-gray-700 uppercase flex items-center gap-2 tracking-wider">
                <Shield size={16} className="text-blue-500" />
                ระดับสิทธิ์การใช้งาน (Role)
              </label>
              <select 
                name="role_id" 
                defaultValue={userData.role_id} 
                required 
                className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium"
              >
                {roles?.map(role => (
                  <option key={role.id} value={role.id}>{role.role_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: สาขา */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col h-full">
            <label className="text-[13px] font-bold text-gray-700 uppercase flex items-center gap-2 tracking-wider mb-5">
              <MapPin size={16} className="text-blue-500" />
              สาขาที่ดูแล ({activeBranchIds.length})
            </label>
            
            <div className="space-y-2 flex-grow overflow-y-auto max-h-[400px] pr-1">
              {branches?.map(branch => (
                <label 
                  key={branch.id} 
                  className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-all group"
                >
                  <input 
                    type="checkbox" 
                    name="branch_ids" 
                    value={branch.id}
                    defaultChecked={activeBranchIds.includes(branch.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-blue-700 transition-colors">
                    {branch.branch_name}
                  </span>
                </label>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col gap-3">
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} />
                บันทึกการเปลี่ยนแปลง
              </button>
              <Link 
                href={`/dashboard/${shop_id}/settings/users`}
                className="text-center py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                ยกเลิก
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
