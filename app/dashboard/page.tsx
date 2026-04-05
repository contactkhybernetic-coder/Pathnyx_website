"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase"; 
import { collection, addDoc, onSnapshot, query, doc, deleteDoc, where, updateDoc, getDoc } from "firebase/firestore";

export default function SellerDashboard() {
  const router = useRouter();
  const [sellerId, setSellerId] = useState("");
  const [shopName, setShopName] = useState("My Store");
  const [expiryDate, setExpiryDate] = useState(""); 
  
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [colors, setColors] = useState(""); 
  const [sizes, setSizes] = useState("");   
  const [imageFiles, setImageFiles] = useState<any[]>([]); 
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadText, setUploadText] = useState("");

  const IMGBB_API_KEY = "bddbc795eeba935596e6be94391ffaef"; 

  // --- 🚀 VIP UI STATES 🚀 ---
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ isOpen: boolean, productId: string }>({ isOpen: false, productId: "" });

  // --- 🚀 TOAST HELPER FUNCTION 🚀 ---
  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000); 
  };

  useEffect(() => {
    const id = localStorage.getItem("sellerId");
    const name = localStorage.getItem("shopName");
    
    if (!id) {
      router.push("/login"); 
    } else {
      setSellerId(id);
      setShopName(name || "My Store");

      const fetchSellerDetails = async () => {
        try {
          const sellerDoc = await getDoc(doc(db, "sellers", id));
          if (sellerDoc.exists()) {
            const data = sellerDoc.data();
            if (data.expiryDate) {
              const d = new Date(data.expiryDate);
              const day = String(d.getDate()).padStart(2, '0');
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const formattedDate = `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
              setExpiryDate(formattedDate);
            }
          }
        } catch (error) {
          console.error("Error fetching seller date", error);
        }
      };
      fetchSellerDetails();
      
      const q = query(collection(db, "products"), where("sellerId", "==", id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        items.sort((a: any, b: any) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        setProducts(items);
      });
      return () => unsubscribe();
    }
  }, [router]);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() });
              resolve(newFile);
            } else {
              resolve(file);
            }
          }, "image/jpeg", 0.7); 
        };
      };
    });
  };

  const handleSaveProduct = async () => {
    if (!itemName || !price) {
      return showToast("Boss, Name aur Price lazmi hai! 🛑", "error");
    }
    setLoading(true);
    setUploadProgress(0);

    try {
      let imageUrls = [];
      
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          setUploadText(`Compressing Image ${i + 1} of ${imageFiles.length}... 🗜️`);
          const compressedFile = await compressImage(imageFiles[i]);
          
          setUploadText(`Uploading Image ${i + 1} of ${imageFiles.length}... 🚀`);
          const formData = new FormData();
          formData.append("image", compressedFile);
          
          const imgResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
          const imgData = await imgResponse.json();
          
          if (!imgData.success) throw new Error("Upload Failed");
          imageUrls.push(imgData.data.url);
          
          const currentProgress = Math.round(((i + 1) / imageFiles.length) * 100);
          setUploadProgress(currentProgress);
        }
      }

      setUploadText("Finalizing... 💾");

      const colorArray = colors ? colors.split(",").map(c => c.trim()).filter(c => c !== "") : [];
      const sizeArray = sizes ? sizes.split(",").map(s => s.trim()).filter(s => s !== "") : [];

      const productData: any = {
        name: itemName,
        price: Number(price),
        description: description || "",
        colors: colorArray,
        sizes: sizeArray,
      };

      if (imageUrls.length > 0) {
        productData.images = imageUrls;
      }

      if (editMode) {
        await updateDoc(doc(db, "products", currentProductId), productData);
        showToast("Product Update ho gaya! ✅", "success");
      } else {
        if (imageFiles.length === 0) {
          setLoading(false);
          return showToast("Naya product baghair image ke nahi lag sakta! 🖼️", "error");
        }
        await addDoc(collection(db, "products"), {
          ...productData,
          sellerId: sellerId,
          shopName: shopName,
          dateAdded: new Date().toISOString()
        });
        showToast("Success! Item dukaan mein lag gaya. 🚀", "success");
      }
      
      resetForm();
    } catch (error) {
      showToast("Error: Internet ya connection check karein!", "error");
    }
    setLoading(false);
    setUploadProgress(0);
    setUploadText("");
  };

  const resetForm = () => {
    setItemName(""); setPrice(""); setDescription(""); setColors(""); setSizes(""); setImageFiles([]);
    setEditMode(false); setCurrentProductId("");
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditClick = (product: any) => {
    setEditMode(true);
    setCurrentProductId(product.id);
    setItemName(product.name);
    setPrice(product.price.toString());
    setDescription(product.description);
    setColors(product.colors?.join(", ") || "");
    setSizes(product.sizes?.join(", ") || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🚀 VIP DELETE CONFIRMATION 🚀
  const executeDelete = async () => {
    if (confirmDeleteModal.productId) {
      await deleteDoc(doc(db, "products", confirmDeleteModal.productId));
      setConfirmDeleteModal({ isOpen: false, productId: "" });
      showToast("Product hamesha ke liye Delete ho gaya! 🗑️", "success");
    }
  };

  if (!sellerId) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500 italic">Security Check... 🛡️</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20 relative">
      
      {/* 🚀 CUSTOM TOAST NOTIFICATION UI 🚀 */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 w-[90%] max-w-sm">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border ${
            toastMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 
            toastMessage.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 
            'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <span className="text-xl">
              {toastMessage.type === 'success' ? '✅' : toastMessage.type === 'error' ? '🛑' : 'ℹ️'}
            </span>
            <span className="text-sm leading-tight">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a]">Workspace</h1>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-xs font-bold text-[#10b981] uppercase tracking-widest">{shopName} ✅</p>
             {expiryDate && (
               <p className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full border border-orange-200">
                 Approved Till: {expiryDate}
               </p>
             )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.open(`/${shopName}`, '_blank')} className="bg-[#0f172a] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition">
            View Shop
          </button>
          <button onClick={() => { localStorage.clear(); router.push("/login"); }} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition">
            Logout
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-200 mb-10">
        <h2 className="text-xl font-bold text-[#0f172a] mb-6">
          {editMode ? "✏️ Edit Product" : "📦 Add New Product"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Product Name" className="w-full border-2 rounded-xl p-3 focus:border-[#f97316] outline-none font-medium" />
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (Rs)" className="w-full border-2 rounded-xl p-3 focus:border-[#f97316] outline-none font-medium" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (Optional)" className="w-full border-2 rounded-xl p-3 h-28 focus:border-[#f97316] outline-none font-medium" />
          </div>
          <div className="space-y-4">
            <input type="text" value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Colors (Red, Black...)" className="w-full border-2 rounded-xl p-3 focus:border-[#10b981] outline-none font-medium" />
            <input type="text" value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="Sizes (S, M, L, XL...)" className="w-full border-2 rounded-xl p-3 focus:border-[#10b981] outline-none font-medium" />
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">Product Images</label>
              <input id="file-upload" type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files || []))} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-700 font-bold" />
            </div>
          </div>
        </div>

        {/* 🚀 LIVE PROGRESS BAR 🚀 */}
        {loading && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#f97316] animate-pulse">{uploadText}</span>
              <span className="text-xs font-black text-slate-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div className="bg-[#f97316] h-2 rounded-full transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleSaveProduct} disabled={loading} className="flex-1 bg-[#f97316] text-white font-black text-lg p-4 rounded-xl shadow-lg hover:bg-[#ea580c] transition disabled:bg-slate-300">
            {loading ? "Please Wait..." : editMode ? "Update Product" : "Save Product"}
          </button>
          {editMode && (
            <button onClick={resetForm} disabled={loading} className="bg-slate-200 text-slate-600 font-bold px-6 py-4 rounded-xl transition hover:bg-slate-300">Cancel</button>
          )}
        </div>
      </div>

      {/* Premium Inventory Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-[#0f172a] mb-6">📋 Your Inventory ({products.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group hover:shadow-md transition">
              <div className="relative h-48 bg-slate-50">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg font-bold text-[10px] backdrop-blur-md">
                  Rs {item.price}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#0f172a] truncate text-sm mb-3">{item.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(item)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs hover:bg-orange-50 hover:text-orange-600 transition">Edit</button>
                  <button onClick={() => setConfirmDeleteModal({ isOpen: true, productId: item.id })} className="bg-red-50 text-red-500 font-bold py-2 px-3 rounded-xl text-xs hover:bg-red-100 transition">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 CUSTOM DELETE CONFIRMATION MODAL 🚀 */}
      {confirmDeleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 text-center border-4 border-red-500">
            <div className="text-5xl mb-4">🗑️</div>
            <h2 className="text-2xl font-black mb-2 text-slate-800">Delete Product?</h2>
            <p className="text-sm font-bold text-slate-500 mb-6">
              Kya aap waqai is item ko dukaan se hatana chahte hain? Ye wapas nahi aayega boss.
            </p>
            
            <div className="flex gap-2">
               <button onClick={() => setConfirmDeleteModal({ isOpen: false, productId: "" })} className="flex-1 bg-slate-100 text-slate-600 font-bold p-4 rounded-xl hover:bg-slate-200 transition">Cancel</button>
               <button onClick={executeDelete} className="flex-1 bg-red-600 text-white font-black p-4 rounded-xl shadow-lg hover:bg-red-700 transition active:scale-95">
                 Yes, Delete
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}