"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart,
  LayoutDashboard,
  Compass,
  Users,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/circles", label: "My Circles", icon: Users },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      
      <nav className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Impact Circle</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav-link flex items-center gap-3 ${
                    isActive ? "nav-link-active" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={handleSignOut}
              className="nav-link flex items-center gap-3 text-danger-600 w-full"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        )}
      </nav>

      
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-gray-200">
        
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Impact Circle</span>
          </Link>
        </div>

        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link flex items-center gap-3 ${
                  isActive ? "nav-link-active" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">
                {profile?.fullName?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.fullName || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="nav-link flex items-center gap-3 text-danger-600 w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}