// app/layout.tsx
import './globals.css'; // Import global styles
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] }); // Optional: Use Google Fonts

// Metadata for SEO
export const metadata: Metadata = {
  title: 'ReVive - Cloud Administration Tool',
  description: 'Manage your AWS EC2 instances and snapshots with ReVive.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 text-gray-900`}>
        {/* Header */}
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            {/* Logo linking to home */}
            <Link href="/" className="text-2xl font-bold">
              ReVive
            </Link>

            {/* Centered Search Bar */}
            <div className="flex-1 flex justify-center mx-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full max-w-md p-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Login Link */}
            <div>
              <Link href="/auth/login" className="text-white hover:underline">
                Login
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-6 min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>
              &copy; {new Date().getFullYear()} ReVive. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
