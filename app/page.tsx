import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* ================= HEADER / NAVBAR ================= */}
      <nav className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center fixed top-0 w-full z-50 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Logo Placeholder */}
          <div className="w-10 h-10 bg-[#0f172a] text-white rounded-xl flex items-center justify-center text-xl shadow-md border border-[#f97316]">
            ⚡
          </div>
          <span className="text-2xl font-black text-[#0f172a] tracking-tight">Pathnyx</span>
        </div>
        
        {/* Auth Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/login" className="text-slate-600 font-bold hover:text-[#0f172a] px-4 py-2 hidden md:block transition">
            Login
          </Link>
          <Link href="/login" className="bg-[#f97316] text-white px-5 py-2 md:px-6 md:py-2.5 rounded-xl font-bold hover:bg-[#ea580c] shadow-lg shadow-orange-200 transition active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ================= HERO BANNER SECTION ================= */}
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto text-center">
        
        <div className="inline-block bg-orange-100 text-orange-700 font-bold px-4 py-1.5 rounded-full text-sm mb-6 border border-orange-200 shadow-sm">
          🚀 Pakistan's #1 Smart Mini Store SaaS
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-[#0f172a] mb-6 leading-tight tracking-tight">
          Sell Online With <br className="hidden md:block"/> Your Own <span className="text-[#f97316]">Brand Link</span>
        </h1>
        
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
          Join Pathnyx today. Get your professional store link, receive orders directly on WhatsApp, and manage your business from anywhere.
        </p>
        
        <div className="flex justify-center">
          <Link href="/login" className="bg-[#10b981] text-white text-lg px-8 py-4 rounded-2xl font-bold hover:bg-[#059669] shadow-xl shadow-green-200 transition flex items-center gap-3 active:scale-95">
            Create Your Store Now <span>➔</span>
          </Link>
        </div>

        {/* Professional Banner Image Placeholder */}
        <div className="mt-16 w-full max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl border border-slate-100 h-64 md:h-[400px] flex items-center justify-center overflow-hidden relative group cursor-pointer">
           <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-50 opacity-80 group-hover:opacity-100 transition duration-500"></div>
           <div className="text-center z-10 transition transform group-hover:scale-105 duration-300">
             <div className="text-6xl mb-4">🖼️</div>
             <h3 className="text-2xl font-bold text-slate-400">Professional Banner Here</h3>
             <p className="text-slate-400 font-medium mt-2">Aap yahan apni marketing ki achi si picture lagayenge boss</p>
           </div>
        </div>

      </main>

      {/* ================= FOOTER & SECRET ADMIN LINK ================= */}
      <footer className="bg-[#0f172a] text-slate-400 py-10 text-center mt-12 border-t-4 border-[#f97316]">
        <p className="font-bold mb-4">© 2026 Pathnyx Smart Mini Store. All rights reserved.</p>
        
        {/* Khufiya Admin Link (Neechay chota sa) */}
        <Link href="/boss" className="text-xs text-slate-600 hover:text-slate-300 transition uppercase tracking-widest font-bold">
          Admin Login
        </Link>
      </footer>

    </div>
  );
}