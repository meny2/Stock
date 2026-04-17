"use client"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { 
  Edit2, 
  Trash2, 
  GripVertical, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle 
} from "lucide-react"

// 1. อัปเดต Interface ให้มี sortDirection
interface CategoryListProps {
  shopId: string;
  onEdit: (cat: any) => void;
  searchTerm: string;
  sortBy: "name" | "sort_order";
  sortDirection: "asc" | "desc"; // เพิ่มบรรทัดนี้
}

export default function CategoryList({ 
  shopId, 
  onEdit, 
  searchTerm, 
  sortBy,
  sortDirection // รับค่ามาใช้งาน
}: CategoryListProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, category: any | null }>({
    isOpen: false,
    category: null
  })

  const fetchCategories = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('shop_id', shopId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (data) setCategories(data)
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [shopId])

  const toggleStatus = async (category: any) => {
    const newStatus = !category.is_active;
    const catId = category.id;
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, is_active: newStatus } : c));
    setIsUpdating(catId);
    const supabase = createClient();
    const { error } = await supabase.from('categories').update({ is_active: newStatus }).eq('id', catId);
    if (error) {
      setCategories(prev => prev.map(c => c.id === catId ? { ...c, is_active: !newStatus } : c));
      alert("Error: " + error.message);
    }
    setIsUpdating(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.category) return
    const catId = deleteConfirm.category.id
    setIsDeleting(catId)
    setDeleteConfirm({ isOpen: false, category: null })
    const supabase = createClient()
    const { error } = await supabase.from('categories').update({ deleted_at: new Date().toISOString() }).eq('id', catId)
    if (!error) setCategories(prev => prev.filter(c => c.id !== catId))
    setIsDeleting(null)
  }

  // --- 2. ปรับปรุง Logic การเรียงลำดับ (Sort) ---
  const getProcessedCategories = () => {
    let list = [...categories];
    
    if (searchTerm) {
      list = list.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    list.sort((a, b) => {
      let result = 0;
      if (sortBy === "name") {
        result = a.name.localeCompare(b.name, 'th');
      } else {
        result = a.sort_order - b.sort_order;
      }
      // สลับทิศทางตาม sortDirection
      return sortDirection === "asc" ? result : -result;
    });
    
    return list;
  };

  const processedList = getProcessedCategories();

  const renderRows = (parentId: string | null = null, level = 0) => {
    const itemsToRender = searchTerm 
      ? (level === 0 ? processedList : []) 
      : processedList.filter(cat => cat.parent_id === parentId);

    return itemsToRender.map(cat => (
      <div key={cat.id}>
        <div 
          className={`group flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 transition-colors ${level > 0 ? 'bg-gray-50/30' : 'bg-white'}`}
          style={{ paddingLeft: searchTerm ? '1rem' : `${(level * 2) + 1}rem` }}
        >
          <div className="flex items-center gap-3">
            {!searchTerm && <GripVertical className="text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" size={18} />}
            {level > 0 && !searchTerm && <ChevronRight size={14} className="text-gray-400" />}
            <span className={`font-bold transition-opacity ${level === 0 ? 'text-gray-800' : 'text-gray-600 text-sm'} ${!cat.is_active ? 'opacity-40' : 'opacity-100'}`}>
              {cat.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
             <button
                onClick={() => toggleStatus(cat)}
                disabled={isUpdating === cat.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border transition-all ${
                  cat.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"
                }`}
             >
                {isUpdating === cat.id ? <Loader2 size={10} className="animate-spin" /> : cat.is_active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                <span className="hidden sm:inline">{cat.is_active ? "ACTIVE" : "INACTIVE"}</span>
             </button>

             <div className="text-[11px] font-bold text-gray-300 w-16 text-center">Order: {cat.sort_order}</div>
             
             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isDeleting === cat.id ? (
                  <Loader2 size={16} className="animate-spin text-gray-400 mx-4" />
                ) : (
                  <>
                    <button onClick={() => onEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Edit2 size={16} /></button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, category: cat })} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                  </>
                )}
             </div>
          </div>
        </div>
        {!searchTerm && renderRows(cat.id, level + 1)}
      </div>
    ));
  };

  if (loading) return <div className="p-12 text-center text-gray-400 flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> กำลังโหลด...</div>

  return (
    <div className="relative">
      {/* Confirmation Dialog */}
      {deleteConfirm.isOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden">
               <div className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4"><AlertCircle size={32} /></div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">ยืนยันการลบ?</h3>
                  <p className="text-gray-500 text-sm italic">"{deleteConfirm.category?.name}"</p>
               </div>
               <div className="flex border-t border-gray-50 p-2 gap-2">
                  <button onClick={() => setDeleteConfirm({ isOpen: false, category: null })} className="flex-1 py-3 text-sm font-bold text-gray-400">ยกเลิก</button>
                  <button onClick={handleDelete} className="flex-1 py-3 text-sm font-bold text-white bg-red-500 rounded-xl">ลบข้อมูล</button>
               </div>
            </div>
         </div>
      )}

      <div className="divide-y divide-gray-50">
        {processedList.length === 0 ? (
          <div className="p-20 text-center text-gray-400">ไม่พบหมวดหมู่ที่ค้นหา</div>
        ) : (
          renderRows(null)
        )}
      </div>
    </div>
  );
}
