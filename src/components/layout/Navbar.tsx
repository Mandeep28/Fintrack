"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Menu, 
  X, 
  Target,
  Activity,
  PiggyBank,
  Settings,
  Users,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import FinTrackLogo from "@/components/ui/FinTrackLogo";

const userNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Financial Health", href: "/health", icon: ShieldCheck },
  { name: "Goals", href: "/goals", icon: PiggyBank },
  { name: "Categories & Budgets", href: "/categories", icon: Target },
  { name: "Activity", href: "/activity", icon: Activity },
];

const adminNavItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Trash & Recovery", href: "/admin/trash", icon: Trash2 },
];

const NavLinks = memo(function NavLinks({ 
  pathname, 
  role,
  onClick 
}: { 
  pathname: string; 
  role?: string | null;
  onClick?: () => void; 
}) {
  const items = role === "ADMIN" ? adminNavItems : userNavItems;

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
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
});

function ProfileCard({ 
  session, 
  onClick 
}: { 
  session: any; 
  onClick?: () => void; 
}) {
  const pathname = usePathname();
  const isSettings = pathname === "/settings";

  return (
    <Link
      href="/settings"
      prefetch={true}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group",
        isSettings
          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 font-semibold"
          : "bg-secondary/70 hover:bg-secondary text-foreground border-transparent hover:border-border"
      )}
      title="Open Account Settings"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={cn(
            "w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
            isSettings
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-primary/10 border border-primary/20 text-primary"
          )}
        >
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            session?.user?.name?.[0]?.toUpperCase() || "U"
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                "text-xs font-bold truncate",
                isSettings ? "text-primary-foreground" : "text-foreground"
              )}
            >
              {session?.user?.name}
            </p>
            {session?.user?.role === "ADMIN" && (
              <span
                className={cn(
                  "text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full shrink-0",
                  isSettings
                    ? "bg-primary-foreground/25 text-primary-foreground border border-primary-foreground/30"
                    : "bg-primary/20 text-primary border border-primary/30"
                )}
              >
                Admin
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-[10px] truncate font-medium",
              isSettings ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {session?.user?.email || "Account"}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "p-1.5 rounded-lg transition-transform duration-200 shrink-0 ml-1 group-hover:rotate-45",
          isSettings
            ? "text-primary-foreground"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        <Settings className="w-4 h-4" />
      </div>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session) return null;

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center">
          <FinTrackLogo variant="full" size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl hover:bg-secondary/60 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card/90 backdrop-blur-md border-r border-border flex-col p-4 z-30">
        <div className="mb-6 px-1 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center">
            <FinTrackLogo variant="full" size="md" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} role={session?.user?.role} onClick={() => setIsOpen(false)} />
        </div>

        <div className="mt-auto pt-4 border-t border-border/60">
          <ProfileCard session={session} />
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
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center">
                <FinTrackLogo variant="full" size="md" />
              </Link>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg hover:bg-secondary/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <NavLinks pathname={pathname} role={session?.user?.role} onClick={() => setIsOpen(false)} />
            </div>

            <div className="mt-auto pt-4 border-t border-border/60">
              <ProfileCard
                session={session}
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
