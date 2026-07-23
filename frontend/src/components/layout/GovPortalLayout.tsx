"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, X } from "lucide-react";
import { clearApiCache, apiFetch } from "@/lib/api";
import { useNotifications, disconnectNotificationSocket } from "@/lib/useNotifications";
import { useNotificationStore } from "@/store/notificationStore";
import { resolveNavItems } from "@/lib/navRegistry";
import "../../styles/gov-theme.css";

interface GovPortalLayoutProps {
  children: ReactNode;
  userRole?: string;
  activeNav?: string;
  showSidebar?: boolean;
}

export default function GovPortalLayout({ children, userRole, showSidebar = true }: GovPortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resolvedRole, setResolvedRole] = useState<string>(userRole || "");

  // Real-time Notification system hook
  useNotifications();

  // Notification Store state
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) setUserEmail(parsed.email);
        if (!userRole && parsed.role) {
          setResolvedRole(parsed.role);
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, [userRole]);

  const effectiveRole = userRole || resolvedRole;

  // Dynamically resolve navigation links based on user role and permissions
  const navItems = resolveNavItems({ role: effectiveRole, pathname });

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors on logout
    }
    clearApiCache();
    disconnectNotificationSocket();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="gov-layout">
      {/* Top Header Bar */}
      <header className="gov-header">
        <div className="gov-header-inner">
          <div className="gov-brand flex items-center gap-3">
            <button
              className="lg:hidden text-slate-600 hover:text-slate-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 font-heading font-extrabold text-lg text-slate-900 hover:no-underline">
              Maha<span className="text-blue-600">CSR</span> Setu
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Real-time Notifications Popup Menu */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-xl border border-slate-200/80 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markRead(notif.id)}
                          className={`p-3 rounded-xl text-xs transition-colors cursor-pointer border ${
                            notif.isRead
                              ? "bg-slate-50/50 border-slate-100 text-slate-600"
                              : "bg-blue-50/40 border-blue-100 text-slate-900 font-medium"
                          }`}
                        >
                          <div className="font-bold text-slate-900 mb-0.5">{notif.title}</div>
                          <div className="leading-relaxed text-slate-600">{notif.message}</div>
                          <div className="mt-1.5 text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <span className="hidden sm:inline-block text-xs font-medium text-slate-600">
                {userEmail || effectiveRole}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Shell */}
      <div className="gov-shell">
        {/* Sidebar Navigation */}
        {showSidebar && (
          <aside className={`gov-sidebar ${mobileMenuOpen ? "open" : ""}`}>
            <nav className="gov-nav space-y-6">
              <div className="gov-nav-group">
                <div className="gov-nav-title px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {effectiveRole ? effectiveRole.replace(/_/g, " ") : "Navigation"}
                </div>
                <div className="space-y-1">
                  {navItems.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`gov-nav-link flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </aside>
        )}

        {/* Page Content */}
        <main className="gov-main flex-grow min-w-0 px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
