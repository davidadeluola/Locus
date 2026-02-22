import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useUser } from "../../hooks/useUser";
import { Bell, Search, Menu } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const { profile } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 17) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    };
    
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div
          className={`absolute left-0 top-0 h-full transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar isCollapsed={false} toggleSidebar={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-900 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-zinc-900 rounded-xl transition-all"
              >
                <Menu size={20} className="text-zinc-400" />
              </button>
              
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tighter">
                  {greeting}, {profile?.full_name?.split(" ")[0] || "User"}
                </h2>
                <p className="text-zinc-500 text-xs font-mono uppercase mt-1">
                  {profile?.role === "lecturer" ? "Academic Oversight Module" : "Student Operations Hub"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button className="p-2 hover:bg-zinc-900 rounded-xl transition-all relative">
                <Bell size={20} className="text-zinc-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>
              <button className="hidden md:block p-2 hover:bg-zinc-900 rounded-xl transition-all">
                <Search size={20} className="text-zinc-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
