'use client';

import Card from '@/lib/ui/card/Card';
import { InfoSection } from '@/lib/ui/info/InfoSection/InfoSection';
import LinkSnapshotModal from '@/lib/ui/modals/LinkSnapshotsModal';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { Snapshot, Tag } from '@aws-sdk/client-ec2';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const REFRESH_INTERVAL_MS = 10 * 1000;

const tagsColumns: Column<Tag>[] = [
  { header: 'Key', accessor: 'Key' },
  { header: 'Value', accessor: 'Value' },
];

const SnapshotDetailsPage = () => {
  const { id } = useParams();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  // Fetch snapshot details from an API
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/snapshots/${id}`);
      if (!response.ok) throw new Error('Failed to fetch snapshot data');

      const data: Snapshot = await response.json();
      setSnapshot(data);
    } catch (error) {
      console.error('Error fetching snapshot:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [id]);

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
