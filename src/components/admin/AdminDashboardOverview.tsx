"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Users,
  UserCheck,
  UserX,
  Trash2,
  Search,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";

interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
  provider: string | null;
  isVerified: boolean;
  image: string | null;
  phoneNumber: string | null;
  createdAt: string;
  deletedAt: string | null;
}

interface Metrics {
  totalUsers: number;
  activeUsers: number;
  deactivatedUsers: number;
  inTrashUsers: number;
}

export default function AdminDashboardOverview() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    activeUsers: 0,
    deactivatedUsers: 0,
    inTrashUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "10",
        status: statusFilter,
      });
      if (search.trim()) {
        params.append("search", search.trim());
      }
      const res = await axios.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.users || []);
      if (res.data.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err: any) {
      console.error("Failed to load admin users:", err);
      toast.error(err.response?.data?.message || "Failed to load admin user data");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleStatusChange = async (userId: string, action: "activate" | "deactivate" | "soft_delete") => {
    try {
      setActionLoadingId(userId);
      const res = await axios.patch(`/api/admin/users/${userId}/status`, { action });
      toast.success(res.data.message || `Account ${action}d successfully`);
      fetchUsers();
    } catch (err: any) {
      console.error(`Status change error (${action}):`, err);
      toast.error(err.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-card to-card/60 border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </span>
            <span className="text-xs text-muted-foreground">Platform Governance</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
            System Administration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts, review active registrations, and maintain account lifecycles with strict data privacy.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
          >
            <span>Manage All Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-foreground">{metrics.totalUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">Active + Deactivated</p>
          </div>
        </div>

        {/* Active Users */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-foreground">{metrics.activeUsers}</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-500 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Normal login access</span>
            </div>
          </div>
        </div>

        {/* Deactivated Users */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Deactivated Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-foreground">{metrics.deactivatedUsers}</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-500 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Login blocked</span>
            </div>
          </div>
        </div>

        {/* In Trash */}
        <Link
          href="/admin/trash"
          className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between hover:border-rose-500/40 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-rose-500 transition-colors">
              Trash & Recovery
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-foreground">{metrics.inTrashUsers}</p>
            <div className="flex items-center justify-between mt-1 text-xs text-rose-500 font-semibold">
              <span>30-day recovery window</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick User Summary Table Section */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Recent User Registrations</h2>
            <p className="text-xs text-muted-foreground">
              Real-time user accounts overview. User financial data is strictly private and hidden.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/70 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-secondary/70 rounded-xl border border-border text-xs">
              {(["ALL", "ACTIVE", "DEACTIVATED"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer",
                    statusFilter === tab
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "ALL" ? "All" : tab === "ACTIVE" ? "Active" : "Deactivated"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Auth Type</th>
                <th className="px-4 py-3">Joined Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading user records...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActionLoading = actionLoadingId === u.id;
                  const isAdmin = u.role === "ADMIN";

                  return (
                    <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {u.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.image} alt={u.name || "User"} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              u.name?.[0]?.toUpperCase() || "U"
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-foreground truncate">{u.name || "Unnamed User"}</p>
                              {isAdmin && (
                                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-full bg-primary/20 text-primary border border-primary/30">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-medium">
                        <span className="capitalize">{u.provider || "credentials"}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {u.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : u.status === "DEACTIVATED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            Deactivated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <Trash2 className="w-3 h-3" />
                            In Trash
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isAdmin ? (
                          <span className="text-[11px] text-muted-foreground italic">Protected</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {u.status === "ACTIVE" ? (
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => handleStatusChange(u.id, "deactivate")}
                                className="px-2.5 py-1 text-[11px] font-semibold text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Deactivate
                              </button>
                            ) : u.status === "DEACTIVATED" ? (
                              <>
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleStatusChange(u.id, "activate")}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Activate
                                </button>
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleStatusChange(u.id, "soft_delete")}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">In Trash</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* View All link */}
        <div className="pt-2 flex justify-end">
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Go to full User Management directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
