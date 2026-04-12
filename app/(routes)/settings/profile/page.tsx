'use client';

import { useEffect, useState } from 'react';
import Card from '@/lib/ui/card/Card';
import Button from '@/lib/ui/buttons/Button';
import { toast } from 'react-toastify';
import Spinner from '@/lib/ui/feedback/Spinner';

type UserProfile = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then((data: UserProfile) => {
        setProfile(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update profile');
      }
      const updated = await res.json();
      setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success('Profile updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-gray-400">Unable to load profile.</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white">User Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your personal information.</p>
      </div>

      <Card className="space-y-5 p-6">
        <div>
          <label className="form-label">Email</label>
          <p className="text-gray-200">{profile.email}</p>
        </div>

        <div>
          <label className="form-label">Role</label>
          <p className="text-gray-200 capitalize">{profile.role}</p>
        </div>

        <div>
          <label className="form-label">Member Since</label>
          <p className="text-gray-200">{new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>

        <hr className="border-gray-700" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input"
              placeholder="First name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input"
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
