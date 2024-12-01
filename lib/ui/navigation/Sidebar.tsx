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
        { href: '/logs', label: 'Activity Logs', icon: FaRegClock },
      ],
    },
    {
      section: 'Virtual Machines',
      links: [
        { href: '/instances', label: 'EC2 Instances', icon: FaMicrochip },
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
    // Add more sections and links as needed
  ];

  return (
    <div className="relative flex">
      {/* Floating Chip */}
      <div
        className="absolute -right-[27px] top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-4 rounded-r-lg cursor-pointer shadow-md z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '>' : '<'}
      </div>

      {/* Sidebar Container */}
      <div
        className={`flex flex-col bg-gray-800 text-white duration-300 pt-3 ${
          isCollapsed ? 'w-0 opacity-0' : 'w-72'
        }`}
      >
        {routes.map((section, index) => (
          <div
            key={index}
            className={`duration-300 ${isCollapsed ? 'hidden' : ''}`}
          >
            <h6 className="px-4 py-2 text-xs font-bold text-gray-400">
              {section.section}
            </h6>
            <ul>
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex} className="ml-4">
                  <Link
                    href={link.href}
                    className="block px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 duration-300"
                  >
                    <div className="flex items-center text-lg">
                      {link.icon && <link.icon className="mr-3" />}
                      {link.label}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
