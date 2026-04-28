"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  KeyRound,
} from "lucide-react";

/**
 * PAGE MODE
 * ─────────────────────────────────────────────────────────────
 * "invite"   → มาจาก Invite / Signup link ใน email
 *              Supabase emit SIGNED_IN + user เพิ่งสร้างใหม่
 *              ไม่ต้องใส่รหัสเก่า
 *
 * "recovery" → มาจาก Forgot-Password link ใน email
 *              Supabase emit PASSWORD_RECOVERY
 *              ไม่ต้องใส่รหัสเก่า (เพราะลืมรหัสผ่านอยู่แล้ว)
 *
 * "reset"    → มาจากกดปุ่ม "เปลี่ยนรหัสผ่าน" บนหน้า Login
 *              user มี session อยู่แล้ว ต้องใส่รหัสเก่า
 * ─────────────────────────────────────────────────────────────
 *
 * HOW DETECTION WORKS
 * ─────────────────────────────────────────────────────────────
 * Supabase SDK v2 (ssr) อ่าน URL hash และ clear ทิ้งก่อน React render
 * ดังนั้น window.location.hash จะว่างเปล่าเสมอตอนที่ useEffect รัน
 *
 * วิธีที่ถูกต้อง:
 * 1. อ่าน hash ทันทีที่ module โหลด (ก่อน SDK clear) เก็บไว้ใน variable
 * 2. ใช้ onAuthStateChange เพื่อดัก event จาก SDK
 *    - PASSWORD_RECOVERY → mode = "recovery"
 *    - SIGNED_IN (มี savedType = "invite") → mode = "invite"
 * 3. ถ้าไม่มี token ใน URL และมี session → mode = "reset"
 */

type PageMode = "invite" | "recovery" | "reset" | null;

// ── อ่าน hash ทันทีที่ module โหลด ก่อน Supabase SDK clear ทิ้ง ──────────
// ต้องทำนอก component เพราะ useEffect รันหลัง SDK clear hash แล้ว
const _rawHash = typeof window !== "undefined" ? window.location.hash : "";
const _hashParams = new URLSearchParams(_rawHash.replace("#", "?"));
const _savedType = _hashParams.get("type"); // "invite" | "recovery" | null
const _hasToken = !!_hashParams.get("access_token");

export default function ResetPasswordPage() {
  const [mode, setMode] = useState<PageMode>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const getModeFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode");
  };

