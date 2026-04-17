"use client"

import React, { useState } from "react"
import CategoryList from "./category-list"
import CategoryDialog from "./category-dialog"

import { 
  Layers, 
  Plus, 
  Search,
  ArrowUpDown,
  SortAsc,
  SortDesc
} from "lucide-react"

export default function CategoryPage({ params }: { params: Promise<{ shop_id: string }> }) {
  const { shop_id } = React.use(params);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  // เพิ่ม State สำหรับทิศทางการเรียงลำดับ
  const [sortBy, setSortBy] = useState<"name" | "sort_order">("sort_order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  // ฟังก์ชันสลับการเรียงลำดับ
  const handleSortToggle = () => {
    // ถ้ากดปุ่มเดิม ให้สลับทิศทาง (ASC <-> DESC)
    // ถ้ากดใหม่ ให้เปลี่ยนหัวข้อเรียง
    if (sortBy === "sort_order") {
      setSortBy("name");
      setSortOrder("asc");
    } else {
      setSortBy("sort_order");
      setSortOrder("asc");
    }
  };

  const toggleDirection = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Layers className="text-blue-600" size={32} />
              หมวดหมู่สินค้า
            </h1>
            <p className="text-gray-500 text-sm font-medium">จัดโครงสร้างเมนูและหมวดหมู่สำหรับร้านค้าของคุณ</p>
          </div>
          
          <button 
            onClick={() => { setEditingCategory(null); setIsDialogOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-[1.25rem] hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={20} />
            เพิ่มหมวดหมู่
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อหมวดหมู่..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Sort Buttons Group */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={handleSortToggle}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl transition-all text-xs font-black border ${
                sortBy === "name" ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"
              }`}
            >
              <ArrowUpDown size={14} /> 
              {sortBy === "sort_order" ? "เรียงตามลำดับ" : "เรียงตามชื่อ (ก-ฮ)"}
            </button>

            <button 
              onClick={toggleDirection}
              className="p-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all border border-transparent"
              title={sortOrder === "asc" ? "น้อยไปมาก" : "มากไปน้อย"}
            >
              {sortOrder === "asc" ? <SortAsc size={20} /> : <SortDesc size={20} />}
            </button>
          </div>
        </div>

        {/* Category List Component */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <CategoryList 
            key={refreshKey}
            shopId={shop_id} 
            onEdit={handleEdit} 
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortDirection={sortOrder} // ส่งทิศทางการเรียงไปด้วย
          />
        </div>
      </div>

      <CategoryDialog 
        isOpen={isDialogOpen}
        shopId={shop_id}
        initialData={editingCategory}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => { handleRefresh(); setIsDialogOpen(false); }}
      />
    </div>
  )
}
