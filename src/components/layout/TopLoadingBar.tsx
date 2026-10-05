"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LoadingBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUrlRef = useRef<string>("");

  const startProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setVisible(true);
    setProgress(25);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 90;
        }
        // Random incremental steps
        const step = Math.random() * 15 + 5;
        return Math.min(prev + step, 90);
      });
    }, 150);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 250);
  };

  // Complete progress whenever the pathname or searchParams change
  useEffect(() => {
    const fullUrl = `${pathname}?${searchParams.toString()}`;
    if (currentUrlRef.current && currentUrlRef.current !== fullUrl) {
      completeProgress();
    }
    currentUrlRef.current = fullUrl;
  }, [pathname, searchParams]);

  // Intercept click on internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // Check if it's the exact same pathname
      const currentPath = window.location.pathname;
      const targetPath = href.split("?")[0];
      if (currentPath !== targetPath) {
        startProgress();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}

export default function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <LoadingBarInner />
    </Suspense>
  );
}
