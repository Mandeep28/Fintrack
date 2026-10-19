"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Menu, 
  X, 
  TrendingUp,
  Target,
  Activity,
  PiggyBank,
  KeyRound,
  LogOut,
  MoreVertical
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import ChangePasswordModal from "@/components/user/ChangePasswordModal";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Goals", href: "/goals", icon: PiggyBank },
  { name: "Categories & Budgets", href: "/categories", icon: Target },
  { name: "Activity", href: "/activity", icon: Activity },
  // { name: "My Rooms", href: "/rooms", icon: Users },
  // { name: "New Room", href: "/rooms/new", icon: PlusCircle },
];

function NavLinks({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  return (
    <div className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group font-medium text-sm",
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

function ProfileCard({ 
  session, 
  onOpenPasswordModal 
}: { 
  session: any; 
  onOpenPasswordModal: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div ref={menuRef} className="relative">
      {/* Dropdown Menu (Opens upwards above card) */}
      {isMenuOpen && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl p-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-2 border-b border-border/50 mb-1">
            <p className="text-xs font-bold truncate text-foreground">{session?.user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{session?.user?.email || "Personal Account"}</p>
          </div>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              onOpenPasswordModal();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Change Password</span>
          </button>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Profile Card Container */}
      <div className="flex items-center justify-between p-2.5 bg-secondary/70 hover:bg-secondary rounded-xl border border-transparent hover:border-border transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{session?.user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate font-medium">
              {session?.user?.email || "Personal Account"}
            </p>
          </div>
        </div>

        {/* Three Dots Trigger Button */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={cn(
            "p-1.5 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-lg transition-all cursor-pointer shrink-0 ml-1",
            isMenuOpen && "bg-background text-foreground shadow-sm"
          )}
          title="Account options"
          aria-label="Account options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!session) return null;

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
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col p-4 z-30">
        <div className="mb-6 px-1 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">FinTrack</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} onClick={() => setIsOpen(false)} />
        </div>

        <div className="mt-auto pt-4 border-t border-border">
          <ProfileCard
            session={session}
            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
          />
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground tracking-tight">FinTrack</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <NavLinks pathname={pathname} onClick={() => setIsOpen(false)} />
            </div>

            <div className="mt-auto pt-4 border-t border-border">
              <ProfileCard
                session={session}
                onOpenPasswordModal={() => {
                  setIsOpen(false);
                  setIsPasswordModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}

