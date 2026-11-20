import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 relative overflow-x-hidden">
      {/* Two-color subtle ambient glow in dark mode */}
      <div
        aria-hidden="true"
        className="hidden dark:block pointer-events-none fixed -top-40 -left-40 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="hidden dark:block pointer-events-none fixed top-1/3 -right-40 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"
      />

      <Navbar />
      <main className="pt-16 lg:pt-0 lg:pl-64 transition-all min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
