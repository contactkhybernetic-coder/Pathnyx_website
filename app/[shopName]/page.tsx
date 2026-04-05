"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "../firebase"; 
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";

const pakistanCities = [
  "Abbottabad", "Abdul Hakeem", "Ahmedpur East", "Alipur", "Arifwala", "Attock", "Baddomalhi", "Badin", "Bagh", "Bahawalnagar", "Bahawalpur", "Bakhri Ahmad Khan", "Bannu", "Barakahu", "Basirpur", "Batgram", "Bhakkar", "Bhalwal", "Bhimber", "Burewala", "Chakwal", "Chaman", "Charsadda", "Chichawatni", "Chiniot", "Chishtian", "Chitral", "Choa Saidan Shah", "Chunian", "Dadu", "Daharki", "Darya Khan", "Daska", "Daud Khel", "Dera Ghazi Khan", "Dera Ismail Khan", "Dina", "Dinga", "Dir", "Dunyapur", "Faisalabad", "Fateh Jang", "Fazilpur", "Ferozewala", "Fort Abbas", "Gadoon", "Gambat", "Ghakhar Mandi", "Ghotki", "Gilgit", "Gojra", "Gujar Khan", "Gujranwala", "Gujrat", "Gwadar", "Hafizabad", "Hala", "Hangu", "Haripur", "Haroonabad", "Hasilpur", "Hassan Abdal", "Havelian", "Hazro", "Hub", "Hujra Shah Muqeem", "Hyderabad", "Islamabad", "Jacobabad", "Jahanian", "Jalalpur Jattan", "Jalalpur Pirwala", "Jampur", "Jamshoro", "Jaranwala", "Jauharabad", "Jhang", "Jhelum", "Kabirwala", "Kahuta", "Kalabagh", "Kalasoke", "Kamalia", "Kamar Mushani", "Kambar", "Kamoke", "Kandhkot", "Kanpur", "Kapu", "Karachi", "Karak", "Karor Lal Esan", "Kashmore", "Kasur", "Kazi Ahmed", "Khairpur", "Khanewal", "Khanpur", "Kharian", "Khushab", "Khuzdar", "Kohat", "Kot Addu", "Kot Mithan", "Kot Radha Kishan", "Kotri", "Kulachi", "Kundian", "Kunjah", "Kunri", "Lahore", "Laki Marwat", "Lala Musa", "Larkana", "Layyah", "Liaquatpur", "Lodhran", "Loralai", "Lower Dir", "Ludden", "Mailsi", "Makhdoom Aali", "Malakand", "Mandi Bahauddin", "Mansehra", "Mardan", "Matiari", "Mehar", "Mehrabpur", "Mian Channu", "Mianwali", "Mingora", "Mirpur", "Mirpur Khas", "Mirpur Mathelo", "Mithi", "Moro", "Multan", "Muridke", "Murree", "Muzaffarabad", "Muzaffargarh", "Nankana Sahib", "Narowal", "Nasirabad", "Naudero", "Naushahro Feroze", "Nawabshah", "Nowshera", "Nushki", "Okara", "Ormara", "Paharpur", "Pakpattan", "Panjgur", "Pano Akil", "Pasni", "Pasrur", "Pattoki", "Peshawar", "Phalia", "Pindi Bhattian", "Pindigheb", "Pir Mahal", "Qila Didar Singh", "Quetta", "Rabwah", "Rahim Yar Khan", "Raiwind", "Rajanpur", "Ranipur", "Ratodero", "Rawalakot", "Rawalpindi", "Renala Khurd", "Risalpur", "Rohri", "Sadiqabad", "Safdarabad", "Sahiwal", "Samundri", "Sanghar", "Sangla Hill", "Sarai Alamgir", "Sargodha", "Sehwan Sharif", "Shahdadkot", "Shahdadpur", "Shahpur Chakar", "Shakargarh", "Sheikhupura", "Shikarpur", "Shorkot", "Shujabad", "Sialkot", "Sibi", "Skardu", "Sohawa", "Sukkur", "Swabi", "Swat", "Tando Adam", "Tando Allahyar", "Tando Muhammad Khan", "Tangwani", "Tank", "Taunsa Sharif", "Taxila", "Thari Mirwah", "Thatta", "Timergara", "Toba Tek Singh", "Topi", "Turbat", "Ubauro", "Umarkot", "Upper Dir", "Vehari", "Wah Cantt", "Warburton", "Wazirabad", "Yazman", "Zafarwal", "Zahir Pir", "Zhob", "Ziarat", "Other"
];

