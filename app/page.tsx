'use client';

import Card from '@/lib/ui/card/Card';
import { Instance } from '@aws-sdk/client-ec2';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaMicrochip } from 'react-icons/fa6';

type Snapshot = {
  SnapshotId: string;
  State: string;
};

export default function Home() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the instances and snapshots APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const instanceRes = await fetch('/api/instances');
        const snapshotRes = await fetch('/api/snapshots');

        const instanceData = await instanceRes.json();
        const snapshotData: Snapshot[] = []; // await snapshotRes.json();
        console.log(instanceRes);
        setInstances(instanceData || []);
        setSnapshots(snapshotData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Instances Overview */}
        <Card className="bg-gray-900 text-white shadow-lg rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">EC2 Instances</h2>
          {instances.length === 0 ? (
            <p>No instances found.</p>
          ) : (
            <ul>
              {instances.slice(0, 5).map((instance) => (
                <li key={instance.InstanceId} className="border-b py-2">
                  <Link href={`/instances/${instance.InstanceId}`}>
                    {/* Put all on one line */}
                    <span className="flex items-center text-blue-500">
                      <FaMicrochip className="mr-2" />
                      <span className="font-semibold">
                        {
                          instance.Tags?.find((tag) => tag.Key === 'Name')
                            ?.Value
                        }{' '}
                        - {instance.State?.Name}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/instances">
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
              Manage Instances
            </button>
          </Link>
        </Card>

        {/* Snapshots Overview */}
        <Card className="bg-gray-900 text-white shadow-lg rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Snapshots</h2>
          {snapshots.length === 0 ? (
            <p>No snapshots found.</p>
          ) : (
            <ul>
              {snapshots.slice(0, 5).map((snapshot) => (
                <li key={snapshot.SnapshotId} className="border-b py-2">
                  <Link href={`/snapshots/${snapshot.SnapshotId}`}>
                    <span className="text-green-500 cursor-pointer">
                      {snapshot.SnapshotId} - {snapshot.State}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/snapshots">
            <button className="mt-4 bg-green-500 text-white py-2 px-4 rounded">
              Manage Snapshots
            </button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
