'use client';

import { useEffect, useRef } from 'react';
import { FaXmark } from 'react-icons/fa6';

type SlideOverProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Width class, defaults to "w-[480px]" */
  width?: string;
};

export default function SlideOver({
  isOpen,
  onClose,
  title,
  children,
  width = 'w-[480px]',
}: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full ${width} bg-gray-900 border-l border-gray-700 z-50 shadow-2xl flex flex-col animate-slide-in-right`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          {title && (
            <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1 rounded-md hover:bg-gray-800"
            aria-label="Close panel"
          >
            <FaXmark className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </>
  );
}
