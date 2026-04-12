// app/instances/[id]/page.tsx
'use client';

import Card from '@/lib/ui/card/Card';
import StatusChip from '@/lib/ui/chips/StatusChips';
import Copy from '@/lib/ui/icons/Copy';
import { InfoSection } from '@/lib/ui/info/InfoSection/InfoSection';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import { InstanceBlockDeviceMapping } from '@aws-sdk/client-ec2';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ActionButton from '../components/ActionButton';
import { mapEC2StatusToVariant } from '@/lib/constants/status';
import { useInstance } from '@/lib/hooks/useInstances';
import { useQueryClient } from '@tanstack/react-query';
import { DetailSkeleton } from '@/lib/ui/feedback/Skeleton';
import TagEditor from '@/lib/ui/tags/TagEditor';

const InstanceDetailsPage = () => {
  const { id } = useParams();
  const { data: instance, isLoading } = useInstance(id as string);
  const queryClient = useQueryClient();
  const refetch = () => queryClient.invalidateQueries({ queryKey: ['instances', id] });

  const columns: Column<InstanceBlockDeviceMapping>[] = [
    { header: 'Device Name', accessor: 'DeviceName' },
    { header: 'Attachment State', accessor: (item) => item.Ebs?.Status },
    {
      header: 'Volume ID',
      accessor: (item) => item.Ebs?.VolumeId,
      render: (value) => (
        <Link
          href={`/volumes/${value}`}
          className="text-blue-500 hover:text-blue-600"
        >
          {value as string}
        </Link>
      ),
    },
    {
      header: 'Attached On',
      accessor: (item) =>
        item.Ebs && item.Ebs.AttachTime
          ? new Date(item.Ebs.AttachTime).toLocaleDateString()
          : '',
    },
  ];

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!instance) {
    return <div>Instance not found.</div>;
  }

  return (
    <main className="my-4">
      <div className="flex justify-between mb-7">
        <h1 className="text-3xl font-semibold flex items-center">
          {instance.Tags?.find((tag) => tag.Key === 'Name')?.Value} (
          {instance.PlatformDetails}) {}
          {instance.State?.Name && (
            <StatusChip
              className="ml-2"
              variant={mapEC2StatusToVariant(instance.State.Name)}
              label={instance.State.Name}
            />
          )}
        </h1>
        <ActionButton
          instance={instance}
          className="py-3"
          onClick={refetch}
        />
      </div>

      <Card className="flex flex-col gap-x-5 gap-y-8 p-8 w-full mx-auto mt-7">
        <InfoSection title="Instance Information">
          <InfoSection.Field label="Instance Id">
            {instance.InstanceId && <Copy value={instance.InstanceId} />}
          </InfoSection.Field>
          <InfoSection.Field label="Type">
            {instance.InstanceType}
          </InfoSection.Field>
          <InfoSection.Field label="Name">
            {instance.Tags?.find((tag) => tag.Key === 'Name')?.Value}
          </InfoSection.Field>
          <InfoSection.Field label="Platform Details">
            {instance.PlatformDetails}
          </InfoSection.Field>
          <InfoSection.Field label="Architecture">
            {instance.Architecture}
          </InfoSection.Field>
          <InfoSection.Field label="Created At">
            {instance.LaunchTime
              ? new Date(instance.LaunchTime).toLocaleDateString()
              : 'Unknown'}
          </InfoSection.Field>
        </InfoSection>

        <InfoSection title="Networking Details">
          <InfoSection.Field label="Public IPv4">
            {instance.PublicIpAddress && (
              <Copy value={instance.PublicIpAddress} />
            )}
          </InfoSection.Field>
          <InfoSection.Field label="Private IPv4">
            {instance.PrivateIpAddress && (
              <Copy value={instance.PrivateIpAddress} />
            )}
          </InfoSection.Field>
          <InfoSection.Field label="Private DNS Name">
            {instance.PrivateDnsName && (
              <Copy value={instance.PrivateDnsName} />
            )}
          </InfoSection.Field>
          <InfoSection.Field label="Public DNS Name">
            {instance.PublicDnsName && (
              <Copy value={instance.PublicDnsName} />
            )}
          </InfoSection.Field>
          <InfoSection.Field label="VPC ID">
            {instance.VpcId && <Copy value={instance.VpcId} />}
          </InfoSection.Field>
          <InfoSection.Field label="Subnet ID">
            {instance.SubnetId && <Copy value={instance.SubnetId} />}
          </InfoSection.Field>
        </InfoSection>

        <InfoSection
          title={`Security Groups ( ${
            instance.SecurityGroups?.length || 0
          } )`}
        >
          {instance.SecurityGroups && instance.SecurityGroups.length > 0 ? (
            <div className="space-y-2">
              {instance.SecurityGroups.map((sg) => (
                <div
                  key={sg.GroupId}
                  className="flex items-center gap-3 bg-gray-800 rounded-md px-4 py-2"
                >
                  <span className="text-sm font-medium text-gray-200">
                    {sg.GroupName}
                  </span>
                  {sg.GroupId && (
                    <Copy value={sg.GroupId} title="Security Group ID" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No security groups attached.</p>
          )}
        </InfoSection>

        <InfoSection title={`Tags ( ${instance.Tags?.length || 0} )`}>
          <TagEditor
            resourceId={instance.InstanceId || ''}
            endpoint={`/api/instances/${instance.InstanceId}/tags`}
            tags={instance.Tags || []}
            onUpdate={refetch}
          />
        </InfoSection>

        <InfoSection
          title={`Attached Volumes ( ${
            instance.BlockDeviceMappings?.length || 0
          } )`}
        >
          <DataTable
            data={instance.BlockDeviceMappings || []}
            columns={columns}
          />
        </InfoSection>
      </Card>
    </main>
  );
};

export default InstanceDetailsPage;
