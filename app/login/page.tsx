"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

export default function LoginSignup() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- 🚀 VIP TOAST STATE 🚀 ---
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  // --- LOGIN STATES ---
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // --- SIGNUP STATES ---
  const [shopName, setShopName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // --- MODALS ---
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false); 

  // --- FORGOT PASSWORD STATES ---
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoverySellerId, setRecoverySellerId] = useState("");

  const IMGBB_API_KEY = "bddbc795eeba935596e6be94391ffaef";
  const ADMIN_WHATSAPP = "923177964455"; 

  // --- 🚀 TOAST HELPER FUNCTION 🚀 ---
  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500); 
  };

  // ==========================================
  // 1. SIGNUP LOGIC
  // ==========================================
  const handleSignup = async (e: any) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      return showToast("Dono Passwords aapas mein match nahi kar rahe!", "error");
    }

    setLoading(true);
    try {
      const desiredName = shopName.trim();

      const allSellersSnap = await getDocs(collection(db, "sellers"));
      let nameAlreadyTaken = false;
      
      allSellersSnap.forEach((document) => {
        const existingName = document.data().shopName || "";
        if (existingName.toLowerCase() === desiredName.toLowerCase()) {
          nameAlreadyTaken = true;
        }
      });

      if (nameAlreadyTaken) {
        showToast(`"${desiredName}" naam pehle hi kisi ne le liya hai. Plz koi aur naam sochein.`, "error");
        setLoading(false);
        return;
      }

      const phoneQuery = query(collection(db, "sellers"), where("phone", "==", signupPhone.trim()));
      const phoneSnapshot = await getDocs(phoneQuery);
      if (!phoneSnapshot.empty) {
        showToast("Yeh Phone Number pehle se system mein hai! Login karein.", "info");
        setLoading(false);
        return;
      }

      const emailQuery = query(collection(db, "sellers"), where("email", "==", signupEmail.toLowerCase().trim()));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        showToast("Yeh Email pehle se registered hai!", "info");
        setLoading(false);
        return;
      }

      let logoUrl = "";
      if (logoFile) {
        const formData = new FormData();
        formData.append("image", logoFile);
        const imgResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
        const imgData = await imgResponse.json();
        if (imgData.success) logoUrl = imgData.data.url;
      }

      const finalShopName = desiredName.toUpperCase();

      await addDoc(collection(db, "sellers"), {
        shopName: finalShopName, 
        email: signupEmail.toLowerCase().trim(),
        phone: signupPhone.trim(),
        password: signupPassword,
        shopLogo: logoUrl,
        isActive: false, 
        status: "pending", 
        joinedAt: new Date().toISOString() 
      });

      showToast("Store Successfully Created! ✅", "success");
      setIsApprovalModalOpen(true); 
    } catch (error) {
      showToast("Store banate waqt error aaya, internet check karein.", "error");
    }
    setLoading(false);
  };

  // ==========================================
  // 2. LOGIN LOGIC
  // ==========================================
  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (!loginPhone || !loginPassword) return showToast("Phone aur Password lazmi hain!", "error");
    setLoading(true);

    try {
      const q = query(
        collection(db, "sellers"), 
        where("phone", "==", loginPhone.trim())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        let isApproved = false;
        let finalDoc: any = null;
        let passwordMatched = false;

        querySnapshot.forEach((document) => {
          const data = document.data();
          if (data.password === loginPassword) {
            passwordMatched = true;
            if (data.isActive === true || String(data.isActive) === "true" || data.status === "approved") {
              isApproved = true;
              finalDoc = { id: document.id, ...data };
            }
          }
        });

        if (!passwordMatched) {
          showToast("❌ Ghalat Password! Dobara try karein.", "error");
        } 
        else if (isApproved && finalDoc) {
          showToast("Login Successful! Redirecting... ✅", "success");
          localStorage.setItem("sellerId", finalDoc.id);
          localStorage.setItem("shopName", finalDoc.shopName);
          router.push("/dashboard");
        } 
        else {
          setIsApprovalModalOpen(true);
        }
      } else {
        showToast("❌ Yeh Phone Number system mein register nahi hai!", "error");
      }
    } catch (error) {
      showToast("System Error!", "error");
    }
    setLoading(false);
  };

  // ==========================================
  // 3. FORGOT PASSWORD
  // ==========================================
  const handleVerifyIdentity = async () => {
    if (!recoveryPhone || !recoveryEmail) return showToast("Email aur Phone dono lazmi hain!", "error");
    setLoading(true);
    try {
      const q = query(
        collection(db, "sellers"), 
        where("phone", "==", recoveryPhone.trim()),
        where("email", "==", recoveryEmail.toLowerCase().trim())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setRecoverySellerId(querySnapshot.docs[0].id);
        setRecoveryStep(2); 
      } else {
        showToast("Record nahi mila! Email aur Phone match nahi kar rahay.", "error");
      }
    } catch (error) {
      showToast("Network Error!", "error");
    }
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) return showToast("Password kam az kam 6 characters ka ho!", "error");
    setLoading(true);
    try {
      await updateDoc(doc(db, "sellers", recoverySellerId), { password: newPassword });
      showToast("✅ Password update ho gaya! Ab login karein.", "success");
      setIsForgotModalOpen(false); 
      setRecoveryStep(1);
      setNewPassword("");
    } catch (error) {
      showToast("Update failed!", "error");
    }
    setLoading(false);
  };

  const sendWhatsAppMessage = () => {
    const text = `Asalam-o-Alaikum Boss! Maine Pathnyx par dukaan banayi hai. Please mera account approve kardein. Mera number hai: ${loginPhone || signupPhone}`;
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // ==========================================
  // DESIGN & UI (HTML)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-[#f97316] selection:text-white relative overflow-hidden">
      
      {/* 🚀 CUSTOM TOAST NOTIFICATION UI 🚀 */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 w-[90%] max-w-sm">
          <div className={`px-6 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-3 border ${
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

      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 relative">
        
        <div className="flex text-center font-black text-lg bg-slate-100 cursor-pointer">
          <div onClick={() => setIsLogin(true)} className={`flex-1 py-5 transition ${isLogin ? 'bg-white text-[#f97316] shadow-sm z-10 rounded-br-2xl' : 'text-slate-400'}`}>Login</div>
          <div onClick={() => setIsLogin(false)} className={`flex-1 py-5 transition ${!isLogin ? 'bg-white text-[#10b981] shadow-sm z-10 rounded-bl-2xl' : 'text-slate-400'}`}>Create Store</div>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#0f172a]">Pathnyx.</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">Smart E-commerce Workspace</p>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                <input type="tel" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#f97316] font-medium" placeholder="03xxxxxxxxx" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#f97316] font-medium" placeholder="••••••••" required />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-[#f97316] text-xs font-bold hover:underline">Forgot Password?</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#0f172a] text-white font-black p-4 rounded-xl shadow-lg disabled:bg-slate-400 hover:bg-slate-800 transition active:scale-95">{loading ? "Wait..." : "Access Workspace ➔"}</button>
            </form>

          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <input type="text" placeholder="Store Name" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" required />
              <input type="email" placeholder="Email Address" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" required />
              <input type="tel" placeholder="Mobile Number" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" required />
              <input type="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" required minLength={6}/>
              <input type="password" placeholder="Retype Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-[#10b981] font-medium" required minLength={6}/>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">Store Logo</label>
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)} className="w-full text-xs font-bold text-slate-500" />
              </div>
              
              <button type="submit" disabled={loading} className="w-full bg-[#10b981] text-white font-black p-4 rounded-xl shadow-lg disabled:bg-slate-400 hover:bg-[#059669] transition active:scale-95">{loading ? "Wait..." : "Create Store 🚀"}</button>
            </form>
          )}
        </div>
      </div>

      {/* APPROVAL / LOCKED MODAL WITH WHATSAPP */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center border-4 border-orange-500 animate-in zoom-in-95 relative">
            <div className="text-6xl mb-4">🛑</div>
            <h2 className="text-2xl font-black text-[#0f172a] mb-2">Account Not Approved</h2>
            <p className="text-sm font-bold text-slate-500 mb-6">
              Aapki dukaan system mein hai, lekin abhi Admin ne approve nahi ki. Niche diye gaye button par click karke WhatsApp par rabta karein.
            </p>
            
            <button onClick={sendWhatsAppMessage} className="w-full bg-[#25D366] text-white font-black text-lg p-4 rounded-xl shadow-lg hover:bg-[#128C7E] transition active:scale-95 flex items-center justify-center gap-2 mb-4">
              Message Admin 💬
            </button>

            <button 
               onClick={() => {
                 setIsApprovalModalOpen(false);
                 window.location.href = "/";
               }} 
               className="text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition"
            >
              Close & Go to Home
            </button>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setIsForgotModalOpen(false)} className="absolute top-4 right-4 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-500 hover:bg-slate-200 transition">✕</button>
            <h2 className="text-2xl font-black mb-6 text-[#0f172a]">Reset Password 🔐</h2>
            
            {recoveryStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Registered Email</label>
                  <input type="email" placeholder="seller@email.com" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-[#f97316] font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Registered Mobile Number</label>
                  <input type="tel" placeholder="03xxxxxxxxx" value={recoveryPhone} onChange={(e) => setRecoveryPhone(e.target.value)} className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-[#f97316] font-medium" />
                </div>
                <button onClick={handleVerifyIdentity} disabled={loading} className="w-full bg-[#f97316] text-white font-black p-4 rounded-xl hover:bg-[#ea580c] transition active:scale-95 mt-2">
                  {loading ? "Checking..." : "Verify Identity"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 text-green-700 font-bold p-3 rounded-xl text-sm text-center mb-4">Account Verified ✅</div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">New Password</label>
                  <input type="text" placeholder="Kam az kam 6 lafz" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-[#10b981] font-medium" />
                </div>
                <button onClick={handleUpdatePassword} disabled={loading} className="w-full bg-[#10b981] text-white font-black p-4 rounded-xl hover:bg-[#059669] transition active:scale-95 mt-2">
                  {loading ? "Saving..." : "Save New Password"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}