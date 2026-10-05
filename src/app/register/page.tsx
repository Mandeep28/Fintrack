"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl text-center">
        <div className="p-3.5 bg-primary/10 rounded-2xl mb-4 inline-flex text-primary">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Registration Disabled</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Public signups are currently closed. Please sign in with your credentials.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
