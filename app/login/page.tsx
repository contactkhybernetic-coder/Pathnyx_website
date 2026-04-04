"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [logoFile, setLogoFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();

  const easypaisaNumber = "03XX-XXXXXXX"; 
  const easypaisaName = "Hazrat Umar";
  const adminWhatsApp = "923XXXXXXXXX";
  const IMGBB_API_KEY = "YAHAN_APNI_IMGBB_KEY_PASTE_KAREIN";

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
        // ========== LOGIN ==========
        if (!mobile || !password) {
          alert("Details poori karein!");
          setLoading(false);
          return;
        }
        
        const q = query(collection(db, "sellers"), where("phone", "==", mobile));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          alert("Yeh number register nahi hai!");
        } else {
          const sellerDoc = querySnapshot.docs[0];
          const userData = sellerDoc.data();
          
          if (userData.password === password) {
            if (userData.status === "pending") {
              setShowPayment(true);
            } else {
              // 🚀 ASLI JADOO: ID Card Save Karna
              localStorage.setItem("sellerId", sellerDoc.id);
              localStorage.setItem("shopName", userData.shopName);
              router.push("/dashboard"); // Go to Dashboard
            }
          } else {
            alert("Password ghalat hai!");
          }
        }
      } else {
        // ========== SIGNUP ==========
        if (!storeName || !mobile || !password || password !== confirmPassword) {
          alert("Details theek nahi hain!");
          setLoading(false);
          return;
        }

        const q = query(collection(db, "sellers"), where("phone", "==", mobile));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          alert("Number pehle se majood hai!");
          setLoading(false);
          return;
        }

        let uploadedLogoUrl = "";
        if (logoFile) {
          const formData = new FormData();
          formData.append("image", logoFile);
          const imgResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
          const imgData = await imgResponse.json();
          uploadedLogoUrl = imgData.data.url;
        }

        await addDoc(collection(db, "sellers"), { 
          shopName: storeName, phone: mobile, password: password, shopLogo: uploadedLogoUrl, status: "pending", dateJoined: new Date().toISOString()
        });
        
        setShowPayment(true);
      }
    } catch (error) {
      alert("Koi masla aa gaya boss.");
    }
    setLoading(false);
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-[2rem] p-8 text-center shadow-xl">
          <div className="text-6xl mb-4">💸</div>
          <h2 className="text-2xl font-black mb-2">Activate Store</h2>
          <p className="text-slate-500 mb-4">1000 Rs Easypaisa karein.</p>
          <div className="bg-slate-50 p-4 rounded-xl text-left mb-4 border">
            <p className="font-bold">{easypaisaNumber}</p>
            <p className="text-sm">{easypaisaName}</p>
          </div>
          <button onClick={() => window.open(`https://wa.me/${adminWhatsApp}?text=Boss payment done for ${storeName}`, "_blank")} className="w-full bg-[#25D366] text-white font-bold p-4 rounded-xl shadow-lg hover:bg-[#128C7E] transition">Send Receipt</button>
        </div>
      </div>
    );
  }

  return (
    // 🚀 Yahan 'relative' add kiya hai taake button sahi jagah aaye
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative font-sans">
      
      {/* 🚀 YEH RAHA VIP BACK BUTTON 🚀 */}
      <div className="absolute top-6 left-6 md:top-8 md:left-12">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-slate-500 hover:text-[#0f172a] font-bold transition bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 active:scale-95">
          <span className="text-lg">←</span> Back to Home
        </button>
      </div>

      <div className="bg-white max-w-md w-full rounded-[2rem] shadow-xl p-8 z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-[#0f172a]">Smart Store</h1>
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button onClick={() => setIsLoginMode(true)} className={`flex-1 py-3 font-bold rounded-lg transition ${isLoginMode ? "bg-white shadow" : "text-slate-400 hover:text-slate-600"}`}>Login</button>
          <button onClick={() => setIsLoginMode(false)} className={`flex-1 py-3 font-bold rounded-lg transition ${!isLoginMode ? "bg-white shadow" : "text-slate-400 hover:text-slate-600"}`}>Sign Up</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && <input type="text" placeholder="Store Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-[#f97316] outline-none" />}
          {!isLoginMode && <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0])} className="w-full border-2 border-dashed border-slate-300 rounded-xl p-3 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-orange-50 file:text-orange-700 font-medium cursor-pointer" />}
          <input type="tel" placeholder="WhatsApp Number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-[#f97316] outline-none" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-[#f97316] outline-none" />
          {!isLoginMode && <input type="password" placeholder="Re-type Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-[#f97316] outline-none" />}
          
          <button type="submit" disabled={loading} className="w-full bg-[#f97316] text-white font-bold p-4 rounded-xl mt-4 shadow-lg hover:bg-[#ea580c] transition active:scale-95 disabled:bg-orange-300">
            {loading ? "Wait..." : isLoginMode ? "Login" : "Create Store"}
          </button>
        </form>
      </div>
    </div>
  );
}