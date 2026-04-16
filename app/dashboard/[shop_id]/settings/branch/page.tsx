//Branch/Warehouse (ตั้งค่าคลังสินค้า)
export default function BranchSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Branch & Warehouse Settings</h1>
      <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="font-bold text-slate-700 mb-4">รายชื่อสาขา/คลังสินค้า</h3>
        <div className="space-y-3">
          <div className="p-4 border border-blue-100 bg-blue-50 rounded-xl flex justify-between items-center">
            <div>
              <p className="font-bold text-blue-900">คลังสินค้าหลัก (Main Warehouse)</p>
              <p className="text-xs text-blue-600">Default</p>
            </div>
            <button className="text-sm text-slate-400">แก้ไข</button>
          </div>
        </div>
      </div>
    </div>
  );
}
