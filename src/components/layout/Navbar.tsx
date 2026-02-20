"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  LogOut, 
  Wallet,
  Menu,
  X,
  TrendingUp
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Rooms", href: "/rooms", icon: Users },
  { name: "New Room", href: "/rooms/new", icon: PlusCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session) return null;

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="flex-1 px-4 py-4 md:py-8 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">FinTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-nav-background border-r border-border flex-col p-8 z-30">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FinTrack</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex-1 space-y-2">
          <NavLinks onClick={() => setIsOpen(false)} />
        </div>

        <div className="mt-auto pt-8 border-t border-border">
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              {session?.user?.name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{session?.user?.name}</p>
              <button
                onClick={() => signOut()}
                className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-[280px] bg-background border-r border-border p-8 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">FinTrack</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <NavLinks onClick={() => setIsOpen(false)} />
            </div>

            <div className="mt-auto pt-8 border-t border-border">
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {session?.user?.name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{session?.user?.name}</p>
                  <button
                    onClick={() => signOut()}
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
