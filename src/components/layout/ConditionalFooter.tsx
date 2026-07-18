"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // যদি ইউজার ড্যাশবোর্ডের ভেতরে থাকে (যেমন: /dashboard, /dashboard/chat), 
  // তবে ফুটারটি রেন্ডার হবে না।
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  // অন্য সব পেজে ফুটার দেখাবে
  return <Footer />;
}