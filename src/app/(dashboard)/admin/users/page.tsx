"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Trash2,
  Search,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/Breadcrumb";

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

export default function AdminUsersPage() {
  const { data: session } = useSession();
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: UserItem | null;
    action: "deactivate" | "soft_delete" | null;
  }>({
    isOpen: false,
    user: null,
    action: null,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        status: statusFilter,
      });
      if (search.trim()) {
        params.append("search", search.trim());
      }
      const res = await axios.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
      if (res.data.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err: any) {
      console.error("Failed to load admin users:", err);
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const executeAction = async (userId: string, action: "activate" | "deactivate" | "soft_delete") => {
    try {
      setActionLoadingId(userId);
      const res = await axios.patch(`/api/admin/users/${userId}/status`, { action });
      toast.success(res.data.message || `Account updated successfully`);
      setConfirmModal({ isOpen: false, user: null, action: null });
      fetchUsers();
    } catch (err: any) {
      console.error(`Action error (${action}):`, err);
      toast.error(err.response?.data?.message || `Failed to update user`);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (session && session.user?.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          You must be an administrator to access the User Management directory.
        </p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Overview", href: "/dashboard" },
          { label: "User Management" },
        ]}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Management</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            User Management Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Activate, deactivate, and manage user account lifecycles. Zero user financial data is accessible.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/trash"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash ({metrics.inTrashUsers})</span>
          </Link>
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total</span>
          <p className="text-2xl font-black text-foreground mt-1">{metrics.totalUsers}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Active</span>
          <p className="text-2xl font-black text-foreground mt-1">{metrics.activeUsers}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Deactivated</span>
          <p className="text-2xl font-black text-foreground mt-1">{metrics.deactivatedUsers}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">In Trash</span>
          <p className="text-2xl font-black text-foreground mt-1">{metrics.inTrashUsers}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card border border-border rounded-2xl">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email address..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-secondary/70 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-secondary/70 rounded-xl border border-border text-xs self-start sm:self-auto">
          {(["ALL", "ACTIVE", "DEACTIVATED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                statusFilter === tab
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "ALL" ? "All Users" : tab === "ACTIVE" ? "Active" : "Deactivated"}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60">
              <tr>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Auth Type</th>
                <th className="px-4 py-3.5">Verification</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    No users matching the current filter.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActionLoading = actionLoadingId === u.id;
                  const isAdmin = u.role === "ADMIN";
                  const isSelf = session?.user?.email === u.email;

                  return (
                    <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                      {/* User Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
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
                                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
                                  Admin
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[9px] uppercase tracking-wider font-semibold px-1 py-0.2 rounded-md bg-secondary text-muted-foreground shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">
                        <span className="capitalize">{u.provider || "credentials"}</span>
                      </td>

                      {/* Verification */}
                      <td className="px-4 py-3.5 text-xs">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px]">
                            Unverified
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {u.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : u.status === "DEACTIVATED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            Deactivated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <Trash2 className="w-3 h-3" />
                            In Trash
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        {isAdmin ? (
                          <span className="text-[11px] text-muted-foreground italic">Protected</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {u.status === "ACTIVE" ? (
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => setConfirmModal({ isOpen: true, user: u, action: "deactivate" })}
                                className="px-2.5 py-1 text-xs font-semibold text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Deactivate
                              </button>
                            ) : u.status === "DEACTIVATED" ? (
                              <>
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => executeAction(u.id, "activate")}
                                  className="px-2.5 py-1 text-xs font-semibold text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Activate
                                </button>
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => setConfirmModal({ isOpen: true, user: u, action: "soft_delete" })}
                                  className="px-2.5 py-1 text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </>
                            ) : null}
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

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/20 border-t border-border/60 text-xs text-muted-foreground">
          <span>
            Showing {users.length} of {totalCount} users
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  confirmModal.action === "soft_delete"
                    ? "bg-rose-500/10 text-rose-500"
                    : "bg-amber-500/10 text-amber-500"
                )}
              >
                {confirmModal.action === "soft_delete" ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {confirmModal.action === "soft_delete"
                    ? "Move Account to Trash?"
                    : "Deactivate User Account?"}
                </h3>
                <p className="text-xs text-muted-foreground">{confirmModal.user.email}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {confirmModal.action === "soft_delete"
                ? "This account will be moved to the Trash with a 30-day recovery window. If not restored within 30 days, it will be permanently deleted."
                : "Deactivating this account will immediately revoke access and prevent the user from logging in until reactivated by an admin."}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, user: null, action: null })}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoadingId === confirmModal.user.id}
                onClick={() =>
                  confirmModal.action &&
                  confirmModal.user &&
                  executeAction(confirmModal.user.id, confirmModal.action)
                }
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all cursor-pointer disabled:opacity-50",
                  confirmModal.action === "soft_delete"
                    ? "bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20"
                    : "bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20"
                )}
              >
                {confirmModal.action === "soft_delete" ? "Move to Trash" : "Deactivate Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
