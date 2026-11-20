"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import axios from "axios";
import {
  User,
  KeyRound,
  Palette,
  AlertTriangle,
  LogOut,
  Camera,
  UploadCloud,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Laptop,
  Trash2,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/Breadcrumb";

type SettingsTab = "profile" | "password" | "appearance" | "danger" | "logout";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Form State
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileProvider, setProfileProvider] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Delete Account State
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch latest profile details
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setProfileLoading(true);
        const res = await axios.get("/api/user/profile");
        if (res.data?.user && isMounted) {
          const u = res.data.user;
          setProfileName(u.name || "");
          setProfileImage(u.image || "");
          setProfilePhone(u.phoneNumber || "");
          setProfileBio(u.bio || "");
          setProfileProvider(u.provider || "credentials");
        }
      } catch (err) {
        console.error("Failed to load profile details:", err);
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle direct file upload for avatar (Max 3 MB, PNG/JPG/JPEG)
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (3 MB)
    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size exceeds 3 MB limit. Please choose a smaller image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate format
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error("Invalid file format. Only PNG, JPG, and JPEG images are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.post("/api/user/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.url) {
        setProfileImage(res.data.url);
        toast.success(res.data.message || "Profile picture updated successfully");
        await updateSession();
      }
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Update Profile Submit
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error("Please provide your full name");
      return;
    }

    try {
      setProfileSaving(true);
      const res = await axios.patch("/api/user/profile", {
        name: profileName.trim(),
        image: profileImage ? profileImage.trim() : null,
        phoneNumber: profilePhone ? profilePhone.trim() : null,
        bio: profileBio ? profileBio.trim() : null,
      });

      if (res.data?.success) {
        toast.success("Profile updated successfully");
        await updateSession();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password Submit
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await axios.post("/api/user/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success(res.data?.message || "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Delete Account Submit (30-day soft delete)
  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput.trim().toLowerCase() !== "delete my account") {
      toast.error("Please type 'delete my account' to confirm");
      return;
    }

    try {
      setDeletingAccount(true);
      const res = await axios.delete("/api/user/account", {
        data: { confirmationText: deleteConfirmationInput.trim() },
      });

      toast.success(res.data?.message || "Account scheduled for deletion");
      queryClient.clear();
      await signOut({ callbackUrl: "/login" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete account");
      setDeletingAccount(false);
    }
  };

  // Sign out helper
  const handleSignOut = () => {
    queryClient.clear();
    signOut({ callbackUrl: "/login" });
  };

  const isGoogleUser = profileProvider === "google";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Account Preferences
          </span>
          {isAdmin && (
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              Admin
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your personal profile, security credentials, appearance, and account lifecycle.
        </p>
      </div>

      {/* Main SaaS Settings Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Vertical Nav Tabs */}
        <aside className="lg:col-span-1 bg-card border border-border rounded-2xl p-2 shadow-sm sticky top-20">
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-1 lg:pb-0">
            {/* Edit Profile */}
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer text-left w-full",
                activeTab === "profile"
                  ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Edit Profile</span>
            </button>

            {/* Change Password */}
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer text-left w-full",
                activeTab === "password"
                  ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>Password & Security</span>
            </button>

            {/* Appearance */}
            <button
              type="button"
              onClick={() => setActiveTab("appearance")}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer text-left w-full",
                activeTab === "appearance"
                  ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span>Appearance</span>
            </button>

            <div className="hidden lg:block h-px bg-border my-1.5" />

            {/* Delete Account (Danger Zone) */}
            <button
              type="button"
              onClick={() => setActiveTab("danger")}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer text-left w-full",
                activeTab === "danger"
                  ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-500/20"
                  : "text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
              )}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Delete Account</span>
            </button>

            {/* Logout Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("logout")}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer text-left w-full",
                activeTab === "logout"
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Right Column: Tab Content */}
        <section className="lg:col-span-3">
          {/* TAB 1: EDIT PROFILE */}
          {activeTab === "profile" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Profile Information</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your public name, photo, phone number, and brief bio.
                </p>
              </div>

              {profileLoading ? (
                <div className="py-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Loading profile...</span>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Upload Area (Upload-Only, Max 3MB, PNG/JPG/JPEG) */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-3">
                      Profile Picture
                    </label>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                      onChange={handleAvatarFileSelect}
                      className="hidden"
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl bg-secondary/40 border border-border/80">
                      {/* Avatar preview with click-to-upload overlay */}
                      <div
                        onClick={() => !avatarUploading && fileInputRef.current?.click()}
                        className="relative w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 overflow-hidden flex items-center justify-center text-primary font-bold text-2xl shrink-0 cursor-pointer group shadow-sm transition-all hover:border-primary"
                        title="Click to upload profile photo"
                      >
                        {profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profileImage}
                            alt={profileName || "User"}
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                          />
                        ) : (
                          profileName?.[0]?.toUpperCase() || "U"
                        )}

                        {/* Hover / Loading Overlay */}
                        <div className={cn(
                          "absolute inset-0 bg-background/70 backdrop-blur-xs flex flex-col items-center justify-center transition-opacity",
                          avatarUploading
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        )}>
                          {avatarUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          ) : (
                            <>
                              <Camera className="w-5 h-5 text-primary" />
                              <span className="text-[9px] font-bold text-foreground mt-0.5">Upload</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Upload Controls & Guidelines */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            disabled={avatarUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {avatarUploading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UploadCloud className="w-3.5 h-3.5" />
                            )}
                            <span>{avatarUploading ? "Uploading..." : "Upload New Photo"}</span>
                          </button>

                          {profileImage && (
                            <button
                              type="button"
                              disabled={avatarUploading}
                              onClick={() => setProfileImage("")}
                              className="px-3 py-2 text-xs font-semibold rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Remove Photo
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Max file size: <strong className="text-foreground font-semibold">3 MB</strong>. Supported formats: <strong className="text-foreground font-semibold">PNG, JPG, JPEG</strong>. Files are stored securely.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name & Email Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full px-3 py-2 text-xs bg-secondary/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={session?.user?.email || ""}
                          readOnly
                          disabled
                          className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border/50 rounded-xl text-muted-foreground cursor-not-allowed"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground">
                          {profileProvider}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs bg-secondary/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-foreground">
                        About / Bio (Optional)
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        {profileBio.length}/300
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={profileBio}
                      maxLength={300}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="Write a brief bio..."
                      className="w-full px-3 py-2 text-xs bg-secondary/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="flex items-center gap-2 px-4 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === "password" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Password & Security</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Keep your account safe by updating your password regularly.
                </p>
              </div>

              {isGoogleUser ? (
                <div className="p-5 rounded-xl bg-secondary/50 border border-border flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-foreground">Google OAuth Account</p>
                    <p className="text-muted-foreground mt-0.5">
                      You are authenticated via Google. Password management and two-factor authentication are handled directly through your Google Account settings.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSavePassword} className="space-y-4 max-w-lg">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2 pr-10 text-xs bg-secondary/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                        className="w-full px-3 py-2 pr-10 text-xs bg-secondary/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        required
                        minLength={6}
                        className="w-full px-3 py-2 pr-10 text-xs bg-secondary/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="flex items-center gap-2 px-4 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {passwordSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Theme & Appearance</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customize how FinTrack looks on your current device.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Light Theme */}
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-3 relative group",
                    mounted && theme === "light"
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border hover:border-border/80 bg-secondary/40 hover:bg-secondary/70"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Light Mode</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Clean porcelain theme with deep teal accents.
                    </p>
                  </div>
                  {mounted && theme === "light" && (
                    <div className="absolute top-3 right-3 text-primary">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </button>

                {/* Dark Theme */}
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-3 relative group",
                    mounted && theme === "dark"
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border hover:border-border/80 bg-secondary/40 hover:bg-secondary/70"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Dark Mode</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      High-contrast obsidian theme with electric cyan.
                    </p>
                  </div>
                  {mounted && theme === "dark" && (
                    <div className="absolute top-3 right-3 text-primary">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </button>

                {/* System Theme */}
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-3 relative group",
                    mounted && theme === "system"
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border hover:border-border/80 bg-secondary/40 hover:bg-secondary/70"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">System Sync</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Matches your operating system settings.
                    </p>
                  </div>
                  {mounted && theme === "system" && (
                    <div className="absolute top-3 right-3 text-primary">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DANGER ZONE (DELETE ACCOUNT) */}
          {activeTab === "danger" && (
            <div className="bg-card border border-rose-500/30 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Delete Account</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Deactivate your account and initiate the 30-day recovery window.
                  </p>
                </div>
              </div>

              {isAdmin ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                  <p className="font-bold text-foreground">Admin Accounts Protected</p>
                  <p className="text-muted-foreground mt-0.5">
                    Admin accounts cannot be deleted from the user settings panel. Administrative governance requires at least one active admin account.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Explanatory Policy Card */}
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-2 text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-rose-500">
                      What happens when you delete your account:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>You will be signed out immediately and unable to log in normally.</li>
                      <li>
                        Your account will enter a <strong>30-day recovery period</strong> in the system Trash.
                      </li>
                      <li>
                        During these 30 days, you can contact an administrator to restore your account.
                      </li>
                      <li>
                        After 30 days, all account credentials and financial records are <strong>permanently purged</strong>.
                      </li>
                    </ul>
                  </div>

                  {/* GitHub Style Confirmation */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-foreground">
                      To confirm deletion, please type{" "}
                      <span className="font-mono text-rose-500 font-bold px-1 py-0.5 rounded bg-rose-500/10">
                        delete my account
                      </span>{" "}
                      below:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmationInput}
                      onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                      placeholder="delete my account"
                      className="w-full max-w-md px-3 py-2 text-xs bg-secondary/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-mono"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={
                        deleteConfirmationInput.trim().toLowerCase() !== "delete my account" ||
                        deletingAccount
                      }
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 px-4 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deletingAccount ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Permanently Delete My Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SIGN OUT */}
          {activeTab === "logout" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Sign Out</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Securely end your current session across FinTrack.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileImage}
                        alt={session?.user?.name || "User"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      session?.user?.name?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{session?.user?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out Now</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
