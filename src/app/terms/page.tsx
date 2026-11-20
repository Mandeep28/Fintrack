import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import FinTrackLogo from "@/components/ui/FinTrackLogo";

export const metadata = {
  title: "Terms of Service - FinTrack",
  description: "Terms and conditions for using the FinTrack financial management platform.",
};

export default function TermsPage() {
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
            <Scale className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: November 19, 2026 • Last Updated: November 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, registering for, or using FinTrack (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions stated herein, you must immediately discontinue use of the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Description of the Service</h2>
            <p>
              FinTrack provides digital personal financial tracking tools, budget allocation software, savings and debt trackers, and analytics visualization. FinTrack is an informational management software and is <strong>not</strong> an authorized bank, financial broker, or licensed investment advisor.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. User Accounts & Security</h2>
            <p>
              When creating an account, you agree to provide truthful, accurate, and complete information. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that take place under your account.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 pt-1">
              <li>You must immediately notify FinTrack of any unauthorized access or breach of security.</li>
              <li>You may not impersonate any person or entity or misrepresent affiliation with any person.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Account Lifecycle & 30-Day Deletion Policy</h2>
            <p>
              You retain the right to deactivate or delete your account at any time through Account Settings. In accordance with FinTrack policy, deleted accounts enter a <strong>30-day recovery window</strong> during which you may request restoration. After 30 calendar days, account data is permanently and irreversibly purged from our active systems.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Prohibited Conduct</h2>
            <p>You agree not to engage in any of the following activities:</p>
            <ul className="list-disc pl-5 space-y-1.5 pt-1">
              <li>Attempting to bypass authentication mechanisms, permissions, or system security guards.</li>
              <li>Scraping, crawling, or automated data harvesting without prior authorization.</li>
              <li>Transmitting malicious files, viruses, or unauthorized automated scripts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">6. Limitation of Liability</h2>
            <p>
              FinTrack is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind. Under no circumstances shall FinTrack or its contributors be held liable for any indirect, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">7. Modifications to Terms</h2>
            <p>
              We reserve the right to revise these Terms of Service at any time. Material updates will be indicated by revising the Effective Date above. Continued usage of FinTrack constitutes binding acceptance of the updated terms.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FinTrack. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
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
