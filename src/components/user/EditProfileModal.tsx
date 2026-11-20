"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Modal from "@/components/ui/Modal";
import { Loader2, User, Phone, FileText, Camera, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

// Quick stylish avatar presets
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
];

export default function EditProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { data: session, update: updateSession } = useSession();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Fetch current user details when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setFetching(true);
    setError("");

    fetch("/api/user/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const u = data.user;
        setName(u.name || session?.user?.name || "");
        setImage(u.image || session?.user?.image || "");
        setPhoneNumber(u.phoneNumber || "");
        setBio(u.bio || "");
      })
      .catch((err) => {
        console.error(err);
        setName(session?.user?.name || "");
        setImage(session?.user?.image || "");
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          image: image.trim() || null,
          phoneNumber: phoneNumber.trim() || null,
          bio: bio.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Update client session
      await updateSession({
        name: data.user.name,
        image: data.user.image,
      });

      toast.success("Profile updated successfully!");
      if (onProfileUpdated) onProfileUpdated();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      {fetching ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs">Loading profile data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold px-4 py-2.5 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Profile Photo & Avatar Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-secondary/40 border border-border/60">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-md">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-black text-primary">
                    {name?.[0]?.toUpperCase() || session?.user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="flex items-center justify-center sm:justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Profile Avatar
                </span>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="text-[11px] text-destructive hover:underline cursor-pointer"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {/* Avatar Presets */}
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {AVATAR_PRESETS.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(presetUrl)}
                    className={`relative w-8 h-8 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      image === presetUrl
                        ? "border-primary scale-105 shadow-md shadow-primary/30"
                        : "border-border/60 hover:border-primary/50 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={presetUrl} alt="preset" className="w-full h-full object-cover" />
                    {image === presetUrl && (
                      <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-foreground inline-flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Camera className="w-3 h-3 text-muted-foreground" />
                  <span>Custom URL</span>
                </button>
              </div>

              {showUrlInput && (
                <input
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-background border border-border text-foreground rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 ml-1">
              <User className="w-3.5 h-3.5" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-secondary/50 border border-border text-foreground rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm placeholder:text-muted-foreground"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 ml-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="w-full bg-secondary/50 border border-border text-foreground rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm placeholder:text-muted-foreground"
            />
          </div>

          {/* Bio / Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Bio / Description</span>
              </label>
              <span className="text-[10px] text-muted-foreground font-mono">
                {bio.length}/300
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell something about yourself, your role, or financial goals..."
              className="w-full bg-secondary/50 border border-border text-foreground rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-border hover:bg-secondary text-sm font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
