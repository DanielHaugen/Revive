'use client';

import Card from '@/lib/ui/card/Card';
import Button from '@/lib/ui/buttons/Button';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybook } from '@/lib/hooks/usePlaybooks';
import { DetailSkeleton } from '@/lib/ui/feedback/Skeleton';
import PlaybookCanvas from '@/lib/ui/playbooks/PlaybookCanvas';

const PlaybookDetailsPage = () => {
  const { id } = useParams();
  const { data: playbook, isLoading } = usePlaybook(Number(id));
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="container mx-auto py-4">
        <DetailSkeleton />
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
            <p className="text-gray-400">{playbook.description}</p>
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
        {playbook.steps.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500">No steps found for this playbook.</p>
          </Card>
        ) : (
          <PlaybookCanvas steps={playbook.steps} />
        )}
      </section>
    </div>
  );
};

export default PlaybookDetailsPage;
