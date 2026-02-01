'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Don't show footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Twenti Studio. All rights reserved.
        </div>

        <div className="flex gap-8">
          <Link href="/privacy" className="text-gray-600 hover:text-[#042C71] transition-colors text-sm font-medium">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-gray-600 hover:text-[#042C71] transition-colors text-sm font-medium">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
