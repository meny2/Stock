"use client";

import { useState } from "react";
import { Bell, ChevronDown, LogOut, User, Building2, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Branch {
  id: string;
  name: string;
}

interface HeaderProps {
  userEmail?: string; // ปรับเป็น optional เพื่อกันพัง
  branches?: Branch[]; // ปรับเป็น optional
  currentBranchId?: string;
}

export default function Header({ 
  userEmail = "User", 
  branches = [], 
  currentBranchId 
}: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [branchOpen, setBranchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // หาข้อมูลสาขาปัจจุบัน
  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleBranchSelect = (branch: Branch) => {
    // เก็บสาขาที่เลือกลงใน localStorage หรือส่งขึ้น API
    localStorage.setItem("last_branch_id", branch.id);
    setBranchOpen(false);
    // แจ้งเตือนเพื่อให้หน้า Page ดึงข้อมูลใหม่ตามสาขาที่เลือก
    router.refresh();
  };

  // ฟังก์ชันช่วยในการนำทางและปิด Dropdown
  const navigateTo = (path: string) => {
    router.push(path);
    setProfileOpen(false);
  };
  
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-40">
      
      {/* Branch Selector (แสดงเฉพาะเมื่อมีมากกว่า 1 สาขา หรือเพื่อบอกตำแหน่ง) */}
      <div className="relative">
        <button
          onClick={() => setBranchOpen(!branchOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-white transition-all"
        >
          <Building2 size={16} className="text-indigo-500" />
          <span className="hidden sm:block truncate max-w-[150px]">
            {currentBranch?.name || "เลือกสาขา"}
          </span>
          <ChevronDown size={14} className={cn("text-slate-400 transition-transform", branchOpen && "rotate-180")} />
        </button>

        {branchOpen && branches.length > 0 && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setBranchOpen(false)} />
            <div className="absolute top-full left-0 mt-2 z-20 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[200px] py-1.5 overflow-hidden animate-in fade-in zoom-in duration-100">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                สาขาที่มีสิทธิ์เข้าถึง
              </div>
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between",
                    branch.id === currentBranch?.id
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {branch.name}
                  {branch.id === currentBranch?.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notification */}
        <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 md:pl-3 md:pr-1 md:py-1 rounded-full border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all active:scale-95"
          >
            <span className="hidden md:block text-xs font-semibold text-slate-700 max-w-[120px] truncate">
              {userEmail}
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-50">
              {userEmail.charAt(0).toUpperCase()}
            </div>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute top-full right-0 mt-2 z-20 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[220px] py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Logged in as</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{userEmail}</p>
                </div>
                
                {/* Navigation Menu */}
                <div className="p-1.5">
                  <button 
                    onClick={() => navigateTo("/profile")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors group"
                  >
                    <User size={16} className="text-slate-400 group-hover:text-indigo-500" />
                    <span>บัญชีของฉัน</span>
                  </button>

                  <button                     
                    onClick={(e) => {e.preventDefault();}}  //onClick={() => navigateTo("/settings")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors group"
                  >
                    <Settings size={16} className="text-slate-400 group-hover:text-indigo-500" />
                    <span>ตั้งค่าระบบ</span>
                  </button>
                </div>

                {/* Sign Out Section */}
                <div className="p-1.5 border-t border-slate-50 mt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium group"
                  >
                    <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
