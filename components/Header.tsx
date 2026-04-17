"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, LogOut, User, Building2, Settings, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSearch } from "@/context/SearchContext";

interface Branch {
  id: string;
  name: string;
}

interface HeaderProps {
  userEmail?: string;
  branches?: Branch[];
}

export default function Header({ 
  userEmail = "User", 
  branches = [], 
}: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [branchOpen, setBranchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // 🚀 State สำหรับเก็บชื่อ-นามสกุลจริง
  const [fullName, setFullName] = useState<string>("Loading...");

  const { searchTerm, setSearchTerm, selectedBranch, setSelectedBranch } = useSearch();

  // 🚀 1. ดึงชื่อ-นามสกุลจากตาราง profiles
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setFullName(`${data.first_name} ${data.last_name}`);
        } else {
          // ถ้าดึงไม่ได้ ให้ใช้ส่วนหน้าของ Email แทน
          setFullName(userEmail.split('@')[0]);
        }
      }
    };
    fetchUserProfile();
  }, [supabase, userEmail]);

  // Logic จัดการสาขา
  const hasMultipleBranches = branches.length > 1;
  const hasSingleBranch = branches.length === 1;

  useEffect(() => {
    if (hasSingleBranch) {
      setSelectedBranch(branches[0].id);
    } else if (hasMultipleBranches && selectedBranch === "") {
      setSelectedBranch("all");
    }
  }, [branches, hasSingleBranch, hasMultipleBranches, setSelectedBranch, selectedBranch]);

  const currentBranchName = selectedBranch === "all" 
    ? "ทุกสาขา" 
    : (branches.find(b => b.id === selectedBranch)?.name || (hasSingleBranch ? branches[0].name : "เลือกสาขา"));

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    setBranchOpen(false);
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-4 md:px-8 gap-4 md:gap-8 sticky top-0 z-[50]">
      
      {/* 📍 Branch Selector */}
      <div className="relative min-w-[160px] md:min-w-[220px]">
        <button
          onClick={() => hasMultipleBranches && setBranchOpen(!branchOpen)}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-2 rounded-2xl bg-slate-50 border border-transparent transition-all group",
            hasMultipleBranches ? "hover:border-blue-200 hover:bg-white cursor-pointer" : "cursor-default"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0",
            hasMultipleBranches ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" : "bg-slate-200 text-slate-500"
          )}>
            <Building2 size={18} />
          </div>
          <div className="flex flex-col items-start overflow-hidden text-left">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              {selectedBranch === "all" ? "ภาพรวมระบบ" : "สาขาปัจจุบัน"}
            </span>
            <span className="text-sm font-bold text-slate-700 truncate w-full">
              {currentBranchName}
            </span>
          </div>
          {hasMultipleBranches && (
            <ChevronDown size={14} className={cn("ml-auto text-slate-400 transition-transform shrink-0", branchOpen && "rotate-180")} />
          )}
        </button>

        {branchOpen && hasMultipleBranches && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setBranchOpen(false)} />
            <div className="absolute top-full left-0 mt-3 z-20 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl min-w-[240px] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => handleBranchSelect("all")}
                className={cn(
                  "w-full text-left px-5 py-3 text-sm transition-all flex items-center justify-between",
                  selectedBranch === "all" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                ทุกสาขา
                {selectedBranch === "all" && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />}
              </button>
              <div className="h-px bg-slate-50 my-1 mx-2" />
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch.id)}
                  className={cn(
                    "w-full text-left px-5 py-3 text-sm transition-all flex items-center justify-between",
                    branch.id === selectedBranch ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {branch.name}
                  {branch.id === selectedBranch && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 🔍 Search Bar */}
      <div className="flex-1 max-w-2xl relative group hidden sm:block">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="ค้นหาด่วน..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-12 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-700 placeholder:text-slate-300"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* 👤 User Actions */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all">
          <Bell size={22} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)} 
            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-200">
              {fullName.charAt(0).toUpperCase()}
            </div>
            {/* 🚀 แสดง ชื่อ-นามสกุล และ Email */}
            <div className="hidden lg:flex flex-col items-start leading-tight">
              <span className="text-sm font-bold text-slate-800">
                {fullName}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {userEmail}
              </span>
            </div>
            <ChevronDown size={14} className={cn("text-slate-300 transition-transform duration-300", profileOpen && "rotate-180")} />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute top-full right-0 mt-3 z-20 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl min-w-[240px] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">บัญชีผู้ใช้</p>
                  <p className="text-sm font-black text-slate-800 truncate">{fullName}</p>
                  <p className="text-[11px] font-medium text-slate-500 truncate">{userEmail}</p>
                </div>
                <div className="p-2 space-y-1">
                  <button onClick={() => { router.push("/profile"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group">
                    <User size={18} className="text-slate-400 group-hover:text-blue-500" />
                    โปรไฟล์ส่วนตัว
                  </button>
                  <button onClick={() => { router.push("/settings"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group">
                    <Settings size={18} className="text-slate-400 group-hover:text-blue-500" />
                    ตั้งค่าระบบ
                  </button>
                  <div className="h-px bg-slate-50 my-1" />
                  <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-all group">
                    <LogOut size={18} className="text-rose-400 group-hover:text-rose-600" />
                    ออกจากระบบ
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
