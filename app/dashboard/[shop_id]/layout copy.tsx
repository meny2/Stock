import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Role } from '@/config/menu';

export default async function DashboardLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ shop_id: string }> 
}) {
  const { shop_id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // ✅ ปรับ Query ให้ดึง role_name ออกมา
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
    redirect('/shop'); // กลับหน้าเลือก shop ถ้าไม่มีสิทธิ์
  }

  const shopName = (userShop.shops as any)?.shop_name || "Unknown Shop";
  
  // ✅ Mapping Role จากชื่อในฐานข้อมูลโดยตรง
  const rawRole = (userShop.roles as any)?.role_name || 'staff';
  const userRole = rawRole.toLowerCase() as Role;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar 
        shop_id={shop_id} // ✅ เปลี่ยนจาก shopId เป็น shop_id ให้ตรงกับ Sidebar.tsx
        role={userRole} 
        shopName={shopName} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          userEmail={user.email || ""} 
          branches={[{ id: shop_id, name: shopName }]} 
          currentBranchId={shop_id}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
