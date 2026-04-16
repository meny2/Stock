//System Config (ตั้งค่าระบบ)
export default function SystemConfigPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">System Configuration</h1>
      <div className="grid gap-6 max-w-3xl text-sm">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold mb-4">ตั้งค่าบาร์โค้ด & หน่วยนับ</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span>Auto-generate SKU</span>
              <div className="w-10 h-5 bg-slate-200 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span>หน่วยนับมาตรฐาน (ชิ้น, กล่อง, แพ็ค)</span>
              <button className="text-blue-600">จัดการหน่วยนับ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
