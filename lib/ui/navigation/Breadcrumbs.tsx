'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa6';

const labelMap: Record<string, string> = {
  instances: 'Instances',
  volumes: 'Volumes',
  snapshots: 'Snapshots',
  playbooks: 'Playbooks',
  restoration: 'Restoration',
  settings: 'Settings',
  profile: 'Profile',
  logs: 'Audit Logs',
  edit: 'Edit',
  new: 'New',
};

function formatSegment(segment: string): string {
  return labelMap[segment] ?? decodeURIComponent(segment);
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Don't render breadcrumbs on the home page
  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const isLast = idx === segments.length - 1;
    return { label: formatSegment(seg), href, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
      <Link href="/" className="hover:text-gray-300 transition-colors">
        Home
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <FaChevronRight className="text-[10px]" />
          {crumb.isLast ? (
            <span className="text-gray-300">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-gray-300 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
