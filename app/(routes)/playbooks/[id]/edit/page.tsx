'use client';

import PlaybookForm, { PlaybookData } from '@/lib/forms/PlaybookForm';
import { StepWithTargets } from '@/lib/types';
import { Playbook } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const EditPlaybookPage = () => {
  const { id } = useParams(); // Access the playbook ID from the URL
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [steps, setSteps] = useState<StepWithTargets[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const [formData, setFormData] = useState<PlaybookData>({
    name: '',
    description: '',
    steps: [{ type: '', targets: [] }], // Track dynamic steps added in the Details component
  });

  useEffect(() => {
    const fetchPlaybookDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/playbooks/${id}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch playbook details: ${response.statusText}`
          );
        }
        const data = await response.json();
        const { steps, ...play } = data.playbook;
        setPlaybook(play);
        setSteps(steps);
        if (play != null) {
          let form: PlaybookData = {
            name: play.name,
            description: play.description,
            steps: steps,
          };
          setFormData(form);
        }
      } catch (error) {
        console.error('Error fetching playbook details:', error);
        toast.error('Unable to load playbook details');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybookDetails();
  }, [id]);

  const onSubmit = async () => {
    // Validate and submit the data
    try {
      const response = await fetch('/api/playbooks/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create playbook');
      }

      const playbook = await response.json();
      toast.success(`Created Playbook: '${playbook.name}'`);
      router.push(`/playbooks/${id}/edit`);
    } catch (error) {
      console.error('Error creating playbook:', error);
      toast.error('Failed to create playbook. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-4">
      <PlaybookForm
        title="Edit Playbook"
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default EditPlaybookPage;
