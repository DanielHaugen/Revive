'use client';

import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Override the default max-w-md container width */
  maxWidth?: string;
};

/**
 * Base modal component — handles backdrop, container styling, and Escape key.
 * Compose by placing content as children.
 */
export default function Modal({ isOpen, onClose, children, maxWidth = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop z-50"
      onClick={onClose}
    >
      {/* Stop propagation so clicks inside the dialog don't close it */}
      <div
        className={twMerge('modal-container', maxWidth)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
