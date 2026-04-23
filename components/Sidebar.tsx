"use client";

import { useRouter, usePathname } from "next/navigation";
import { menuConfig, MenuItem, Role } from "@/config/menu";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Store, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  shop_id: string; 
  shopName: string;
  role: Role;
  logoUrl?: string | null;
}

export default function Sidebar({ shop_id, shopName, role, logoUrl }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const getFullPath = (itemPath: string | undefined) => {
    if (!shop_id) return "";
    const base = `/dashboard/${shop_id}`;
    if (!itemPath || itemPath === "/" || itemPath === "") return base;
    
    const cleanPath = itemPath.startsWith("/") ? itemPath : `/${itemPath}`;
    return `${base}${cleanPath}`.replace(/\/+$/, "");
  };

  const isAllowed = (item: MenuItem) => {
    if (!item.roles) return true;
    return item.roles.includes(role.toLowerCase() as Role);
  };

  const checkActive = (path: string | undefined) => {
    if (path === undefined || !shop_id) return false;
    const fullPath = getFullPath(path);
    if (path === "" || path === "/") return pathname === `/dashboard/${shop_id}`;
    return pathname === fullPath || pathname.startsWith(fullPath + "/");
  };

  useEffect(() => {
    menuConfig.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => checkActive(child.path));
        if (hasActiveChild) setOpen(item.label);
      }
    });
  }, [pathname, shop_id]);

  // ✅ ฟังก์ชันสลับร้านค้า
  const handleSwitchShop = () => {
    // ล้างข้อมูล shop_id เดิมในกรณีที่มีการเก็บใน LocalStorage (ถ้ามี)
    router.push("/select-shop");
  };

  // ✅ ฟังก์ชันออกจากระบบ
  /* const handleLogout = async () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      // await fetch('/api/logout', { method: 'POST' });
      // await supabase.auth.signOut();
      localStorage.clear(); // ล้างข้อมูล Token และสถานะต่างๆ //localStorage.removeItem("token"); // หรือชื่อ key ที่คุณใช้เก็บ token
      router.push("/login");
      router.refresh();
    }
  }; */

  // ✅ สร้าง supabase client จากฟังก์ชันที่คุณ import มา
  const supabase = createClient(); 
  // ... โค้ดอื่นๆ (FullPath, isAllowed, checkActive, useEffect) ...

  const handleLogout = async () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      try {
        // 1. ล้าง Session ใน Supabase (ลบ Cookies)
        await supabase.auth.signOut();
        
        // 2. ล้าง Local Storage ทุกอย่าง (รวมถึง current_shop_id ในรูป)
        if (typeof window !== 'undefined') {
          window.localStorage.clear();
          window.sessionStorage.clear();
        }

        // 3. 🚨 เคล็ดลับสำคัญ: ล้างคุกกี้ที่เกี่ยวข้องทั้งหมด (ถ้ามี)
        // โดยการตั้งค่าวันหมดอายุให้เป็นอดีต
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // 4. ใช้คำสั่งนี้เพื่อ "บังคับโหลดหน้าเว็บใหม่" ไปที่หน้า Login
        // วิธีนี้จะล้างทุกอย่างที่ค้างอยู่ใน Memory ของ React ทิ้งทั้งหมด
        window.location.href = "/login"; 

      } catch (error) {
        console.error("Logout Error:", error);
        // กรณี Error ก็ยังควรดีดกลับหน้า login
        router.push("/login");
      }
    }
  };

  const renderItem = (item: MenuItem) => {
    if (!isAllowed(item)) return null;
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isActive = checkActive(item.path);
    const isParentActive = hasChildren && item.children?.some(child => checkActive(child.path));
    const isOpen = open === item.label;

    return (
      <div key={item.label} className="mb-1 relative group">
        <button
          onClick={() => {
            if (hasChildren) {
              if (collapsed) setCollapsed(false);
              setOpen(isOpen ? null : item.label);
            } else if (item.path !== undefined && shop_id) {
              const targetPath = getFullPath(item.path);
              pathname === targetPath ? router.refresh() : router.push(targetPath);
              setOpen(null); 
            }
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            collapsed ? "justify-center" : "justify-start",
            isActive || (isParentActive && !isOpen && !collapsed)
              ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
              : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
          )}
        >
          {Icon && <Icon size={20} className={cn("shrink-0", isActive || isParentActive ? "text-white" : "text-slate-400 group-hover:text-blue-500")} />}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {hasChildren && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </>
          )}
        </button>

        {/* Tooltip เมนูหลัก */}
        {collapsed && (
          <div className="fixed left-[75px] px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap shadow-xl pointer-events-none">
            {item.label}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
          </div>
        )}

        {hasChildren && isOpen && !collapsed && (
          <div className="ml-5 mt-1 pl-4 border-l-2 border-slate-100 space-y-1">
            {item.children?.map((child) => (
              <button
                key={child.label}
                onClick={() => shop_id && router.push(getFullPath(child.path))}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                  checkActive(child.path) ? "text-blue-600 font-bold bg-blue-50" : "text-slate-500 hover:text-blue-600"
                )}
              >
                {child.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 sticky top-0 z-50 left-0 shadow-sm",
      collapsed ? "w-20" : "w-72"
    )}>
      <div className="p-4 flex flex-col gap-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Main Menu</span>}
          
          <div className="relative group">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
            {collapsed && (
              <div className="fixed left-[75px] px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap shadow-xl pointer-events-none">
                {collapsed ? "ขยายเมนู" : "ย่อเมนู"}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-100",
          collapsed && "justify-center bg-transparent border-transparent shadow-none"
        )}>
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100 overflow-hidden">
            {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover" alt="logo" /> : <Store size={20} />}
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <h2 className="font-bold text-slate-800 text-sm truncate">{shopName}</h2>
              <p className="text-[10px] text-blue-600 font-bold uppercase">{role}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        {menuConfig.map((item) => renderItem(item))}
      </nav>

      <div className="p-4 border-t border-slate-50 space-y-1">
        {/* ปุ่มสลับร้านค้า */}
        <div className="relative group">
          <button
            onClick={handleSwitchShop}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all", 
              collapsed && "justify-center"
            )}
          >
            <Store size={20} className="shrink-0 text-slate-400" />
            {!collapsed && <span>สลับร้านค้า</span>}
          </button>
          {collapsed && (
            <div className="fixed left-[75px] px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap shadow-xl pointer-events-none">
              สลับร้านค้า
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
            </div>
          )}
        </div>

        {/* ปุ่มออกจากระบบ */}
        {/* <div className="relative group">
          <button className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 transition-all", collapsed && "justify-center")}>
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span className="font-medium text-red-500">ออกจากระบบ</span>}
          </button>
          {collapsed && (
            <div className="fixed left-[75px] px-3 py-2 bg-red-600 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap shadow-xl pointer-events-none">
              ออกจากระบบ
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-red-600 rotate-45" />
            </div>
          )}
        </div> */}
        <div className="relative group">
          <button 
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all", 
              collapsed && "justify-center"
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>ออกจากระบบ</span>}
          </button>
          {collapsed && (
            <div className="fixed left-[75px] px-3 py-2 bg-red-600 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap shadow-xl pointer-events-none">
              ออกจากระบบ
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-red-600 rotate-45" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
