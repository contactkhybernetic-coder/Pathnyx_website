"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "../firebase"; 
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";

export default function DynamicCustomerStore() {
  const params = useParams();
  const rawShopName = params.shopName; // URL se naam nikalna
  const decodedShopName = decodeURIComponent(rawShopName as string); // Agar naam me space ho toh theek karna

  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerData, setCustomerData] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    const fetchStoreData = async () => {
      // 1. Dukaan dhoondo database me
      const q = query(collection(db, "sellers"), where("shopName", "==", decodedShopName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setLoading(false);
        return; // Dukaan nahi mili
      }

      const sellerData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      setSeller(sellerData);

      // 2. Is dukaan ke items laao (sellerId ke zariye)
      const productsQuery = query(collection(db, "products"), where("sellerId", "==", sellerData.id));
      const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(items);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchStoreData();
  }, [decodedShopName]);

  const handleOrderSubmit = () => {
    if(!customerData.name || !customerData.phone || !customerData.address) {
        alert("Boss, details poori likhein!");
        return;
    }

    const itemsList = products.map(p => `- ${p.name} (Rs ${p.price})`).join('\n');
    
    // Asli Jadoo: Seller ka apna WhatsApp number use ho raha hai!
    const orderText = `*🛍️ NEW ORDER*\n\n*👤 Customer:*\n${customerData.name}\n${customerData.phone}\n${customerData.address}\n\n*📦 Items:*\n${itemsList}\n\n_Generated via Smart Mini Store SaaS_`;
    window.open(`https://wa.me/${seller.phone}?text=${encodeURIComponent(orderText)}`, "_blank");
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xl font-bold text-slate-500 animate-pulse">Dukaan Khul Rahi Hai... ⚡</div>;
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-black text-[#0f172a]">Store Not Found</h1>
        <p className="text-slate-500 font-medium mt-2">Yeh dukaan majood nahi hai ya link ghalat hai.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 relative">
      
      {/* Store Header (Dynamic Logo & Name) */}
      <div className="bg-[#0f172a] pt-12 pb-8 px-4 rounded-b-[40px] shadow-lg text-center">
        {seller.shopLogo ? (
          <img src={seller.shopLogo} alt="Shop Logo" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-md object-cover bg-white" />
        ) : (
          <div className="w-24 h-24 bg-white text-[#0f172a] rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-black shadow-md border-4 border-slate-200">
            {seller.shopName.charAt(0)}
          </div>
        )}
        <h1 className="text-3xl font-black text-white tracking-widest uppercase">{seller.shopName}</h1>
        <p className="text-[#10b981] text-sm mt-2 font-bold tracking-wide">Verified Seller ✅</p>
      </div>

      {/* Products Grid */}
      <div className="max-w-md mx-auto p-4 mt-4 space-y-6">
        {products.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
             <div className="text-4xl mb-3">📭</div>
             <p className="text-slate-500 font-bold">Abhi is dukaan me koi item nahi hai.</p>
          </div>
        ) : (
          products.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover bg-slate-100" />
              ) : (
                <div className="h-48 bg-slate-100 flex items-center justify-center text-5xl">📦</div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-[#0f172a] text-lg">{item.name}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-extrabold text-xl text-[#f97316]">Rs {item.price}</span>
                  <button className="bg-[#f97316] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#ea580c] transition shadow-md">
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Checkout Button */}
      {products.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-[#10b981] text-white font-bold text-lg p-4 rounded-2xl shadow-xl hover:bg-[#059669] transition flex justify-between items-center">
            <span className="bg-white text-[#10b981] px-3 py-1 rounded-lg text-sm">{products.length} Items</span>
            <span>Order on WhatsApp 🚀</span>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0f172a]">Delivery Details</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 text-xl font-bold">✕</button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Naam" onChange={(e) => setCustomerData({...customerData, name: e.target.value})} className="w-full border-2 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" />
              <input type="tel" placeholder="WhatsApp No" onChange={(e) => setCustomerData({...customerData, phone: e.target.value})} className="w-full border-2 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" />
              <textarea placeholder="Mukammal Address" onChange={(e) => setCustomerData({...customerData, address: e.target.value})} className="w-full border-2 rounded-xl p-3 outline-none focus:border-[#10b981] h-24 font-medium" />
              <button onClick={handleOrderSubmit} className="w-full bg-[#25D366] text-white font-bold text-lg p-4 rounded-xl shadow-lg shadow-green-200 hover:bg-[#128C7E]">
                Send Order 💬
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}