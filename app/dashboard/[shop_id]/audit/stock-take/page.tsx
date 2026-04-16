//Stock Take (ตรวจนับสต็อก)
export default function StockTakePage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock Take</h1>
          <p className="text-slate-500 text-sm">สร้างและจัดการรายการตรวจนับสต็อกประจำงวด</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + เริ่มการตรวจนับใหม่
        </button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl h-64 flex items-center justify-center text-slate-400">
        ตารางรายการตรวจนับสต็อก
      </div>
    </div>
  );
}
