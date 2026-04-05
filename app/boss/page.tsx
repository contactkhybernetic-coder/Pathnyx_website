"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function BossPanel() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [bossPassword, setBossPassword] = useState("");

  const SECRET_KEY = "umar786"; 
  const IMGBB_API_KEY = "bddbc795eeba935596e6be94391ffaef";

  // --- 🚀 VIP UI STATES 🚀 ---
  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  // Edit Modal States
  const [editingSeller, setEditingSeller] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Prompt Modal States (For Days)
  const [promptModal, setPromptModal] = useState<{ isOpen: boolean, action: 'approve' | 'add_days', sellerId: string, currentExpiry?: string }>({ isOpen: false, action: 'approve', sellerId: "" });
  const [inputDays, setInputDays] = useState("30");

  // Confirm Modal States (For Freeze/Delete)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, action: 'freeze' | 'delete', sellerId: string, sellerName?: string }>({ isOpen: false, action: 'freeze', sellerId: "" });

  useEffect(() => {
    if (isAuthorized) {
      const unsubscribe = onSnapshot(collection(db, "sellers"), (snapshot) => {
        const list: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a: any, b: any) => new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime());
        setSellers(list);
      });
      return () => unsubscribe();
    }
  }, [isAuthorized]);

  // --- 🚀 CUSTOM TOAST FUNCTION 🚀 ---
  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000); // 3 seconds baad khud band ho jayega
  };

  // --- ACTIONS (USING VIP MODALS) ---

  const handlePromptSubmit = async () => {
    const days = parseInt(inputDays);
    if (isNaN(days) || days <= 0) {
      showToast("Sahi number likhein boss!", "error");
      return;
    }

    const { action, sellerId, currentExpiry } = promptModal;

    if (action === 'approve') {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
      await updateDoc(doc(db, "sellers", sellerId), {
        isActive: true,
        status: "approved",
        expiryDate: expiry.toISOString()
      });
      showToast(`Dukaan ${days} din ke liye Approve ho gayi! ✅`, "success");
    } 
    else if (action === 'add_days') {
      let baseDate = new Date();
      if (currentExpiry && new Date(currentExpiry) > baseDate) {
        baseDate = new Date(currentExpiry);
      }
      baseDate.setDate(baseDate.getDate() + days);
      await updateDoc(doc(db, "sellers", sellerId), {
        isActive: true,
        status: "approved",
        expiryDate: baseDate.toISOString()
      });
      showToast(`${days} Din mazeed add kar diye gaye hain! ⏳✅`, "success");
    }
    
    setPromptModal({ isOpen: false, action: 'approve', sellerId: "" });
  };

  const handleConfirmSubmit = async () => {
    const { action, sellerId } = confirmModal;

    if (action === 'freeze') {
      await updateDoc(doc(db, "sellers", sellerId), { isActive: false, status: "frozen" });
      showToast("Account Blocked! ❄️", "info");
    } 
    else if (action === 'delete') {
      await deleteDoc(doc(db, "sellers", sellerId));
      showToast("Store Deleted! 🗑️", "success");
    }
    
    setConfirmModal({ isOpen: false, action: 'freeze', sellerId: "" });
  };

  // --- EDIT LOGIC ---
  const openEditModal = (seller: any) => {
    setEditingSeller(seller);
    setEditName(seller.shopName);
    setEditLogoFile(null);
  };

  const saveEditedStore = async () => {
    setEditLoading(true);
    try {
      let logoUrl = editingSeller.shopLogo;
      if (editLogoFile) {
        const formData = new FormData();
        formData.append("image", editLogoFile);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) logoUrl = data.data.url;
      }
      await updateDoc(doc(db, "sellers", editingSeller.id), { shopName: editName.trim(), shopLogo: logoUrl });
      showToast("Store details updated! ✅", "success");
      setEditingSeller(null);
    } catch (e) { 
      showToast("Update error aaya!", "error"); 
    }
    setEditLoading(false);
  };

  const formatJoinedDate = (val: any) => {
    if (!val) return "N/A";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return "N/A"; }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border-4 border-[#10b981]">
          <h1 className="text-3xl font-black mb-6 text-slate-800">Boss Access 👑</h1>
          <input type="password" placeholder="Secret Key" onChange={(e) => setBossPassword(e.target.value)} className="w-full border-2 p-4 rounded-2xl mb-4 text-center font-bold outline-none focus:border-[#10b981]" />
          <button onClick={() => bossPassword === SECRET_KEY ? setIsAuthorized(true) : alert("Wrong Password!")} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black hover:bg-slate-800 transition active:scale-95">Unlock Panel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans relative">
      
      {/* 🚀 CUSTOM TOAST NOTIFICATION 🚀 */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-3 border ${
            toastMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 
            toastMessage.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 
            'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <span>
              {toastMessage.type === 'success' ? '✅' : toastMessage.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            {toastMessage.text}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-slate-800 mb-2">Pathnyx Control 👑</h1>
        <p className="text-slate-500 font-bold mb-10">Total Active Stores: {sellers.length}</p>

        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-200 overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="p-6">Store Name & Contact</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-center">Manage Access</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sellers.map((s) => {
                const isLive = s.isActive === true || s.status === "approved";
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        {s.shopLogo ? (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-sm p-1">
                            <img src={s.shopLogo} className="w-full h-full object-contain rounded-xl" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-sm">{s.shopName?.charAt(0)}</div>
                        )}
                        <div>
                          <p className="font-black text-slate-800 text-lg leading-tight mb-0.5">{s.shopName}</p>
                          <p className="text-xs text-slate-500 font-bold">{s.phone} <span className="text-slate-300 font-normal">|</span> Joined: {formatJoinedDate(s.joinedAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      {isLive ? 
                        <div className="inline-block bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-green-200 shadow-sm">Live ✅</div> : 
                        <div className="inline-block bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-red-200 shadow-sm">Locked 🛑</div>
                      }
                      {s.expiryDate && isLive && (
                        <p className="text-[10px] font-black text-orange-500 mt-2 tracking-wide">Ends: {formatJoinedDate(s.expiryDate)}</p>
                      )}
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-2">
                        {/* 🟢 OPEN APPROVE MODAL */}
                        {!isLive ? (
                           <button onClick={() => { setInputDays("30"); setPromptModal({ isOpen: true, action: 'approve', sellerId: s.id }); }} className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-[11px] font-black hover:bg-green-700 shadow-md transition active:scale-95">Approve Store</button>
                        ) : (
                           <button onClick={() => setConfirmModal({ isOpen: true, action: 'freeze', sellerId: s.id, sellerName: s.shopName })} className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-[11px] font-black hover:bg-orange-600 shadow-md transition active:scale-95">Freeze ❄️</button>
                        )}
                        {/* 🔵 OPEN ADD DAYS MODAL */}
                        <button onClick={() => { setInputDays("30"); setPromptModal({ isOpen: true, action: 'add_days', sellerId: s.id, currentExpiry: s.expiryDate }); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-[11px] font-black hover:bg-blue-700 shadow-md transition active:scale-95">+ Add Days ⏳</button>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(s)} className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-[11px] font-black hover:bg-slate-200 transition active:scale-95">Edit ✏️</button>
                        <button onClick={() => setConfirmModal({ isOpen: true, action: 'delete', sellerId: s.id, sellerName: s.shopName })} className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-[11px] font-black hover:bg-red-100 transition active:scale-95">Delete 🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 1. EDIT STORE MODAL 🚀 */}
      {editingSeller && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 relative border-4 border-slate-200">
            <button onClick={() => setEditingSeller(null)} className="absolute top-4 right-4 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-500 hover:bg-slate-200 transition">✕</button>
            <h2 className="text-2xl font-black mb-6 text-slate-800">Edit Store ✏️</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Store Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold outline-none focus:border-blue-500" />
              </div>
              <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">New Logo (Optional)</p>
                <input type="file" accept="image/*" onChange={(e) => setEditLogoFile(e.target.files ? e.target.files[0] : null)} className="w-full text-xs font-bold text-slate-500" />
              </div>
              <button onClick={saveEditedStore} disabled={editLoading} className="w-full bg-blue-600 text-white font-black p-4 rounded-xl shadow-lg hover:bg-blue-700 transition active:scale-95 mt-2">
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 2. VIP PROMPT MODAL (For Days) 🚀 */}
      {promptModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 text-center border-4 border-[#10b981]">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-black mb-2 text-slate-800">
              {promptModal.action === 'approve' ? "Approve Store" : "Add Extra Days"}
            </h2>
            <p className="text-sm font-bold text-slate-500 mb-6">Kitne din (Days) dena chahte hain boss?</p>
            
            <input 
              type="number" 
              value={inputDays} 
              onChange={(e) => setInputDays(e.target.value)} 
              className="w-full border-2 border-slate-200 p-4 rounded-2xl font-black text-center text-2xl text-slate-800 outline-none focus:border-[#10b981] mb-4" 
              autoFocus
            />
            
            <div className="flex gap-2">
               <button onClick={() => setPromptModal({ isOpen: false, action: 'approve', sellerId: "" })} className="flex-1 bg-slate-100 text-slate-600 font-bold p-3 rounded-xl hover:bg-slate-200 transition">Cancel</button>
               <button onClick={handlePromptSubmit} className="flex-1 bg-[#10b981] text-white font-black p-3 rounded-xl shadow-lg hover:bg-[#059669] transition active:scale-95">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 3. VIP CONFIRM MODAL (For Freeze/Delete) 🚀 */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 text-center border-4 ${confirmModal.action === 'delete' ? 'border-red-500' : 'border-orange-500'}`}>
            <div className="text-5xl mb-4">{confirmModal.action === 'delete' ? '🗑️' : '❄️'}</div>
            <h2 className="text-2xl font-black mb-2 text-slate-800">Are you sure?</h2>
            <p className="text-sm font-bold text-slate-500 mb-6">
              Kya aap waqai <span className="text-slate-800 font-black">"{confirmModal.sellerName}"</span> ka account {confirmModal.action === 'delete' ? "hamesha ke liye delete" : "freeze (block)"} karna chahte hain?
            </p>
            
            <div className="flex gap-2">
               <button onClick={() => setConfirmModal({ isOpen: false, action: 'freeze', sellerId: "" })} className="flex-1 bg-slate-100 text-slate-600 font-bold p-4 rounded-xl hover:bg-slate-200 transition">No, Cancel</button>
               <button onClick={handleConfirmSubmit} className={`flex-1 text-white font-black p-4 rounded-xl shadow-lg transition active:scale-95 ${confirmModal.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                 Yes, {confirmModal.action === 'delete' ? "Delete" : "Freeze"}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}