useEffect(() => {
  let resolved = false;

  const initAuth = async () => {
    // 1. ดึงข้อมูลจาก URL ให้ชัดเจน (ทั้ง Query และ Hash)
    const urlParams = new URLSearchParams(window.location.search);
    const modeFromUrl = urlParams.get("mode") as PageMode; 
    
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    // 2. ล้าง Session ซ้อน และ Force Set Session ใหม่ (สำหรับ Invite / Recovery)
    if (accessToken && (modeFromUrl === "invite" || modeFromUrl === "recovery" || _hasToken)) {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      // ถ้ามีคนอื่น Login ค้างอยู่ ให้ Sign Out ออกทันที
      if (existingSession && existingSession.user.email !== hashParams.get("email")) {
        await supabase.auth.signOut();
      }

      // บังคับใช้ Session จาก Token ในลิงก์เท่านั้น
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });

      // 2. แก้ไขการ setMode ตรงนี้ให้ TS มั่นใจ
      const targetMode: PageMode = modeFromUrl || (_savedType as PageMode) || "recovery";
      setMode(targetMode);
      
      setIsValidSession(true);
      resolved = true;

    }

    // 3. ติดตามสถานะ Auth (สำหรับกรณีทั่วไป หรือ PKCE Flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (resolved) return;

      // ลำดับความสำคัญ: ถ้ามี Token หรือ Mode ใน URL ให้ใช้ค่านั้นก่อน
      if (modeFromUrl === "invite" || (accessToken && _savedType === "invite")) {
        resolved = true;
        setMode("invite");
        setIsValidSession(true);
        return;
      }

      if (modeFromUrl === "recovery" || event === "PASSWORD_RECOVERY") {
        resolved = true;
        setMode("recovery");
        setIsValidSession(true);
        return;
      }

      // กรณีเปลี่ยนรหัสผ่านปกติ (ต้องไม่มี Token และต้องมี Session)
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session && !accessToken) {
        resolved = true;
        setMode("reset");
        setIsValidSession(true);
        return;
      }
    });

    // 4. Fallback Timer
    const fallbackTimer = setTimeout(async () => {
      if (resolved) return;

      if (modeFromUrl === "invite" || _savedType === "invite") {
        setMode("invite");
      } else if (modeFromUrl === "recovery" || _savedType === "recovery") {
        setMode("recovery");
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setMode("reset");
        } else {
          setIsValidSession(false);
          router.push("/login");
          return;
        }
      }
      resolved = true;
      setIsValidSession(true);
    }, 1000);

    return { subscription, fallbackTimer };
  };

  const authCleanup = initAuth();

  return () => {
    authCleanup.then((res) => {
      if (res) {
        res.subscription.unsubscribe();
        clearTimeout(res.fallbackTimer);
      }
    });
  };
}, [supabase, router, _hasToken, _savedType]);



  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("ยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      // 1. ดึง Token จาก URL โดยตรง (เชื่อถือได้ที่สุดสำหรับ Invite/Recovery)
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const accessTokenFromUrl = params.get("access_token");
      const refreshTokenFromUrl = params.get("refresh_token");

      let { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // 2. ถ้ามาจากลิงก์ (มี Token) ให้บังคับใช้ Session จาก Token นั้น
      if (accessTokenFromUrl) {
        const { data, error: setSessionError } = await supabase.auth.setSession({
          access_token: accessTokenFromUrl,
          refresh_token: refreshTokenFromUrl || "",
        });
        if (setSessionError) throw setSessionError;
        session = data.session;
      }

      if (!session) {
        throw new Error("ไม่สามารถสร้างเซสชันได้ กรุณารีเฟรชหน้าจอหรือใช้ลิงก์จากอีเมลอีกครั้ง");
      }

      // 3. ป้องกันปัญหา Mode ผิดพลาด (หัวใจสำคัญของการแก้รอบนี้)
      // ถ้ามี Token จาก URL บังคับว่าห้ามเช็ครหัสผ่านเดิมเด็ดขาด!
      const isLinkFlow = accessTokenFromUrl !== null || _hasToken; 
      
      if (mode === "reset" && !isLinkFlow) {
        const email = session.user?.email;
        if (!email) throw new Error("ไม่พบข้อมูลบัญชีผู้ใช้");

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: oldPassword,
        });
        if (signInError) throw new Error("รหัสผ่านเดิมไม่ถูกต้อง");
      }

      // 4. อัปเดตรหัสผ่านใหม่
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        if (updateError.message.includes("same as the old one")) {
          throw new Error("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม");
        }
        throw updateError;
      }

      setIsSuccess(true);
      setTimeout(async () => {
        // ตรวจสอบโหมดตอนจบเพื่อ redirect
        if (mode === "reset" && !isLinkFlow) {
          router.push("/dashboard");
        } else {
          await supabase.auth.signOut();
          window.location.href = "/login?message=password-updated";
        }
      }, 2000);

    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  // ─── UI States ───────────────────────────────────────────────

  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 text-center space-y-4">
          <div className="flex justify-center text-amber-500">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-xl font-black text-gray-900 leading-tight">
            เซสชันหมดอายุ
          </h2>
          <p className="text-sm text-gray-500 font-medium italic">
            กรุณากดลิงก์จากอีเมลใหม่อีกครั้งเพื่อความปลอดภัย
          </p>
          <p className="text-xs text-gray-400">กำลังพาคุณกลับหน้าเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full text-green-600 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            {mode === "reset" ? "เปลี่ยนรหัสผ่านสำเร็จ!" : "ตั้งรหัสผ่านสำเร็จ!"}
          </h2>
          <p className="text-gray-500 font-medium italic">
            {mode === "reset"
              ? "กำลังพาคุณไปยังแดชบอร์ด..."
              : "กำลังพาคุณไปหน้าเข้าสู่ระบบ..."}
          </p>
        </div>
      </div>
    );
  }

  if (mode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={36} />
          <p className="text-sm text-gray-400 font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // ─── Mode Config ─────────────────────────────────────────────
  const modeConfig = {
    invite: {
      icon: <UserPlus className="text-white" size={32} />,
      iconBg: "bg-purple-600 shadow-purple-100",
      badge: "เชิญเข้าร่วมระบบ",
      badgeColor: "bg-purple-50 text-purple-700",
      title: "ตั้งรหัสผ่านเพื่อเริ่มใช้งาน",
      subtitle: "กำหนดรหัสผ่านสำหรับบัญชีที่ได้รับเชิญ",
      ring: "focus:ring-purple-500",
      hover: "hover:text-purple-600",
      btn: "bg-purple-600 shadow-purple-100 hover:bg-purple-700",
      btnLabel: "ยืนยันและเริ่มต้นใช้งาน",
    },
    recovery: {
      icon: <ShieldCheck className="text-white" size={32} />,
      iconBg: "bg-blue-600 shadow-blue-100",
      badge: "กู้คืนรหัสผ่าน",
      badgeColor: "bg-blue-50 text-blue-700",
      title: "ตั้งรหัสผ่านใหม่",
      subtitle: "กำหนดรหัสผ่านใหม่เพื่อเข้าสู่ระบบ",
      ring: "focus:ring-blue-500",
      hover: "hover:text-blue-600",
      btn: "bg-blue-600 shadow-blue-100 hover:bg-blue-700",
      btnLabel: "บันทึกรหัสผ่านใหม่",
    },
    reset: {
      icon: <KeyRound className="text-white" size={32} />,
      iconBg: "bg-blue-600 shadow-blue-100",
      badge: "เปลี่ยนรหัสผ่าน",
      badgeColor: "bg-blue-50 text-blue-700",
      title: "ตั้งรหัสผ่านใหม่",
      subtitle: "กรอกรหัสผ่านเดิมและรหัสผ่านใหม่ที่ต้องการ",
      ring: "focus:ring-blue-500",
      hover: "hover:text-blue-600",
      btn: "bg-blue-600 shadow-blue-100 hover:bg-blue-700",
      btnLabel: "บันทึกรหัสผ่านใหม่",
    },
  };

  const cfg = modeConfig[mode];

  // ─── Main Form ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4 font-sans">
      <div className="max-w-md w-full">

        {/* Icon + Badge */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className={`p-3 rounded-2xl shadow-lg ${cfg.iconBg}`}>
            {cfg.icon}
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.badgeColor}`}>
            {cfg.badge}
          </span>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {cfg.title}
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              {cfg.subtitle}
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] p-3.5 rounded-xl font-bold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5">

            {/* รหัสผ่านเดิม — เฉพาะ mode reset */}
            {mode === "reset" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">
                    รหัสผ่านเดิม
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="กรอกรหัสผ่านเดิมของคุณ"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className={`w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ${cfg.ring} focus:bg-white transition-all text-gray-900 font-bold`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 ${cfg.hover} transition-colors`}
                    >
                      {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">
                    รหัสผ่านใหม่
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              </>
            )}

            {/* รหัสผ่านใหม่ */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">
                {mode === "reset" ? "รหัสผ่านใหม่" : "รหัสผ่าน"}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ${cfg.ring} focus:bg-white transition-all text-gray-900 font-bold`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 ${cfg.hover} transition-colors`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ยืนยันรหัสผ่าน */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ${cfg.ring} focus:bg-white transition-all text-gray-900 font-bold`}
                />
                {confirmPassword.length > 0 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {password === confirmPassword ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : (
                      <AlertTriangle size={18} className="text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              disabled={loading}
              className={`w-full text-white py-4 rounded-2xl font-black shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4 ${cfg.btn}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  กำลังบันทึกข้อมูล...
                </>
              ) : (
                cfg.btnLabel
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-xs text-gray-400 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Modern Shop Management System
        </p>
      </div>
    </div>
  );
}
