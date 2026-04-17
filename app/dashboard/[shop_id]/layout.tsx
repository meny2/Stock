import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Role } from '@/config/menu';
import { SearchProvider } from "@/context/SearchContext"

export default async function DashboardLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ shop_id: string }> 
}) {
  const { shop_id } = await params;
  const supabase = await createClient();

  // 1. ตรวจสอบ User ที่ Login
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // 2. ตรวจสอบสิทธิ์ในร้านค้า (Shop) และดึงข้อมูลพื้นฐาน
  const { data: userShop, error: shopError } = await supabase
    .from('user_shop')
    .select(`
      roles:role_id (role_name),
      shops (
        shop_name
      )
    `)
    .eq('user_id', user.id)
    .eq('shop_id', shop_id)
    .single();

  if (shopError || !userShop) {
    redirect('/shop'); 
  }

  // 🚀 3. ดึงรายชื่อสาขา (Branches) ที่ User คนนี้มีสิทธิ์จากตาราง user_branches
  const { data: allowedBranchesData } = await supabase
    .from('user_branches')
    .select(`
      branch_id,
      branches:branch_id (
        id,
        branch_name
      )
    `)
    .eq('user_id', user.id)
    .eq('shop_id', shop_id);

  // จัดรูปแบบข้อมูลสาขาเพื่อส่งต่อให้ Header
  const allowedBranches = allowedBranchesData?.map((item: any) => ({
    id: item.branches.id,
    name: item.branches.branch_name
  })) || [];

  const shopName = (userShop.shops as any)?.shop_name || "Unknown Shop";
  const rawRole = (userShop.roles as any)?.role_name || 'staff';
  const userRole = rawRole.toLowerCase() as Role;

  return (
    <SearchProvider>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <Sidebar 
          shop_id={shop_id} 
          role={userRole} 
          shopName={shopName} 
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* 🚀 4. ส่งรายชื่อสาขาที่ User มีสิทธิ์จริง (allowedBranches) ไปที่ Header */}
          <Header 
            userEmail={user.email || ""} 
            branches={allowedBranches} 
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
