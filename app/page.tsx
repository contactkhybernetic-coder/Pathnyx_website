import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#f97316] selection:text-white overflow-x-hidden">
      
      {/* 🚀 NAVBAR 🚀 */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* 🚀 LOGO 🚀 */}
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition">
            <img src="/logo.png" className="h-20 md:h-20 object-contain" alt="Pathnyx Logo" />
          </Link>

          <div className="flex gap-4 items-center">
            <Link href="/login" className="bg-[#10b981] text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-md hover:bg-[#059669] transition active:scale-95">
              Login Your Store
            </Link>
          </div>
        </div>
      </nav>

      {/* 🚀 HERO SECTION 🚀 */}
      <section className="relative overflow-hidden bg-[#0f172a] text-white pt-20 pb-32">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Side: Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block bg-white/10 px-4 py-2 rounded-full text-xs font-black text-[#10b981] uppercase tracking-widest mb-6 border border-white/20">
              Pakistan's #1 E-commerce Builder
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              Launch Your Store in <span className="text-[#f97316]">60 Seconds.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Baghair kisi coding ya hosting ke apni online dukan banayein. WhatsApp orders, inventory management, aur bohut kuch—sirf ek click ki doori par.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/login" className="bg-[#f97316] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] hover:bg-[#ea580c] hover:scale-105 transition-all">
                Start Selling Now 🚀
              </Link>
            </div>
          </div>

          {/* Right Side: MAIN BANNER IMAGE */}
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#10b981] to-[#f97316] blur-3xl opacity-20 rounded-full animate-pulse"></div>
            
            <div className="relative bg-white/5 border border-white/10 rounded-[2.5rem] p-4 shadow-2xl backdrop-blur-sm transform rotate-1 hover:rotate-0 transition-transform duration-500 overflow-hidden">
              <img 
                src="/banner.png" 
                alt="Pathnyx Store Preview" 
                className="w-full h-auto rounded-[2rem] shadow-lg object-cover"
              />
              
              {/* Floating Badge */}
              <div className="absolute -left-6 top-12 bg-white text-slate-800 px-6 py-4 rounded-2xl shadow-xl font-black border border-slate-100 animate-bounce text-xs sm:text-sm">
                🎉 Rs 0 Setup Fee!
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🚀 FEATURES SECTION 🚀 */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Everything You Need to Succeed</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Pathnyx gives you the superpower to run your business straight from your mobile or laptop.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all group">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">📱</div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Direct WhatsApp Orders</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">No complex checkout forms. Customers send their orders directly to your WhatsApp with full bill details.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all group">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">⚡</div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Lightning Fast Store</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">Your store loads in milliseconds. We provide free VIP hosting so you never lose a single customer.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all group">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🛠️</div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Smart Dashboard</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">Add products, upload multiple images, and manage your inventory easily from our user-friendly boss panel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 FOOTER 🚀 */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 text-center relative z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <img src="/logo.png" className="h-20 object-contain mx-auto mb-6 brightness-0 invert" alt="Pathnyx Logo" />
          <p className="text-sm font-medium mb-8 max-w-md mx-auto leading-relaxed">Empowering local businesses in Pakistan to go global. Built with ❤️ for sellers.</p>
          
          {/* 🚀 BOSS ADMIN BUTTON (Sirf End Mein) 🚀 */}
          <div className="mb-8">
            <Link href="/boss" className="inline-block text-slate-500 hover:text-white transition font-bold text-xs uppercase tracking-widest border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800">
              Admin Panel 👑
            </Link>
          </div>

          <p className="text-xs">© {new Date().getFullYear()} Pathnyx E-commerce. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}