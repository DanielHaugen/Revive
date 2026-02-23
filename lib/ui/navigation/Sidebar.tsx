'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FaBook,
  FaGear,
  FaHouse,
  FaImage,
  FaMicrochip,
  FaPowerOff,
  FaRegClock,
  FaRegClone,
  FaRegHardDrive,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa6';
import { IconType } from 'react-icons';

type Route = {
  section: string;
  links: {
    href: string;
    label: string;
    icon?: IconType;
  }[];
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const routes: Route[] = [
    {
      section: 'General',
      links: [
        { href: '/', label: 'Home', icon: FaHouse },
        { href: '/logs', label: 'Audit Logs', icon: FaRegClock },
      ],
    },
    {
      section: 'Virtual Machines',
      links: [
        { href: '/instances', label: 'Instances', icon: FaMicrochip },
        { href: '/volumes', label: 'Volumes', icon: FaRegHardDrive },
        { href: '/snapshots', label: 'Snapshots', icon: FaImage },
        { href: '/restoration', label: 'Restoration', icon: FaRegClone },
      ],
    },
    {
      section: 'Orchestration',
      links: [{ href: '/playbooks', label: 'Playbooks', icon: FaBook }],
    },
    {
      section: 'Settings',
      links: [
        { href: '/settings', label: 'Settings', icon: FaGear },
        { href: '/settings/profile', label: 'User Profile', icon: FaUser },
        { href: '/auth/logout', label: 'Logout', icon: FaPowerOff },
      ],
    },
  ];

  return (
    <div className="relative flex h-screen">
      {/* Sidebar Container */}
      <div
        className={`flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 text-white border-r border-gray-800 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          {routes.map((section, index) => (
            <div key={index} className="mb-8">
              {!isCollapsed && (
                <h6 className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  {section.section}
                </h6>
              )}
              <ul className="space-y-1">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                      title={isCollapsed ? link.label : ''}
                    >
                      {link.icon && <link.icon className="text-base flex-shrink-0" />}
                      {!isCollapsed && <span>{link.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 z-10"
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? (
          <FaChevronRight className="text-sm" />
        ) : (
          <FaChevronLeft className="text-sm" />
        )}
      </button>
    </div>
  );
}
