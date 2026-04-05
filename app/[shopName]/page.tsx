"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "../firebase"; 
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";

export default function PremiumCustomerStore() {
  const params = useParams();
  const rawShopName = params.shopName;
  const decodedShopName = decodeURIComponent(rawShopName as string);

  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cart & Modal States
  const [cart, setCart] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerData, setCustomerData] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    const fetchStoreData = async () => {
      const q = query(collection(db, "sellers"), where("shopName", "==", decodedShopName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setLoading(false);
        return; 
      }

      const sellerData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      setSeller(sellerData);

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

  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    setSelectedColor("");
    setSelectedSize("");
    setActiveImageIndex(0);
  };

  const addToCart = () => {
    if (selectedProduct.colors?.length > 0 && !selectedColor) return alert("Please select a Color!");
    if (selectedProduct.sizes?.length > 0 && !selectedSize) return alert("Please select a Size!");

    const cartItem = {
      ...selectedProduct,
      cartId: Math.random().toString(), // Unique ID for cart
      selectedColor,
      selectedSize
    };
    setCart([...cart, cartItem]);
    setSelectedProduct(null); // Close Modal
  };

  const handleOrderSubmit = () => {
    if(!customerData.name || !customerData.phone || !customerData.address) {
        alert("Boss, details poori likhein!");
        return;
    }

    let totalBill = 0;
    const itemsList = cart.map(p => {
      totalBill += p.price;
      let extra = [];
      if (p.selectedColor) extra.push(`Color: ${p.selectedColor}`);
      if (p.selectedSize) extra.push(`Size: ${p.selectedSize}`);
      let extraStr = extra.length > 0 ? ` (${extra.join(", ")})` : "";
      return `- ${p.name}${extraStr} - Rs ${p.price}`;
    }).join('\n');
    
    const orderText = `*🛍️ NEW VIP ORDER*\n\n*👤 Customer:*\n${customerData.name}\n${customerData.phone}\n${customerData.address}\n\n*📦 Items Ordered:*\n${itemsList}\n\n*💰 Total Bill: Rs ${totalBill}*\n\n_Generated via Pathnyx Smart Store_`;
    
    window.open(`https://wa.me/${seller.phone}?text=${encodeURIComponent(orderText)}`, "_blank");
    setCart([]); // Empty cart after order
    setIsCheckoutOpen(false);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500 animate-pulse">Store is loading... ⚡</div>;

  if (!seller) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-black text-[#0f172a]">Store Not Found</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 relative selection:bg-[#f97316] selection:text-white">
      
      {/* 🌟 Premium Header */}
      <div className="bg-gradient-to-b from-[#0f172a] to-slate-800 pt-16 pb-12 px-6 rounded-b-[3rem] shadow-2xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        {seller.shopLogo ? (
          <img src={seller.shopLogo} alt="Logo" className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-white shadow-xl object-cover relative z-10" />
        ) : (
          <div className="w-28 h-28 bg-white text-[#0f172a] rounded-full mx-auto mb-4 flex items-center justify-center text-5xl font-black shadow-xl border-4 border-slate-200 relative z-10">
            {seller.shopName.charAt(0)}
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight relative z-10">{seller.shopName}</h1>
        <p className="text-[#10b981] text-sm mt-3 font-bold tracking-widest uppercase relative z-10 bg-green-900/30 inline-block px-4 py-1 rounded-full border border-green-500/30">Verified Seller ✅</p>
      </div>

      {/* 🌟 Product Grid (Premium Card Layout) */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <h2 className="text-2xl font-black text-[#0f172a] mb-6 px-2">Featured Products ✨</h2>
        
        {products.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-500 font-bold">This store is currently empty.</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((item) => (
              <div key={item.id} onClick={() => openProductModal(item)} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-xl transition duration-300 group">
                <div className="h-48 md:h-64 bg-slate-100 relative overflow-hidden">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {item.colors?.length > 0 && <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">Colors</span>}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#0f172a] truncate text-sm md:text-base">{item.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-black text-[#f97316] text-lg">Rs {item.price}</span>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-[#f97316] group-hover:text-white transition">
                      +
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-40 animate-bounce">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-[#10b981] text-white font-black text-lg p-5 rounded-2xl shadow-2xl shadow-green-200 hover:bg-[#059669] transition flex justify-between items-center border border-green-400">
            <span className="bg-white text-[#10b981] px-3 py-1 rounded-lg text-sm">{cart.length} Items</span>
            <span>View Cart ➔</span>
          </button>
        </div>
      )}

      {/* 🌟 Product Detail Modal (Pop-up) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95">
            
            {/* Header / Close */}
            <div className="p-4 flex justify-between items-center border-b border-slate-100 absolute top-0 w-full z-10 bg-gradient-to-b from-black/50 to-transparent">
              <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-slate-800 shadow-lg">✕</button>
            </div>

            {/* Images Scroll */}
            <div className="h-72 bg-slate-100 relative">
               {selectedProduct.images?.[activeImageIndex] ? (
                 <img src={selectedProduct.images[activeImageIndex]} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
               )}
            </div>

            {/* Thumbnails */}
            {selectedProduct.images?.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto bg-white border-b border-slate-100">
                {selectedProduct.images.map((img: string, idx: number) => (
                  <img key={idx} src={img} onClick={() => setActiveImageIndex(idx)} className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition ${activeImageIndex === idx ? 'border-[#f97316]' : 'border-transparent'}`} />
                ))}
              </div>
            )}

            <div className="p-6 overflow-y-auto">
              <h2 className="text-2xl font-black text-[#0f172a] leading-tight mb-2">{selectedProduct.name}</h2>
              <p className="text-3xl font-black text-[#f97316] mb-4">Rs {selectedProduct.price}</p>
              {selectedProduct.description && <p className="text-slate-500 mb-6 text-sm">{selectedProduct.description}</p>}

              {/* Colors Selection */}
              {selectedProduct.colors?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-[#0f172a] mb-3">Select Color:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color: string) => (
                      <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition ${selectedColor === color ? 'border-[#f97316] bg-orange-50 text-[#f97316]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes Selection */}
              {selectedProduct.sizes?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-[#0f172a] mb-3">Select Size:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size: string) => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition ${selectedSize === size ? 'border-[#f97316] bg-orange-50 text-[#f97316]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={addToCart} className="w-full bg-[#0f172a] text-white font-black text-lg p-4 rounded-xl shadow-lg hover:bg-slate-800 transition active:scale-95">
                Add to Cart 🛒
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 Final Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-[#0f172a]">Delivery Details</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 text-xl font-bold bg-slate-100 w-8 h-8 rounded-full">✕</button>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-xl mb-6 border border-orange-100">
               <p className="text-orange-800 font-bold text-sm text-center">You are ordering {cart.length} items.</p>
            </div>

            <div className="space-y-4">
              <input type="text" placeholder="Full Name" onChange={(e) => setCustomerData({...customerData, name: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" />
              <input type="tel" placeholder="WhatsApp Number" onChange={(e) => setCustomerData({...customerData, phone: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" />
              <textarea placeholder="Complete Delivery Address" onChange={(e) => setCustomerData({...customerData, address: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] h-24 font-medium" />
              <button onClick={handleOrderSubmit} className="w-full bg-[#25D366] text-white font-black text-lg p-4 rounded-xl shadow-lg hover:bg-[#128C7E] transition active:scale-95">
                Confirm on WhatsApp 💬
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}