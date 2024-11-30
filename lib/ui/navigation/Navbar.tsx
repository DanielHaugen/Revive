// /lib/ui/navigation/Navbar.tsx
'use client'; // Use client for interactivity

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  return (
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
        <Link href="/auth/login" className="text-white">
          Login
        </Link>
      </div>
    </header>
  );
}
