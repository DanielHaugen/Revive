'use client';

import Link from 'next/link';
import { FaUser, FaKey, FaCloud } from 'react-icons/fa6';

const sections = [
  {
    href: '/settings/profile',
    icon: FaUser,
    title: 'Profile',
    description: 'View and edit your name and account details.',
  },
  {
    href: '/settings/password',
    icon: FaKey,
    title: 'Change Password',
    description: 'Update your login credentials.',
  },
  {
    href: '/settings/aws',
    icon: FaCloud,
    title: 'AWS Configuration',
    description: 'Manage AWS region and credential settings.',
  },
];

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex items-start gap-4 bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-600 hover:bg-gray-800/50 transition"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 group-hover:bg-blue-600/20 transition">
              <section.icon className="text-gray-400 group-hover:text-blue-400 transition" />
            </div>
            <div>
              <h2 className="text-white font-semibold">{section.title}</h2>
              <p className="text-gray-400 text-sm mt-1">{section.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
