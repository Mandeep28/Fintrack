import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import FinTrackLogo from "@/components/ui/FinTrackLogo";

export const metadata = {
  title: "Privacy Policy - FinTrack",
  description: "Learn how FinTrack protects, stores, and handles your personal and financial information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <FinTrackLogo variant="full" size="sm" />
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Registration</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Title Block */}
        <div className="space-y-3 border-b border-border pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: November 19, 2026 • Last Updated: November 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Our Commitment to Your Privacy</h2>
            <p>
              At FinTrack, your financial privacy is our utmost priority. We believe your spending habits, debt repayments, and savings goals belong strictly to you. <strong>We do not sell, rent, monetize, or trade your personal or financial data to third parties or advertising networks.</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Account Information:</strong> Name, email address, password hash (encrypted using bcrypt), optional phone number, bio, and profile avatar.
              </li>
              <li>
                <strong>Financial Tracking Records:</strong> Expense entries, transaction amounts, custom budget categories, goal targets, and payment history logged voluntarily by you.
              </li>
              <li>
                <strong>Third-Party OAuth Data:</strong> When signing in with Google OAuth, we receive your verified email, display name, and public profile image as permitted by your Google permissions.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Strict Data Isolation & Zero Admin Visibility</h2>
            <p>
              FinTrack enforces cryptographic and application-level isolation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 pt-1">
              <li>System administrators can view user account metadata (status, verification, joined date) for governance and support.</li>
              <li><strong>Zero Financial Access:</strong> Under no circumstance do system administrators or support staff have access to view your personal expenses, budgets, savings goals, or debt balances.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Data Storage & Security Standards</h2>
            <p>
              All user records are secured using industry-standard transport layer encryption (TLS 1.3/HTTPS). Sensitive credentials and passwords are irreversibly salted and hashed with bcrypt. Uploaded profile images are validated strictly for format, size, and integrity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Your Data Rights & Deletion</h2>
            <p>You maintain complete ownership of your personal information:</p>
            <ul className="list-disc pl-5 space-y-1.5 pt-1">
              <li><strong>Update:</strong> You can edit your name, phone number, bio, and profile picture anytime in Settings.</li>
              <li><strong>Delete:</strong> You can soft-delete your account at any time. Accounts in Trash are granted a 30-day recovery window, after which all database entries are permanently wiped.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">6. Contacting Support</h2>
            <p>
              If you have inquiries regarding this Privacy Policy or wish to request data verification, please contact us at <span className="text-foreground font-semibold">support@fintrack.app</span>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FinTrack. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-primary transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
