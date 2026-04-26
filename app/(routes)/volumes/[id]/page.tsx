'use client';

import Card from '@/lib/ui/card/Card';
import StatusChip from '@/lib/ui/chips/StatusChips';
import Copy from '@/lib/ui/icons/Copy';
import { InfoSection } from '@/lib/ui/info/InfoSection/InfoSection';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { DetailSkeleton } from '@/lib/ui/feedback/Skeleton';
import TagEditor from '@/lib/ui/tags/TagEditor';
import { mapVolumeStateToVariant, VolumeState } from '@/lib/constants/status';
import { useVolume } from '@/lib/hooks/useVolumes';
import { VolumeAttachment } from '@aws-sdk/client-ec2';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

const VolumeDetailsPage = () => {
  const { id } = useParams();
  const { data: volume, isLoading } = useVolume(id as string);
  const queryClient = useQueryClient();
  const refetch = () => queryClient.invalidateQueries({ queryKey: ['volumes', id] });

  const attachmentColumns: Column<VolumeAttachment>[] = [
    {
      header: 'Instance ID',
      accessor: 'InstanceId',
      render: (value) => (
        <Link href={`/instances/${value}`} className="text-blue-500 hover:text-blue-600">
          {value as string}
        </Link>
      ),
    },
    { header: 'Device', accessor: 'Device' },
    { header: 'State', accessor: 'State' },
    {
      header: 'Attached On',
      accessor: (item) =>
        item.AttachTime ? new Date(item.AttachTime).toLocaleDateString() : '',
    },
  ];

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!volume) {
    return <div>Volume not found.</div>;
  }

  return (
    <main className="my-4">
      <div className="flex justify-between mb-7">
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          {volume.VolumeId}
          {volume.State && (
            <StatusChip
              className="ml-2"
              variant={mapVolumeStateToVariant(volume.State as VolumeState)}
              label={volume.State}
            />
          )}
        </h1>
      </div>

      <Card className="flex flex-col gap-x-5 gap-y-8 p-8 w-full mx-auto mt-7">
        <InfoSection title="Volume Information">
          <InfoSection.Field label="Volume ID">
            {volume.VolumeId && <Copy value={volume.VolumeId} />}
          </InfoSection.Field>
          <InfoSection.Field label="Type">
            {volume.VolumeType}
          </InfoSection.Field>
          <InfoSection.Field label="Size">
            {volume.Size != null ? `${volume.Size} GiB` : ''}
          </InfoSection.Field>
          <InfoSection.Field label="Availability Zone">
            {volume.AvailabilityZone}
          </InfoSection.Field>
          <InfoSection.Field label="Created At">
            {volume.CreateTime
              ? new Date(volume.CreateTime).toLocaleString()
              : 'Unknown'}
          </InfoSection.Field>
          {volume.Iops != null && (
            <InfoSection.Field label="IOPS">
              {volume.Iops}
            </InfoSection.Field>
          )}
          {volume.Throughput != null && (
            <InfoSection.Field label="Throughput">
              {`${volume.Throughput} MiB/s`}
            </InfoSection.Field>
          )}
          <InfoSection.Field label="Encrypted">
            {volume.Encrypted ? 'Yes' : 'No'}
          </InfoSection.Field>
        </InfoSection>

        <InfoSection title={`Attachments ( ${volume.Attachments?.length || 0} )`}>
          {volume.Attachments && volume.Attachments.length > 0 ? (
            <DataTable
              data={volume.Attachments}
              columns={attachmentColumns}
              keyExtractor={(item) => item.InstanceId ?? item.Device ?? ''}
            />
          ) : (
            <p className="text-gray-500 text-sm">No instances attached.</p>
          )}
        </InfoSection>

        <InfoSection title={`Tags ( ${volume.Tags?.length || 0} )`}>
          <TagEditor
            resourceId={volume.VolumeId || ''}
            endpoint={`/api/volumes/${volume.VolumeId}/tags`}
            tags={volume.Tags || []}
            onUpdate={refetch}
          />
        </InfoSection>
      </Card>
    </main>
  );
};

export default VolumeDetailsPage;
