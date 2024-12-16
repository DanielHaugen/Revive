'use client';

import PlaybookForm, { PlaybookData } from '@/lib/forms/PlaybookForm';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

const NewPlaybookPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<PlaybookData>({
    name: '',
    description: '',
    steps: [{ type: '', targets: [] }], // Track dynamic steps added in the Details component
  });

  const onSubmit = async () => {
    // Validate and submit the data
    try {
      const response = await fetch('/api/playbooks/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create playbook');
      }

      const playbook = await response.json();
      toast.success(`Created Playbook: '${playbook.name}'`);
      router.push('/playbooks');
    } catch (error) {
      console.error('Error creating playbook:', error);
      toast.error('Failed to create playbook. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-4">
      <PlaybookForm
        title="Create a New Playbook"
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default NewPlaybookPage;
