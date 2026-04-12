'use client';

import { useState } from 'react';
import Card from '@/lib/ui/card/Card';
import Button from '@/lib/ui/buttons/Button';
import { toast } from 'react-toastify';

const PasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to change password');
      }
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-3xl font-bold text-white">Change Password</h1>
        <p className="text-gray-400 text-sm mt-1">Enter your current password to set a new one.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="form-label">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              required
              minLength={8}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSubmit} disabled={saving || !currentPassword || !newPassword || !confirmPassword}>
              {saving ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PasswordPage;
