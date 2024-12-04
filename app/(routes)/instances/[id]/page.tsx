// app/instances/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Button from '@/ui/buttons/Button'; // Importing the reusable button component
import { Instance } from '@aws-sdk/client-ec2';

const InstanceDetailsPage = () => {
  const { id } = useParams();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch instance details from an API or mock data
    const fetchData = async () => {
      try {
        // Replace this URL with your actual API endpoint
        const response = await fetch(`/api/instances/${id}`);
        if (!response.ok) throw new Error('Failed to fetch instance data');

        const data: Instance = await response.json();
        setInstance(data);
      } catch (error) {
        console.error('Error fetching instance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!instance) {
    return <div>Instance not found.</div>;
  }

  return (
    <div className="p-8 bg-white shadow-lg rounded-lg w-full mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">Instance Details</h1>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="font-semibold">ID:</span>
          <span>{instance.InstanceId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Name:</span>
          <span>{instance.Tags?.find((tag) => tag.Key === 'Name')?.Value}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Type:</span>
          <span>{instance.PlatformDetails}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Status:</span>
          <span className="capitalize">{instance.State?.Name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Created At:</span>
          <span>
            {instance.LaunchTime
              ? new Date(instance.LaunchTime).toLocaleDateString()
              : 'Unknown'}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => alert('Taking action!')}>Manage Instance</Button>
      </div>
    </div>
  );
};

export default InstanceDetailsPage;
