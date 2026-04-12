// app/layout.tsx
import './globals.css'; // Import global styles
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/lib/ui/navigation/Sidebar';
import Navbar from '@/lib/ui/navigation/Navbar';
import Breadcrumbs from '@/lib/ui/navigation/Breadcrumbs';
import SyncBanner from '@/lib/ui/feedback/SyncBanner';
import Providers from './providers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] }); // Optional: Use Google Fonts

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Revive - Cloud Administration Tool',
  description: 'Manage your AWS EC2 instances and snapshots with Revive.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-100 h-screen overflow-hidden`}>
        <Providers>
        <div className="flex h-screen flex-col">
          {/* Header */}
          <Navbar />
          <SyncBanner />

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-950">
              <div className="p-6">
                <Breadcrumbs />
                {children}
              </div>
            </main>

            <ToastContainer position="bottom-right" theme="dark" />
          </div>
        </div>
        </Providers>
      </body>
    </html>
  );
}
