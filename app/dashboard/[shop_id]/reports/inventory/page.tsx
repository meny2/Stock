//Inventory Report (รายงานสต็อกคงเหลือ)
export default function InventoryReportPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Inventory Report</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs uppercase font-bold">รายการสินค้าทั้งหมด</p>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs uppercase font-bold">สินค้าใกล้หมด</p>
          <p className="text-2xl font-bold text-orange-500">0</p>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl h-64 flex items-center justify-center text-slate-400">
        ตารางรายงานสินค้าคงเหลือ
      </div>
    </div>
  );
}
