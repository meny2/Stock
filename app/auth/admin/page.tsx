"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, UserCog, Mail, KeyRound, ShieldAlert, 
  CheckCircle2, XCircle, Loader2, MoreVertical, 
  UserPlus, ShieldCheck, Ban, History 
} from 'lucide-react';

export default function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  // ดึงรายชื่อ User (หมายเหตุ: ปกติการดึง User ทั้งหมดต้องทำผ่าน Service Role ใน API Route 
  // แต่ในที่นี้จะแสดงตัวอย่าง UI และ Logic พื้นฐาน)
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    // ในระบบจริง คุณควรสร้าง API Route (Edge Function) เพื่อเรียก Admin Auth API ของ Supabase
    // ตัวอย่างนี้ดึงจาก table 'profiles' ที่เราเก็บข้อมูล user ไว้
    const { data, error } = await supabase
      .from('profiles') 
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setUsers(data || []);
    setLoading(false);
  }

  const handleResetPassword = async (email: string) => {
    setActionLoading(email + '-pw');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    
    if (error) alert(error.message);
    else alert("ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว");
    setActionLoading(null);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCog className="text-blue-600" /> จัดการผู้ใช้งาน
          </h1>
          <p className="text-slate-500 font-medium">จัดการรหัสผ่าน อีเมล และสิทธิ์การใช้งานของสมาชิก</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          <UserPlus size={20} /> เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      {/* Stats & Search */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">ผู้ใช้ทั้งหมด</p>
          <p className="text-2xl font-black text-slate-900">{users.length}</p>
        </div>
        <div className="md:col-span-3 bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm flex items-center px-4">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
            className="w-full p-4 focus:outline-none font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* User Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase">ผู้ใช้งาน</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase">สถานะ</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase">บทบาท</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.full_name || 'ไม่ระบุชื่อ'}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {/* Reset Password Button */}
                        <button 
                          onClick={() => handleResetPassword(user.email)}
                          disabled={actionLoading === user.email + '-pw'}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="ส่งอีเมลรีเซ็ตรหัสผ่าน"
                        >
                          {actionLoading === user.email + '-pw' ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                        </button>

                        {/* Edit Role/Email */}
                        <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all" title="แก้ไขข้อมูล">
                          <History size={18} />
                        </button>

                        {/* Ban User */}
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="ระงับการใช้งาน">
                          <Ban size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
