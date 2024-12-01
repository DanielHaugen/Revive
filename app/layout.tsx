// app/layout.tsx
import './globals.css'; // Import global styles
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/lib/ui/navigation/Sidebar';
import Navbar from '@/lib/ui/navigation/Navbar';
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
      <body className={`${inter.className} bg-gray-100 text-gray-900`}>
        {/* Header */}
        <Navbar />

        <div className="flex flex-grow h-full">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="container mx-auto p-6 flex flex-col flex-grow">
            {children}
          </main>

          <ToastContainer position="bottom-right" />
        </div>
      </body>
    </html>
  );
}
