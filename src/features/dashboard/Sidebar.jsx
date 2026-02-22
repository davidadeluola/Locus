import React from "react";
import { useUser } from "../../hooks/useUser";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  BookOpen,
  Settings,
  LogOut,
  ShieldCheck,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { profile, loading, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading)
    return (
      <div
        className={`bg-[#09090b] border-r border-zinc-800 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      />
    );

  // Define Navigation based on Role
  const menuItems =
    profile?.role === "lecturer"
      ? [
          {
            icon: <LayoutDashboard size={20} />,
            label: "Control Room",
            path: "",
          },
          {
            icon: <Users size={20} />,
            label: "Manage Students",
            path: "students",
          },
          {
            icon: <BookOpen size={20} />,
            label: "Course Modules",
            path: "courses",
          },
          {
            icon: <ShieldCheck size={20} />,
            label: "Attendance Audit",
            path: "audit",
          },
        ]
      : [
          {
            icon: <LayoutDashboard size={20} />,
            label: "My Terminal",
            path: "",
          },
          {
            icon: <UserCheck size={20} />,
            label: "Check-In",
            path: "attendance",
          },
          {
            icon: <BookOpen size={20} />,
            label: "Resources",
            path: "resources",
          },
        ];

  return (
    <aside
      className={`bg-[#09090b] border-r border-zinc-800 flex flex-col h-screen sticky top-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 transition-all shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* System Brand */}
      <div className={`p-8 ${isCollapsed ? "px-4" : "px-8"}`}>
        {!isCollapsed ? (
          <>
            <h1 className="text-white font-black tracking-tighter text-2xl">
              LOCUS<span className="text-orange-500">.</span>
            </h1>
            <p className="text-[9px] text-zinc-600 uppercase font-mono tracking-widest mt-1">
              Lagos State Univ. Science & Tech
            </p>
          </>
        ) : (
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-orange-500 font-black text-lg">L</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item, index) => {
          const fullPath = item.path === "" ? "/dashboard" : `/dashboard/${item.path}`;
          const isActive = location.pathname === fullPath || 
                          (item.path === "" && location.pathname === "/dashboard/");
          return (
            <button
              key={index}
              onClick={() => navigate(fullPath)}
              title={isCollapsed ? item.label : ""}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <span className={isActive ? "text-orange-500" : "group-hover:text-orange-500 transition-colors"}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-zinc-900 bg-black/20">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-xs text-white">
                {profile?.full_name?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-white font-bold truncate">
                  {profile?.full_name}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase font-mono">
                  {profile?.role}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all text-xs font-mono uppercase"
            >
              <LogOut size={16} /> Terminate Session
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-sm text-white"
              title={profile?.full_name}
            >
              {profile?.full_name?.charAt(0)}
            </div>
            <button
              onClick={logout}
              className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
