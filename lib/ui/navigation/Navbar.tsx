'use client';

import { FaArrowsRotate } from 'react-icons/fa6';

export default function Navbar() {
  return (
    <header className="bg-gray-900 text-white p-4 shadow-lg border-b border-gray-800">
      <div className="flex items-center justify-between gap-4">
        {/* Spacer for sidebar */}
        <div className="w-0"></div>

        {/* Page Title and Search */}
        <div className="flex items-center justify-between flex-1 gap-6">
          <h1 className="text-2xl font-semibold">Revive</h1>

          {/* Search Bar */}
          <div className="flex-1 flex justify-center max-w-md">
            <input
              type="text"
              placeholder="Search resources..."
              className="form-input"
            />
          </div>
        </div>

        {/* Refresh Button */}
        <button className="p-2 hover:bg-gray-800 rounded-lg transition">
          <FaArrowsRotate className="text-xl" />
        </button>
      </div>
    </header>
  );
}
