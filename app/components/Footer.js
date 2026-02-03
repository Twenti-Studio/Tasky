'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Don't show footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image 
                src="/icon.png" 
                alt="MiTa" 
                width={32} 
                height={32}
                className="rounded-lg"
              />
              <span className="text-white text-lg font-bold">MiTa</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Platform mikro task terpercaya di Indonesia. Dapatkan penghasilan tambahan dengan menyelesaikan tugas-tugas sederhana.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Keunggulan
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  Cara Kerja
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="hover:text-white transition-colors">
                  Testimoni
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Twenti Studio. Hak cipta dilindungi.</p>
          
        </div>
      </div>
    </footer>
  );
}
