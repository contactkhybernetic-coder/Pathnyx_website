"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function SuperAdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals ke states
  const [approveModal, setApproveModal] = useState<any>(null); // Jisko approve karna hai
  const [validityDays, setValidityDays] = useState("30"); 

  const [editModal, setEditModal] = useState<any>(null); // Jisko edit karna hai
  const [editName, setEditName] = useState("");
  const [editLogoFile, setEditLogoFile] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const BOSS_PASSWORD = "12341234"; 
  const IMGBB_API_KEY = "YAHAN_APNI_IMGBB_KEY_PASTE_KAREIN"; // Boss yahan key lazmi daalein

  // Database se data lana
  const fetchSellers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "sellers"));
      const sellersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sellersList.sort((a: any, b: any) => new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime());
      setSellers(sellersList);
    } catch (error) {
      console.error("Data laane me masla:", error);
    }
    setLoading(false);
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (masterPassword === BOSS_PASSWORD) {
      setIsAuthenticated(true);
      fetchSellers();
    } else {
      alert("Ghalat Password! Aap Boss nahi hain.");
    }
  };

  // ================= 1 & 4. APPROVE WITH TIME PERIOD =================
  const handleApproveSubmit = async () => {
    if (!validityDays || Number(validityDays) <= 0) {
      alert("Boss, din (days) sahi likhein!");
      return;
    }
    setActionLoading(true);
    try {
      // Expiry Date calculate karna
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(validityDays));

      await updateDoc(doc(db, "sellers", approveModal.id), { 
        status: "approved",
        expiryDate: expiryDate.toISOString()
      });
      
      alert(`Mubarik Boss! Store ${validityDays} din ke liye Approve ho gaya.`);
      setApproveModal(null);
      fetchSellers();
    } catch (error) {
      alert("Masla aa gaya boss.");
    }
    setActionLoading(false);
  };

  // ================= 3. EDIT STORE (NAME & LOGO) =================
  const handleEditSubmit = async () => {
    if (!editName) {
      alert("Boss, Naam khali nahi chhor sakte!");
      return;
    }
    setActionLoading(true);
    try {
      let updatedLogoUrl = editModal.shopLogo; // Pehle wala logo

      // Agar naya logo lagaya hai toh ImgBB pe upload karein
      if (editLogoFile) {
        const formData = new FormData();
        formData.append("image", editLogoFile);
        const imgResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: "POST",
          body: formData,
        });
        const imgData = await imgResponse.json();
        updatedLogoUrl = imgData.data.url;
      }

      await updateDoc(doc(db, "sellers", editModal.id), { 
        shopName: editName,
        shopLogo: updatedLogoUrl
      });
      
      alert("Store ki details VIP tareeqe se Update ho gayin!");
      setEditModal(null);
      setEditLogoFile(null);
      fetchSellers();
    } catch (error) {
      alert("Update karne me masla aaya.");
    }
    setActionLoading(false);
  };

  // Freeze aur Delete
  const changeStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "sellers", id), { status: newStatus });
      fetchSellers();
    } catch (error) {
      alert("Masla aa gaya boss.");
    }
  };

  const deleteStore = async (id: string) => {
    if (window.confirm("Boss, waqai is dukaan ko hamesha ke liye delete karna hai?")) {
      try {
        await deleteDoc(doc(db, "sellers", id));
        fetchSellers();
      } catch (error) {
        alert("Delete karne me masla aaya.");
      }
    }
  };

  // Time Left calculate karne ka jadoo
  const calculateDaysLeft = (expiryDateString: string) => {
    if (!expiryDateString) return "N/A";
    const expiry = new Date(expiryDateString).getTime();
    const now = new Date().getTime();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} Days Left` : "Expired";
  };


  // ================= SECURITY LOCK SCREEN =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
          <div className="text-5xl mb-4">👑</div>
          <h1 className="text-2xl font-black text-slate-800 mb-6">Boss Panel</h1>
          <input type="password" placeholder="Master Password" value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} className="w-full border-2 rounded-xl p-3 mb-4 text-center tracking-widest outline-none focus:border-red-500 font-bold" />
          <button type="submit" className="w-full bg-red-600 text-white font-bold p-3 rounded-xl hover:bg-red-700 transition">Enter Control Room</button>
        </form>
      </div>
    );
  }

  // ================= MAIN DASHBOARD =================
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans relative">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto bg-[#0f172a] rounded-2xl shadow-lg p-6 mb-8 flex justify-between items-center text-white">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">👑 Super Admin HQ</h1>
          <p className="text-slate-400 text-sm mt-1">Total Stores: {sellers.length}</p>
        </div>
        <button onClick={fetchSellers} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-bold transition shadow-md">
          🔄 Refresh Data
        </button>
      </div>

      {/* Sellers List Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="text-center py-10 text-slate-500 font-bold">Data aa raha hai boss...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
                  <th className="p-4 font-bold">Store Details</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Validity (Time)</th>
                  <th className="p-4 font-bold text-right">Boss Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-500">Abhi koi dukaan nahi bani.</td></tr>
                )}
                {sellers.map((seller) => (
                  <tr key={seller.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {seller.shopLogo ? (
                          <img src={seller.shopLogo} alt="logo" className="w-12 h-12 rounded-lg object-cover border-2 border-slate-200 shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-500">{seller.shopName?.charAt(0) || "S"}</div>
                        )}
                        <div>
                          <p className="font-bold text-[#0f172a] text-lg">{seller.shopName || "No Name"}</p>
                          <p className="text-xs text-slate-400">Joined: {new Date(seller.dateJoined).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{seller.phone}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        seller.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' : 
                        seller.status === 'pending' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {seller.status || "Unknown"}
                      </span>
                    </td>
                    <td className="p-4">
                      {seller.status === 'approved' ? (
                        <span className={`font-bold ${calculateDaysLeft(seller.expiryDate) === 'Expired' ? 'text-red-500' : 'text-[#10b981]'}`}>
                          ⏳ {calculateDaysLeft(seller.expiryDate)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">Not Active</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      
                      {/* Approve Button */}
                      {seller.status !== 'approved' && (
                        <button onClick={() => setApproveModal(seller)} className="bg-[#10b981] text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#059669] shadow-sm">
                          ✅ Approve
                        </button>
                      )}
                      
                      {/* Freeze Button */}
                      {seller.status === 'approved' && (
                        <button onClick={() => changeStatus(seller.id, 'pending')} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-orange-600 shadow-sm">
                          ❄️ Freeze
                        </button>
                      )}

                      {/* Edit Button */}
                      <button onClick={() => { setEditModal(seller); setEditName(seller.shopName); }} className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-200 shadow-sm">
                        ✏️ Edit
                      </button>

                      {/* Delete Button */}
                      <button onClick={() => deleteStore(seller.id)} className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-200 shadow-sm">
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODALS (POPups) ================= */}
      
      {/* 1. Approve Modal (Time Period) */}
      {approveModal && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#0f172a] mb-2">✅ Approve Store</h2>
            <p className="text-slate-500 mb-4 text-sm">Kitne din ke liye store active karna hai?</p>
            <input type="number" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 mb-4 focus:border-[#10b981] outline-none font-bold" placeholder="e.g. 30" />
            <div className="flex gap-2">
              <button onClick={() => setApproveModal(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold p-3 rounded-xl hover:bg-slate-200">Cancel</button>
              <button onClick={handleApproveSubmit} disabled={actionLoading} className="flex-1 bg-[#10b981] text-white font-bold p-3 rounded-xl hover:bg-[#059669]">
                {actionLoading ? "Wait..." : "Approve Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Modal (Name & Logo) */}
      {editModal && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">✏️ Edit Store Details</h2>
            
            <label className="block text-sm font-bold text-slate-700 mb-1">Store Name</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 mb-4 focus:border-blue-500 outline-none font-bold" />
            
            <label className="block text-sm font-bold text-slate-700 mb-1">Change Logo (Optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setEditLogoFile(e.target.files?.[0])} className="w-full border-2 border-dashed border-slate-300 rounded-xl p-2 mb-6 text-sm cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 font-medium" />
            
            <div className="flex gap-2">
              <button onClick={() => {setEditModal(null); setEditLogoFile(null);}} className="flex-1 bg-slate-100 text-slate-600 font-bold p-3 rounded-xl hover:bg-slate-200">Cancel</button>
              <button onClick={handleEditSubmit} disabled={actionLoading} className="flex-1 bg-blue-600 text-white font-bold p-3 rounded-xl hover:bg-blue-700">
                {actionLoading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}