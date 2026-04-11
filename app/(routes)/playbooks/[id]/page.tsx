'use client';

import { StepWithTargets } from '@/lib/types';
import Card from '@/lib/ui/card/Card';
import Button from '@/lib/ui/buttons/Button';
import { Playbook } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const PlaybookDetailsPage = () => {
  const { id } = useParams(); // Access the playbook ID from the URL
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [steps, setSteps] = useState<StepWithTargets[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

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
        setPlaybook(data.playbook);
        setSteps(data.playbook.steps);
      } catch (error) {
        console.error('Error fetching playbook details:', error);
        toast.error('Unable to load playbook details');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybookDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-4">
        <Card>
          <p className="text-center">Loading playbook details...</p>
        </Card>
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="container mx-auto py-4">
        <Card>
          <p className="text-center">Playbook not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <section className="mb-4">
        <div className="flex items-start">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold">{playbook.name}</h1>
            <p className="text-gray-700">{playbook.description}</p>
          </div>
          <Button
            onClick={() => router.push(`/playbooks/${id}/edit`)}
            title="Edit Playbook"
            className="ml-auto"
          >
            Edit Playbook
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Steps</h2>
        {steps.length === 0 ? (
          <Card>
            <p className="text-center">No steps found for this playbook.</p>
          </Card>
        ) : (
          steps.map((step) => (
            <Card key={step.id} className="mb-4">
              <h3 className="font-semibold">{step.type}</h3>
              <p>Targets:</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                {step.targets.map((t) => {
                  return <li key={t.instanceId}>{t.instanceId}</li>;
                })}
              </ul>
            </Card>
          ))
        )}
      </section>
    </div>
  );
};

export default PlaybookDetailsPage;
