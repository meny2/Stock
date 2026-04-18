import { createClient } from '@/lib/supabase/server';
import UserTable from './_components/user-table';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';

export default async function UsersPage({ params }: { params: Promise<{ shop_id: string }> }) {
  const { shop_id } = await params;
  const supabase = await createClient();

  // 1. ดึงข้อมูล User และสิทธิ์หลัก (user_shop + profiles + roles)
  const { data: users, error: userError } = await supabase
    .from('user_shop')
    .select(`
      id,
      user_id,
      status,
      role_id,
      profiles (
        first_name,
        last_name,
        email
      ),
      roles (
        id,
        role_name,
        is_system_role
      )
    `)
    .eq('shop_id', shop_id);

  // 2. ดึงข้อมูลการมอบหมายสาขาแยกต่างหาก (user_branches + branches)
  const { data: userBranches, error: branchError } = await supabase
    .from('user_branches')
    .select(`
      user_id,
      branch_id,
      branches (
        branch_name
      )
    `)
    .eq('shop_id', shop_id);

  // ตรวจสอบ Error
  if (userError || branchError) {
    return (
      <div className="m-6 p-10 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center">
        <div className="bg-red-100 p-3 rounded-full text-red-600 mb-4">
          <Users size={24} />
        </div>
        <h2 className="text-lg font-bold text-red-800">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
        <p className="text-sm text-red-600 mt-1">{userError?.message || branchError?.message}</p>
      </div>
    );
  }

  // 3. 🔄 ธุรกรรมการรวมข้อมูล (Manual Join) 
  // นำข้อมูลสาขาจาก userBranches ไปใส่ไว้ใน user_branches ของแต่ละ User
  const formattedUsers = (users || []).map(u => ({
    ...u,
    profiles: u.profiles || { first_name: 'Unknown', last_name: 'User', email: '-' },
    user_branches: userBranches?.filter(ub => ub.user_id === u.user_id) || []
  }));

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users size={20} />
            <span className="text-sm font-bold uppercase tracking-wider font-mono">Team Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            จัดการทีมงาน
          </h1>
          <p className="text-gray-500 text-[15px]">
            บริหารจัดการสิทธิ์พนักงานและการเข้าถึงสาขาต่างๆ ในร้านของคุณ
          </p>
        </div>

        <Link 
          href={`/dashboard/${shop_id}/settings/users/add`}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95 text-sm"
        >
          <Plus size={20} strokeWidth={2.5} />
          เพิ่มสมาชิกใหม่
        </Link>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">สมาชิกทั้งหมด</p>
          <p className="text-3xl font-black text-gray-900">{formattedUsers.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">สถานะ Active</p>
          <p className="text-3xl font-black text-green-600">
            {formattedUsers.filter(u => u.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <UserTable initialData={formattedUsers} shopId={shop_id} />
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 text-[11px] text-gray-400 px-2 font-medium italic">
        <div className="w-1 h-1 rounded-full bg-gray-300" />
        Data synced: {new Date().toLocaleTimeString('th-TH')}
      </div>
    </div>
  );
}
