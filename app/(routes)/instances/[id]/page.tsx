// app/instances/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton'; // Importing the reusable button component

// Define the type for the instance data
type InstanceData = {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
};

const InstanceDetailsPage = () => {
  const { id } = useParams();
  const [instance, setInstance] = useState<InstanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch instance details from an API or mock data
    const fetchData = async () => {
      try {
        // Replace this URL with your actual API endpoint
        const response = await fetch(`/api/instances/${id}`);
        if (!response.ok) throw new Error('Failed to fetch instance data');

        const data: InstanceData = await response.json();
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
    <div className="p-8 bg-white shadow-lg rounded-lg max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">Instance Details</h1>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="font-semibold">ID:</span>
          <span>{instance.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Name:</span>
          <span>{instance.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Type:</span>
          <span>{instance.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Status:</span>
          <span className="capitalize">{instance.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Created At:</span>
          <span>{new Date(instance.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <PrimaryButton onClick={() => alert('Taking action!')}>
          Manage Instance
        </PrimaryButton>
      </div>
    </div>
  );
};

export default InstanceDetailsPage;
