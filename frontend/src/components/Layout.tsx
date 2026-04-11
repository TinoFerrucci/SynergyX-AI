import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Users, FolderKanban, Home, Sun, Moon } from "lucide-react";
import { fetchProfiles, type UserProfile } from "@/lib/api";
import { useTheme } from "@/lib/theme";

const NAV = [
  { to: "/", label: "Overview", icon: Home },
  { to: "/talent", label: "Talent Pool", icon: Users },
  { to: "/projects", label: "Team Builder", icon: FolderKanban },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const location = useLocation();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    fetchProfiles().then(setProfiles).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex bg-bg">
      <aside
        className={`flex flex-col border-r border-border bg-surface transition-all duration-200 ${
          collapsed ? "w-[60px]" : "w-[240px]"
        }`}
      >
        <div className={`flex items-center h-14 px-4 border-b border-border ${collapsed ? "justify-center" : "gap-2.5"}`}>
          <img
            src={collapsed ? "/logo.png" : "/imagotipo.png"}
            alt="SynergyX"
            className={`flex-shrink-0 ${collapsed ? "h-7 w-7 object-contain" : "h-8 object-contain"}`}
          />
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                title={label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 h-9 text-sm font-medium transition-colors duration-100 ${
                  collapsed ? "justify-center" : ""
                } ${active ? "bg-accent-subtle text-accent-text" : "text-text-secondary hover:text-text hover:bg-bg-subtle"}`}
              >
                <Icon size={16} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {!collapsed && profiles.length > 0 && (
          <div className="mx-3 mb-3 p-3 rounded-lg bg-bg-subtle border border-border">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Talent Pool</p>
            <p className="text-lg font-semibold text-text">{profiles.length}</p>
            <p className="text-[11px] text-text-tertiary">profiles ready</p>
          </div>
        )}

        <div className="p-2 border-t border-border flex items-center gap-1">
          <button
            onClick={toggle}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="w-8 h-8 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-secondary hover:bg-bg-subtle transition-colors cursor-pointer"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-secondary hover:bg-bg-subtle transition-colors cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M3 3.5h9M3 7.5h9M3 11.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-[1080px] mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
