import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { useUser } from "../../hooks/useUser";
import { Bell, Search, Menu } from "lucide-react";
import useRealtimeNotifications from "../../hooks/useRealtimeNotifications";

const DashboardLayout = ({ children }) => {
  const { user, profile, activeSession } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const { notifications, unreadCount, hasUnread, markAllRead } = useRealtimeNotifications({
    userId: user?.id,
    role: profile?.role,
    activeSessionId: activeSession?.id,
  });

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

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!notifRef.current?.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleNotifications = () => {
    setIsNotifOpen((prev) => !prev);
    markAllRead();
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
            <div className="flex items-center gap-2 md:gap-4" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className="p-2 hover:bg-zinc-900 rounded-xl transition-all relative"
                aria-label="Open notifications"
              >
                <Bell size={20} className="text-zinc-400" />
                {hasUnread ? (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-orange-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>
              {isNotifOpen ? (
                <div className="absolute right-4 md:right-8 top-16 w-80 max-h-96 overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50">
                  <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                    <p className="text-sm font-semibold">Notifications</p>
                    <span className="text-[10px] uppercase font-mono text-zinc-500">Real-time</span>
                  </div>

                  {notifications.length ? (
                    <ul className="divide-y divide-zinc-900">
                      {notifications.map((item) => (
                        <li key={item.id} className="px-4 py-3 hover:bg-zinc-900/60 transition-colors">
                          <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                          <p className="text-xs text-zinc-400 mt-1">{item.message}</p>
                          <p className="text-[10px] text-zinc-500 mt-2 font-mono uppercase">
                            {new Date(item.createdAt || Date.now()).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-8 text-center text-zinc-500 text-sm">No notifications yet.</div>
                  )}
                </div>
              ) : null}
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
