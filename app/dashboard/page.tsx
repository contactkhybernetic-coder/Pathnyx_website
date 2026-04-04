import Link from "next/link";

export default function ProfessionalLandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#f97316] selection:text-white overflow-x-hidden">
      
      {/* ================= VIP HEADER / NAVBAR ================= */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center fixed top-0 w-full z-50 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0f172a] to-slate-800 text-white rounded-xl flex items-center justify-center text-xl shadow-lg border border-slate-700">
            ⚡
          </div>
          <span className="text-2xl font-black text-[#0f172a] tracking-tight">Pathnyx<span className="text-[#f97316]">.</span></span>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-[#f97316] transition hidden md:block">
            Seller Login
          </Link>
          <Link href="/login" className="bg-[#0f172a] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md transition active:scale-95 flex items-center gap-2">
            Start Free Trial <span>🚀</span>
          </Link>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <main className="pt-36 pb-20 px-6 md:px-12 max-w-7xl mx-auto text-center relative">
        {/* Background Glowing Effect */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-orange-400/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="inline-block bg-white text-slate-700 font-bold px-5 py-2 rounded-full text-sm mb-8 border border-slate-200 shadow-sm animate-fade-in-up">
          🌟 Pakistan's #1 Platform for Local Businesses
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[#0f172a] mb-6 leading-tight tracking-tighter">
          Launch Your Store <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] to-pink-600">
            In 60 Seconds.
          </span>
        </h1>
        
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
          Ditch the heavy coding. Get a professional store link, receive direct orders on WhatsApp, and manage your inventory easily from your phone.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/login" className="w-full sm:w-auto bg-[#f97316] text-white text-lg px-8 py-4 rounded-2xl font-bold hover:bg-[#ea580c] shadow-xl shadow-orange-200 transition flex items-center justify-center gap-3 active:scale-95">
            Create My Store Now <span>➔</span>
          </Link>
          <a href="#features" className="w-full sm:w-auto bg-white text-slate-700 text-lg px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 border border-slate-200 shadow-sm transition flex items-center justify-center gap-2">
            See How it Works
          </a>
        </div>
      </main>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-4">Everything You Need to Succeed</h2>
            <p className="text-slate-500 font-medium text-lg">Powerful features designed specifically for Pakistani sellers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#f8fafc] p-8 rounded-[2rem] border border-slate-100 hover:border-[#f97316] transition duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">🔗</div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">Custom Shop Link</h3>
              <p className="text-slate-500 font-medium">pathnyx.com/your-brand. Share it on Instagram, Facebook, or TikTok instantly.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-[#f8fafc] p-8 rounded-[2rem] border border-slate-100 hover:border-[#10b981] transition duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">💬</div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">WhatsApp Orders</h3>
              <p className="text-slate-500 font-medium">No 0% commission. Customers send beautifully formatted orders direct to your WhatsApp.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-[#f8fafc] p-8 rounded-[2rem] border border-slate-100 hover:border-blue-500 transition duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">⚡</div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">Super Fast Dashboard</h3>
              <p className="text-slate-500 font-medium">Add products, upload pictures, and manage prices with zero technical knowledge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#0f172a] text-slate-300 py-12 px-6 md:px-12 border-t-4 border-[#f97316]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">Pathnyx<span className="text-[#f97316]">.</span></span>
          </div>
          <p className="font-medium text-sm text-slate-400">© 2026 Pathnyx Technologies (UK) LTD. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/boss" className="text-xs text-slate-500 hover:text-white transition tracking-widest font-bold uppercase border border-slate-700 px-3 py-1 rounded-lg">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}