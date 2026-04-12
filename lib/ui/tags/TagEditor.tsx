'use client';

import { useState } from 'react';
import { Tag } from '@aws-sdk/client-ec2';
import { FaPlus, FaTrash } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import Button from '@/lib/ui/buttons/Button';

type TagEditorProps = {
  resourceId: string;
  /** API endpoint for PUT tag operations, e.g. "/api/instances/i-abc/tags" */
  endpoint: string;
  tags: Tag[];
  onUpdate: () => void;
};

export default function TagEditor({ resourceId, endpoint, tags, onUpdate }: TagEditorProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddTag = async () => {
    const key = newKey.trim();
    const value = newValue.trim();
    if (!key) {
      toast.error('Tag key is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: [{ Key: key, Value: value }] }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to add tag');
      }
      toast.success(`Tag "${key}" added`);
      setNewKey('');
      setNewValue('');
      onUpdate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteTags: [{ Key: tag.Key, Value: tag.Value }] }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to remove tag');
      }
      toast.success(`Tag "${tag.Key}" removed`);
      onUpdate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove tag');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Existing tags */}
      {tags.length > 0 ? (
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Key</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Value</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-300 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag, idx) => (
              <tr key={`${tag.Key}-${idx}`} className="border-t border-gray-800">
                <td className="px-4 py-2 text-sm text-gray-300">{tag.Key}</td>
                <td className="px-4 py-2 text-sm text-gray-300">{tag.Value || '—'}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    disabled={saving}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50 p-1"
                    title={`Remove tag "${tag.Key}"`}
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-sm">No tags.</p>
      )}

      {/* Add tag row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-md py-1.5 px-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
        />
        <input
          type="text"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-md py-1.5 px-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
        />
        <Button
          onClick={handleAddTag}
          disabled={saving || !newKey.trim()}
          ariaLabel="Add tag"
          className="flex items-center gap-1.5 px-3 py-1.5"
        >
          <FaPlus className="text-xs" /> Add
        </Button>
      </div>
    </div>
  );
}
