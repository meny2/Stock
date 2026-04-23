"use client";

import React, { useState } from "react";
import { adminChangeUserPassword } from "@/app/actions/admin-actions"; // ตรวจสอบ path ให้ตรงกับที่สร้างไว้
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react"; // ใช้ lucide-react สำหรับ icon

interface Props {
  userId: string;
  userEmail?: string;
}

export default function ChangePasswordForm({ userId, userEmail }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 1. Validation เบื้องต้น
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "รหัสผ่านไม่ตรงกัน" });
      return;
    }

    // 2. เรียกใช้ Server Action
    setIsLoading(true);
    try {
      const result = await adminChangeUserPassword(userId, newPassword);
      if (result.success) {
        setMessage({ type: "success", text: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: result.message || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white border rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">เปลี่ยนรหัสผ่าน (Admin Only)</h2>
      </div>

      {userEmail && <p className="mb-4 text-sm text-gray-500">ผู้ใช้: {userEmail}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ช่องกรอกรหัสผ่านใหม่ */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="รหัสผ่านใหม่"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* ช่องยืนยันรหัสผ่าน */}
        <input
          type={showPassword ? "text" : "password"}
          placeholder="ยืนยันรหัสผ่านใหม่"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* ส่วนแสดงข้อความแจ้งเตือน */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}

        {/* ปุ่มยืนยัน */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:bg-blue-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            "อัปเดตรหัสผ่าน"
          )}
        </button>
      </form>
    </div>
  );
}