const ProductCard = ({ item, onOpenModal }: { item: any, onOpenModal: (item: any, action: 'cart'|'buy') => void }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const nextImg = (e: any) => { e.stopPropagation(); setImgIndex((prev) => (prev + 1) % item.images.length); };
  const prevImg = (e: any) => { e.stopPropagation(); setImgIndex((prev) => (prev - 1 + item.images.length) % item.images.length); };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition duration-300 group flex flex-col cursor-pointer" onClick={() => onOpenModal(item, 'cart')}>
      <div className="w-full aspect-square bg-slate-100 relative overflow-hidden">
        {item.images?.[imgIndex] ? (
          <img src={item.images[imgIndex]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
        {item.images?.length > 1 && (
          <>
            <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 w-8 h-8 rounded-full flex items-center justify-center shadow-md font-bold opacity-0 group-hover:opacity-100 transition">❮</button>
            <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 w-8 h-8 rounded-full flex items-center justify-center shadow-md font-bold opacity-0 group-hover:opacity-100 transition">❯</button>
          </>
        )}
      </div>
      <div className="p-3 md:p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-[#0f172a] line-clamp-2 text-xs md:text-sm leading-tight mb-1">{item.name}</h3>
          <span className="font-black text-[#f97316] text-base md:text-lg">Rs {item.price}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <button onClick={(e) => { e.stopPropagation(); onOpenModal(item, 'cart'); }} className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs hover:border-[#f97316] hover:text-[#f97316] transition">Add to Cart</button>
          <button onClick={(e) => { e.stopPropagation(); onOpenModal(item, 'buy'); }} className="flex-1 bg-[#f97316] text-white font-bold py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs shadow-md hover:bg-[#ea580c] transition">Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default function PremiumCustomerStore() {
  const params = useParams();
  const decodedShopName = decodeURIComponent(params.shopName as string);
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalAction, setModalAction] = useState<'cart' | 'buy'>('cart');
  
  // Modal States
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1); 
  const [modalImgIndex, setModalImgIndex] = useState(0); 
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerData, setCustomerData] = useState({ name: "", phone: "", city: "", address: "" });
  const [copied, setCopied] = useState(false);

  // 🚀 VIP TOAST STATE 🚀
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  // 🚀 TOAST HELPER FUNCTION 🚀
  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000); 
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      const q = query(collection(db, "sellers"), where("shopName", "==", decodedShopName));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) { setLoading(false); return; }
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

  const openProductModal = (product: any, action: 'cart' | 'buy') => {
    setSelectedProduct(product); 
    setModalAction(action); 
    setSelectedColor(""); 
    setSelectedSize("");
    setSelectedQuantity(1); 
    setModalImgIndex(0); 
  };

  const handleAction = () => {
    if (selectedProduct.colors?.length > 0 && !selectedColor) return showToast("Select Color please! 🎨", "error");
    if (selectedProduct.sizes?.length > 0 && !selectedSize) return showToast("Select Size please! 📏", "error");
    
    setCart([...cart, { 
      ...selectedProduct, 
      cartId: Math.random().toString(), 
      selectedColor, 
      selectedSize, 
      quantity: selectedQuantity 
    }]);
    
    setSelectedProduct(null);
    if (modalAction === 'buy') {
      setIsCheckoutOpen(true);
    } else {
      showToast("Item added to Cart! 🛒", "success");
    }
  };

  const removeFromCart = (cartId: string) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    setCart(newCart);
    if (newCart.length === 0) setIsCheckoutOpen(false); 
  };

  // 🚀 VIP ORDER SUBMIT (WITH IMAGE LINKS) 🚀
  const handleOrderSubmit = () => {
    if(!customerData.name || !customerData.phone || !customerData.city || !customerData.address) return showToast("Delivery Details poori karein boss! 📝", "error");
    if(cart.length === 0) return showToast("Aapka Cart khali hai! 🛒", "error");

    let totalBill = 0;
    
    const itemsList = cart.map(p => {
      const itemTotal = p.price * p.quantity;
      totalBill += itemTotal;
      
      const picLink = p.images?.[0] ? `\n🖼️ *Image Link:* ${p.images[0]}` : '';
      
      return `🛒 *${p.quantity}x ${p.name}*
🎨 Color: ${p.selectedColor || 'N/A'}, 📏 Size: ${p.selectedSize || 'N/A'}
💰 Price: Rs ${itemTotal}${picLink}
-----------------------------`;
    }).join('\n');
    
    const orderText = `*🛍️ NEW VIP ORDER*\n\n*👤 CUSTOMER DETAILS:*\n*Name:* ${customerData.name}\n*Phone:* ${customerData.phone}\n*City:* ${customerData.city}\n*Address:* ${customerData.address}\n\n*📦 ITEMS ORDERED:*\n-----------------------------\n${itemsList}\n\n*💰 GRAND TOTAL: Rs ${totalBill}*`;
    
    let formatPhone = seller.phone;
    if(formatPhone.startsWith("0")) formatPhone = "92" + formatPhone.slice(1);
    
    showToast("Opening WhatsApp... 💬", "success");
    window.open(`https://wa.me/${formatPhone}?text=${encodeURIComponent(orderText)}`, "_blank");
    
    setCart([]); 
    setIsCheckoutOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true); 
    showToast("Store Link Copied! 🔗", "success");
    setTimeout(() => setCopied(false), 2000); 
  };

  const cartTotalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 animate-pulse">Loading Store...</div>;
  if (!seller) return <div className="min-h-screen flex items-center justify-center text-2xl font-black">🚫 Store Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 relative">

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
      
      {/* HEADER */}
      <div className="bg-[#0f172a] pt-12 pb-10 px-6 rounded-b-[2.5rem] text-center relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        {seller.shopLogo ? (
          <div className="relative inline-block mx-auto mb-4 z-10">
            <div className="w-24 h-24 rounded-full border-2 border-slate-600 bg-white p-2 flex items-center justify-center overflow-hidden">
              <img src={seller.shopLogo} alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 bg-slate-800 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-black border-2 border-slate-600 relative z-10">{seller.shopName.charAt(0)}</div>
        )}
        <h1 className="text-3xl font-black text-white relative z-10">{seller.shopName}</h1>
        
        <div className="mt-4 flex flex-wrap justify-center gap-2 relative z-10">
          <p className="text-[#10b981] text-[10px] font-bold bg-green-900/40 px-3 py-1.5 rounded-full border border-green-500/30">Verified ✅</p>
          <button onClick={handleCopyLink} className="text-slate-300 text-[10px] font-bold bg-slate-800 px-3 py-1.5 rounded-full border border-slate-600 shadow-sm">{copied ? "Copied! ✔️" : "Copy Link 🔗"}</button>
        </div>

        <div className="mt-4 relative z-10">
          <a 
            href={`https://wa.me/${seller.phone.startsWith('0') ? '92' + seller.phone.slice(1) : seller.phone}`} 
            target="_blank" 
            className="inline-flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-4 py-2 rounded-xl border border-[#25D366]/20 font-black text-sm hover:bg-[#25D366]/20 transition"
          >
            <span className="text-lg">💬</span> {seller.phone}
          </a>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {products.map((item) => <ProductCard key={item.id} item={item} onOpenModal={openProductModal} />)}
        </div>
      </div>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-md mx-auto z-40">
          <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-[#10b981] text-white font-black p-4 rounded-2xl flex justify-between shadow-2xl items-center hover:scale-105 transition border-2 border-white/20">
            <span className="bg-white/20 px-3 py-1 rounded-xl text-sm">{cart.length} Items</span>
            <span className="flex items-center gap-2">Rs {cartTotalAmount} | Checkout ➔</span>
          </button>
        </div>
      )}

      {/* COMPACT PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col shadow-2xl">
            
            <div className="w-full h-60 sm:h-72 bg-slate-100 relative shrink-0">
               <button onClick={() => setSelectedProduct(null)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full font-bold z-20 text-slate-800 shadow-md hover:bg-white transition flex items-center justify-center">✕</button>
               
               <img src={selectedProduct.images?.[modalImgIndex]} className="w-full h-full object-contain p-2" />
               
               {selectedProduct.images?.length > 1 && (
                 <>
                   <button onClick={() => setModalImgIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 w-8 h-8 rounded-full font-bold text-slate-800 shadow-md flex items-center justify-center">❮</button>
                   <button onClick={() => setModalImgIndex((prev) => (prev + 1) % selectedProduct.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 w-8 h-8 rounded-full font-bold text-slate-800 shadow-md flex items-center justify-center">❯</button>
                 </>
               )}
            </div>

            {selectedProduct.images?.length > 1 && (
              <div className="flex gap-2 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0 justify-center">
                {selectedProduct.images.map((img: string, idx: number) => (
                  <div key={idx} onClick={() => setModalImgIndex(idx)} className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition ${idx === modalImgIndex ? 'border-[#f97316]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="p-5 overflow-y-auto flex-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-1 leading-tight">{selectedProduct.name}</h2>
              <p className="text-xl font-black text-[#f97316] mb-4">Rs {selectedProduct.price}</p>
              
              {selectedProduct.colors?.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Select Color</p>
                  <div className="flex flex-wrap gap-2">{selectedProduct.colors.map((c: any) => <button key={c} onClick={() => setSelectedColor(c)} className={`px-3 py-1.5 rounded-lg font-bold text-xs border-2 transition ${selectedColor === c ? 'border-[#f97316] text-[#f97316] bg-orange-50' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{c}</button>)}</div>
                </div>
              )}
              
              {selectedProduct.sizes?.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Select Size</p>
                  <div className="flex flex-wrap gap-2">{selectedProduct.sizes.map((s: any) => <button key={s} onClick={() => setSelectedSize(s)} className={`px-3 py-1.5 rounded-lg font-bold text-xs border-2 transition ${selectedSize === s ? 'border-[#f97316] text-[#f97316] bg-orange-50' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{s}</button>)}</div>
                </div>
              )}

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-600 ml-1">Quantity</p>
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-1 py-1 shadow-sm">
                  <button onClick={() => setSelectedQuantity(prev => prev > 1 ? prev - 1 : 1)} className="w-8 h-8 flex items-center justify-center font-black text-lg text-slate-500 hover:text-slate-800 focus:outline-none">−</button>
                  <span className="font-black text-sm text-slate-800 w-5 text-center">{selectedQuantity}</span>
                  <button onClick={() => setSelectedQuantity(prev => prev + 1)} className="w-8 h-8 flex items-center justify-center font-black text-lg text-[#f97316] hover:text-orange-700 focus:outline-none">+</button>
                </div>
              </div>

            </div>
            
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <button onClick={handleAction} className={`w-full font-black p-3.5 rounded-xl shadow-lg transition active:scale-95 ${modalAction === 'buy' ? 'bg-[#f97316] text-white hover:bg-[#ea580c]' : 'bg-[#0f172a] text-white hover:bg-slate-800'}`}>
                {modalAction === 'buy' ? `Buy Now (Rs ${selectedProduct.price * selectedQuantity})` : "Add to Cart 🛒"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 animate-in slide-in-from-bottom-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-2xl font-black text-slate-800">Checkout</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="bg-slate-100 w-8 h-8 rounded-full font-bold text-slate-500 hover:bg-slate-200">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
              <div className="mb-6 space-y-3 border-b border-slate-100 pb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Items</p>
                {cart.map(item => (
                  <div key={item.cartId} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex gap-3 items-center">
                       <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          {item.images?.[0] ? <img src={item.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                       </div>
                       <div>
                         <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">{item.name}</p>
                         <p className="text-xs font-bold text-slate-500 mt-0.5">
                           {item.quantity}x <span className="text-slate-400 font-medium">| {item.selectedColor} {item.selectedSize}</span>
                         </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                       <p className="font-black text-[#f97316] text-sm">Rs {item.price * item.quantity}</p>
                       <button onClick={() => removeFromCart(item.cartId)} className="w-8 h-8 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition">
                         <span className="text-sm">✕</span>
                       </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center bg-[#0f172a] text-white p-4 rounded-2xl shadow-md mt-2">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-xl font-black text-[#10b981]">Rs {cartTotalAmount}</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Delivery Address</p>
                <input type="text" placeholder="Full Name" onChange={(e) => setCustomerData({...customerData, name: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" />
                <input type="tel" placeholder="WhatsApp Number" onChange={(e) => setCustomerData({...customerData, phone: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" />
                <select onChange={(e) => setCustomerData({...customerData, city: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] bg-white font-medium text-slate-600">
                  <option value="">Select City (Pakistan)</option>
                  {pakistanCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <textarea placeholder="Complete House/Street Address" onChange={(e) => setCustomerData({...customerData, address: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 h-24 outline-none focus:border-[#10b981] font-medium resize-none" />
              </div>
            </div>

            <div className="pt-4 shrink-0 bg-white">
              <button onClick={handleOrderSubmit} className="w-full bg-[#25D366] text-white font-black text-lg p-4 rounded-xl shadow-lg flex justify-center items-center gap-2 hover:bg-[#128C7E] transition active:scale-95">
                Send Order on WhatsApp 💬
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}