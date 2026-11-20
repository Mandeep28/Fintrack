"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Trash2,
  RotateCcw,
  RefreshCw,
  Clock,
  AlertTriangle,
  Flame,
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

export default function AdminTrashPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Permanent Delete Modal
  const [permanentDeleteModal, setPermanentDeleteModal] = useState<{
    isOpen: boolean;
    user: UserItem | null;
  }>({
    isOpen: false,
    user: null,
  });

  const fetchTrashUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/users?status=DELETED&limit=50");
      setUsers(res.data.users || []);
    } catch (err: any) {
      console.error("Failed to load trash users:", err);
      toast.error(err.response?.data?.message || "Failed to load trash items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrashUsers();
  }, [fetchTrashUsers]);

  const handleRestore = async (userId: string) => {
    try {
      setActionLoadingId(userId);
      const res = await axios.patch(`/api/admin/users/${userId}/status`, { action: "restore" });
      toast.success(res.data.message || "Account restored to Active status");
      fetchTrashUsers();
    } catch (err: any) {
      console.error("Restore error:", err);
      toast.error(err.response?.data?.message || "Failed to restore account");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleHardDelete = async (userId: string) => {
    try {
      setActionLoadingId(userId);
      const res = await axios.patch(`/api/admin/users/${userId}/status`, { action: "hard_delete" });
      toast.success(res.data.message || "Account permanently deleted");
      setPermanentDeleteModal({ isOpen: false, user: null });
      fetchTrashUsers();
    } catch (err: any) {
      console.error("Hard delete error:", err);
      toast.error(err.response?.data?.message || "Failed to permanently delete account");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePurgeExpired = async () => {
    try {
      setPurging(true);
      const res = await axios.post("/api/admin/trash/purge");
      toast.success(res.data.message || `Purged ${res.data.purgedCount} expired accounts`);
      fetchTrashUsers();
    } catch (err: any) {
      console.error("Purge error:", err);
      toast.error(err.response?.data?.message || "Failed to purge expired accounts");
    } finally {
      setPurging(false);
    }
  };

  const getRemainingDays = (deletedAt: string | null) => {
    if (!deletedAt) return 0;
    const deletedTime = new Date(deletedAt).getTime();
    const expiryTime = deletedTime + 30 * 24 * 60 * 60 * 1000;
    const diffMs = expiryTime - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  if (session && session.user?.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          You must be an administrator to access Trash & Account Recovery.
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
        backHref="/admin/users"
        backLabel="Back to User Management"
        items={[
          { label: "User Management", href: "/admin/users" },
          { label: "Trash & Recovery" },
        ]}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <span>Trash & Account Recovery</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
              {users.length} {users.length === 1 ? "Account" : "Accounts"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Accounts soft-deleted from the directory. Users can be recovered within 30 days before permanent deletion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handlePurgeExpired()}
            disabled={purging || users.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Flame className={cn("w-3.5 h-3.5", purging && "animate-spin")} />
            <span>Purge Expired</span>
          </button>
          <button
            onClick={() => fetchTrashUsers()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 30-Day Policy Alert Box */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-3">
        <Clock className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-foreground">30-Day Automated Hard Delete Policy</p>
          <p className="text-muted-foreground mt-0.5">
            Soft-deleted accounts remain in the Trash for exactly 30 calendar days. While in the Trash, users cannot log in.
            If restored, the user immediately regains full access. After 30 days, accounts and credentials are permanently purged from the database.
          </p>
        </div>
      </div>

      {/* Trash Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60">
              <tr>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Deleted On</th>
                <th className="px-4 py-3.5">Recovery Countdown</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading trash accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-foreground">Trash is empty</p>
                      <p className="text-[11px] text-muted-foreground max-w-xs">
                        There are no soft-deleted accounts pending recovery or hard deletion.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActionLoading = actionLoadingId === u.id;
                  const remainingDays = getRemainingDays(u.deletedAt);

                  return (
                    <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                      {/* User Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0 border border-rose-500/20">
                            {u.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.image} alt={u.name || "User"} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              u.name?.[0]?.toUpperCase() || "U"
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate line-through opacity-70">
                              {u.name || "Unnamed User"}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Deleted On */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">
                        {u.deletedAt ? formatDate(u.deletedAt) : "Unknown"}
                      </td>

                      {/* Remaining Days */}
                      <td className="px-4 py-3.5">
                        {remainingDays <= 3 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <Clock className="w-3 h-3 animate-pulse" />
                            {remainingDays === 0 ? "Expiring today" : `${remainingDays}d left (Soon)`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            {remainingDays} days left to recover
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleRestore(u.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => setPermanentDeleteModal({ isOpen: true, user: u })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Permanently</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permanent Delete Modal */}
      {permanentDeleteModal.isOpen && permanentDeleteModal.user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-rose-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Permanently Delete Account?</h3>
                <p className="text-xs text-muted-foreground">{permanentDeleteModal.user.email}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-rose-500 font-semibold">Warning:</strong> This action cannot be undone. 
              The account and associated login credentials will be immediately wiped from the database.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPermanentDeleteModal({ isOpen: false, user: null })}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoadingId === permanentDeleteModal.user.id}
                onClick={() => handleHardDelete(permanentDeleteModal.user!.id)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
