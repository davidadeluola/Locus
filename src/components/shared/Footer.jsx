import React from "react";
import { MapPin, Github, Twitter, Linkedin, ArrowUp } from "lucide-react";
import GeoStatusVisual from "../../lib/data/footerGeo.jsx";



const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-white overflow-hidden">
      <div className="flex flex-col md:flex-row">
        
        {/* LEFT: Brand & Links */}
        <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 bg-zinc-950 border-r border-zinc-900">
          <div className="flex flex-col h-full justify-between space-y-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={32} className="text-orange-600" />
                <span className="text-2xl font-black tracking-tighter uppercase">Locus</span>
              </div>
              <p className="text-zinc-500 max-w-sm leading-relaxed">
                The next generation of campus accountability. Engineered for the first set of 
                Computer Engineering students at LASUSTECH.
              </p>
            </div>

            <nav className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest">Platform</h4>
                <ul className="space-y-2 text-sm font-medium text-zinc-400">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">Protocol</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#faqs" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest">Developer</h4>
                <ul className="space-y-2 text-sm font-medium text-zinc-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Status</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">System Logs</a></li>
                </ul>
              </div>
            </nav>

            <div className="flex items-center gap-6 pt-8 border-t border-zinc-900">
              <Github className="text-zinc-500 hover:text-orange-600 cursor-pointer" size={20} />
              <Twitter className="text-zinc-500 hover:text-orange-600 cursor-pointer" size={20} />
              <Linkedin className="text-zinc-500 hover:text-orange-600 cursor-pointer" size={20} />
              <button 
                onClick={scrollToTop}
                className="ml-auto p-3 border border-zinc-800 hover:border-orange-600 group transition-all"
              >
                <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Separate Map/Geospatial Logic */}
        <div className="w-full md:w-1/2 bg-zinc-900/50 relative flex flex-col items-center md:flex justify-center p-8 md:p-16 min-h-[400px]">
          <GeoStatusVisual />
          
          <div className="mt-8 text-center">
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.4em] mb-2">
              Server_Region: Lagos_NG
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-400 tracking-tighter">ALL_SYSTEMS_OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 px-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest bg-black">
        <p>© 2026 LOCUS_PROTOCOL. ALL RIGHTS RESERVED.</p>
        <p>BUILT_BY_CPE_PRM_SET</p>
      </div>
    </footer>
  );
};

export default Footer;