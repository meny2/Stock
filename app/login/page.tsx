"use client";

import Link from "next/link";
import { createBrowserClient } from '@supabase/ssr';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, KeyRound, Wrench } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  useEffect(() => {
    setIsMounted(true);
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error) setErrorMsg(error);
    if (message === 'password-updated') {
      setSuccessMsg('ตั้งรหัสผ่านสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const loginEmail = email.trim().toLowerCase();
      const loginPassword = password.trim();

      if (!loginEmail || !loginPassword) {
        setErrorMsg("กรุณากรอกอีเมลและรหัสผ่าน");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (!data.session) {
        setErrorMsg("เข้าสู่ระบบไม่สำเร็จ: ไม่พบ session");
        setLoading(false);
        return;
      }

      router.replace("/select-shop");
      router.refresh();
    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-3xl font-black text-blue-600 mb-6 group">
          <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:rotate-12 transition-transform shadow-lg shadow-blue-100">
            <LogIn size={24} />
          </div>
          <span>MY_APP</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ยินดีต้อนรับกลับมา
        </h2>
        <p className="mt-3 text-sm text-slate-500 font-medium">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
            เริ่มใช้งานฟรีวันนี้
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[32px] sm:px-12 border border-slate-100/50 space-y-8">

          {errorMsg && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-semibold animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle size={18} className="shrink-0" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 p-4 rounded-2xl text-green-700 text-sm font-semibold animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 size={18} className="shrink-0" />
              {successMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">อีเมล</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[12px] font-bold text-slate-400 uppercase">รหัสผ่าน</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isMounted}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 font-black hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-slate-300 disabled:shadow-none mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  กำลังดำเนินการ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>

           {/* ── ส่วนที่เพิ่มเข้าไปใหม่: Force Change Password Link ── */}
          <div className="pt-4 border-t border-slate-100">
            <Link 
              href="/auth/force-change-password" 
              className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors group"
            >
              <Wrench size={16} className="group-hover:rotate-12 transition-transform" />
              <span>ลืมรหัสผ่าน? (กรณีใช้อีเมลสมมติ)</span>
            </Link>
          </div>

          {/* ── Change Password link ── */}
          {/* user ยังไม่ได้ล็อกอิน → ต้องผ่าน forgot-password flow ก่อน
              Supabase จะส่ง email → กด link → หน้า reset-password (mode: recovery) */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <Link
                href="/auth/forgot-password"
                className="
                  inline-flex items-center gap-2
                  px-4 py-2
                  bg-white
                  border border-slate-200
                  rounded-2xl
                  text-xs font-bold text-slate-500
                  hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50
                  transition-all duration-200
                  shadow-sm
                  group
                "
              >
                <KeyRound
                  size={13}
                  className="text-slate-400 group-hover:text-blue-500 transition-colors duration-200"
                />
                ต้องการเปลี่ยนรหัสผ่าน?
              </Link>
            </div>
          </div>

          {/* Social login divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="px-3 bg-white text-slate-300">หรือใช้บัญชีอื่น</span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
            >
              <FcGoogle size={20} />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
            >
              <FaFacebook size={20} className="text-[#1877F2]" />
              <span>Facebook</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
