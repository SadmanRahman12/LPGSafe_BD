"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Shield,
  QrCode,
  Store,
  TrendingUp,
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  PhoneCall,
  LayoutDashboard,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dealers", label: "Find Dealers", icon: Store },
    { href: "/verify", label: "Verify Cylinder", icon: QrCode },
    { href: "/prices", label: "LPG Prices", icon: TrendingUp },
    { href: "/complaints", label: "Complaints", icon: PhoneCall },
    { href: "/safety", label: "Safety Guide", icon: BookOpen },
    { href: "/iot", label: "IoT Telemetry", icon: Cpu },
  ];

  const getDashboardLink = () => {
    if (!session?.user) return "/dashboard";
    const role = (session.user as any).role;
    if (role === "ADMIN") return "/admin";
    if (role === "INSPECTOR") return "/inspector/dashboard";
    if (role === "DEALER") return "/dealer/dashboard";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      {/* Top Bangladesh National Safety Banner */}
      <div className="bg-navy-950 text-white text-[11px] font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>National LPG Safety, Verification & Price Transparency Network • Bangladesh</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-red-400" />
              Emergency: <strong className="text-white">999</strong> | Fire: <strong className="text-white">16163</strong>
            </span>
            <span>BERC 12kg Declared: ৳1,455</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-navy-900 text-white shadow-md group-hover:bg-navy-800 transition-colors">
              <Shield className="w-6 h-6 text-emerald-400" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#f42a41] border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-navy-950">
                  LPGSafe<span className="text-emerald-600">BD</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Gov Ready
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none">
                Safety • Authentic QR • Fair Prices
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive
                      ? "bg-navy-50 text-navy-950"
                      : "text-slate-600 hover:text-navy-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-navy-900" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth / Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-navy-950 max-w-[110px] truncate">{session.user?.name}</p>
                    <span className="text-[10px] uppercase font-semibold text-emerald-600">
                      {(session.user as any).role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-dropdown">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-navy-950">{session.user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="font-semibold text-xs bg-emerald-600 hover:bg-emerald-700">
                    Register Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-navy-950" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive ? "bg-navy-50 text-navy-950 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {session ? (
              <>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="primary" size="md" className="w-full gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Open Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
