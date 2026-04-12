'use client';

import Card from '@/lib/ui/card/Card';
import { InfoSection } from '@/lib/ui/info/InfoSection/InfoSection';
import LinkSnapshotModal from '@/lib/ui/modals/LinkSnapshotsModal';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { Tag } from '@aws-sdk/client-ec2';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useSnapshot } from '@/lib/hooks/useSnapshots';

const tagsColumns: Column<Tag>[] = [
  { header: 'Key', accessor: 'Key' },
  { header: 'Value', accessor: 'Value' },
];

const SnapshotDetailsPage = () => {
  const { id } = useParams();
  const { data: snapshot } = useSnapshot(id as string);
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <main>
      <Card className="flex flex-col gap-y-4">
        <InfoSection title="Snapshot Information">
          <InfoSection.Field label="Snapshot ID">
            {snapshot?.SnapshotId}
          </InfoSection.Field>
          <InfoSection.Field label="Volume ID">
            {snapshot?.VolumeId}
          </InfoSection.Field>
          <InfoSection.Field label="Volume Size">
            {snapshot?.VolumeSize}
          </InfoSection.Field>
          <InfoSection.Field label="Storage Tier">
            {snapshot?.StorageTier}
          </InfoSection.Field>
          <InfoSection.Field label="Date Taken">
            {snapshot?.StartTime &&
              new Date(snapshot.StartTime).toLocaleString()}
          </InfoSection.Field>
        </InfoSection>

        {snapshot?.Tags && (
          <InfoSection title="Tags">
            <DataTable data={snapshot.Tags} columns={tagsColumns} />
          </InfoSection>
        )}

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Link to EC2 Instance
        </button>
      </Card>

      {isModalOpen && (
        <LinkSnapshotModal
          snapshotId={snapshot?.SnapshotId || ''}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
};

export default SnapshotDetailsPage;
