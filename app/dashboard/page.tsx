"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase"; 
import { collection, addDoc, onSnapshot, query, doc, deleteDoc, where, updateDoc } from "firebase/firestore";

export default function SellerDashboard() {
  const router = useRouter();
  const [sellerId, setSellerId] = useState("");
  const [shopName, setShopName] = useState("My Store");
  
  // States for Product Form
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [colors, setColors] = useState(""); 
  const [sizes, setSizes] = useState("");   
  const [imageFiles, setImageFiles] = useState<any[]>([]); 
  
  // States for UI & Editing
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState("");

  const IMGBB_API_KEY = "bddbc795eeba935596e6be94391ffaef"; 

  useEffect(() => {
    const id = localStorage.getItem("sellerId");
    const name = localStorage.getItem("shopName");
    
    if (!id) {
      router.push("/login"); 
    } else {
      setSellerId(id);
      setShopName(name || "My Store");
      
      const q = query(collection(db, "products"), where("sellerId", "==", id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        items.sort((a: any, b: any) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        setProducts(items);
      });
      return () => unsubscribe();
    }
  }, [router]);

  const handleSaveProduct = async () => {
    if (!itemName || !price) {
      alert("Boss, Name aur Price toh lazmi hai!");
      return;
    }
    setLoading(true);

    try {
      let imageUrls = [];
      
      // Agar naye images select kiye hain toh upload karein
      if (imageFiles.length > 0) {
        const uploadPromises = Array.from(imageFiles).map(async (file: any) => {
          const formData = new FormData();
          formData.append("image", file);
          const imgResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
          const imgData = await imgResponse.json();
          return imgData.data.url;
        });
        imageUrls = await Promise.all(uploadPromises);
      }

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
        // UPDATE Logic
        await updateDoc(doc(db, "products", currentProductId), productData);
        alert("Product Update ho gaya boss! ✅");
      } else {
        // ADD Logic
        if (imageFiles.length === 0) {
          alert("Naya product baghair image ke nahi lag sakta boss!");
          setLoading(false);
          return;
        }
        await addDoc(collection(db, "products"), {
          ...productData,
          sellerId: sellerId,
          shopName: shopName,
          dateAdded: new Date().toISOString()
        });
        alert("Naya Item lag gaya! 🚀");
      }
      
      // Reset Form
      resetForm();
    } catch (error) {
      alert("Kuch masla hua hai boss, API Key check karein.");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setItemName(""); setPrice(""); setDescription(""); setColors(""); setSizes(""); setImageFiles([]);
    setEditMode(false); setCurrentProductId("");
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

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete kar dein boss?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  if (!sellerId) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Checking Security...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-20">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a]">Workspace</h1>
          <p className="text-sm font-bold text-[#10b981]">{shopName} ✅</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.open(`/${shopName}`, '_blank')} className="bg-[#0f172a] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition hover:bg-slate-800">
            View Shop
          </button>
          <button onClick={() => { localStorage.clear(); router.push("/login"); }} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition">
            Logout
          </button>
        </div>
      </div>

      {/* Product Form Section */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-200 mb-10">
        <h2 className="text-xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
          {editMode ? "✏️ Edit Product Details" : "📦 Add New Product"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Product Name" className="w-full border-2 rounded-xl p-3 outline-none focus:border-[#f97316] font-medium" />
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (Rs)" className="w-full border-2 rounded-xl p-3 outline-none focus:border-[#f97316] font-medium" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (Optional)" className="w-full border-2 rounded-xl p-3 h-28 outline-none focus:border-[#f97316] font-medium" />
          </div>
          <div className="space-y-4">
            <input type="text" value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Colors (e.g. Red, Black)" className="w-full border-2 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" />
            <input type="text" value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="Sizes (e.g. S, M, L)" className="w-full border-2 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" />
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Product Images {editMode && "(Only if changing)"}</label>
              <input type="file" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-700 font-bold" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSaveProduct} disabled={loading} className="flex-1 bg-[#f97316] text-white font-black text-lg p-4 rounded-xl shadow-lg hover:bg-[#ea580c] transition disabled:bg-orange-300">
            {loading ? "Saving..." : editMode ? "Update Product" : "Save Product"}
          </button>
          {editMode && (
            <button onClick={resetForm} className="bg-slate-200 text-slate-600 font-bold px-6 py-4 rounded-xl hover:bg-slate-300">Cancel</button>
          )}
        </div>
      </div>

      {/* Grid List Section */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0f172a]">📋 Your Inventory ({products.length})</h2>
        </div>

        {/* 🚀 VIP GRID LAYOUT 🚀 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="relative h-48 bg-slate-100">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
                <div className="absolute top-2 right-2 bg-[#f97316] text-white px-3 py-1 rounded-lg font-black text-sm shadow-lg">
                  Rs {item.price}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-[#0f172a] truncate mb-3">{item.name}</h3>
                
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(item)} className="flex-1 bg-blue-50 text-blue-600 font-bold py-2 rounded-xl text-sm hover:bg-blue-100 transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-50 text-red-600 font-bold py-2 px-3 rounded-xl text-sm hover:bg-red-100 transition">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No products found. Add your first item above! ✨</p>
          </div>
        )}
      </div>

    </div>
  );
}