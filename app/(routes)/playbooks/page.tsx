'use client';

import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import Button from '@/ui/buttons/Button';
import { Playbook } from '@prisma/client';
import { useState, useEffect } from 'react';
import {
  FaArrowUpFromBracket,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaPlay,
  FaPlus,
  FaRegStar,
} from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Card from '@/lib/ui/card/Card';

const PlaybooksPage = () => {
  const [showStarred, setShowStarred] = useState<boolean>(true);
  const [showAll, setShowAll] = useState<boolean>(true);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]); // State to store fetched playbooks
  const [loading, setLoading] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        const response = await fetch('/api/playbooks');
        const data = await response.json();
        setPlaybooks(data);
      } catch (error) {
        console.error('Error fetching playbooks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybooks();
  }, []);

  const columns: Column<Playbook>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Actions',
      accessor: (item) => item as unknown as React.ReactNode,
      render: (value) => {
        const playbook = value as unknown as Playbook;
        return (
          <div className="flex gap-4 items-center">
            <Button
              onClick={() => onPlaybookRunClicked(playbook)}
              ariaLabel="Run Playbook"
              className="flex items-center justify-center"
              disabled={isRunning}
              title="Run this Playbook"
            >
              <FaPlay className="text-white-600 mr-2" />
              Run
            </Button>
            <FaRegStar
              className="cursor-pointer hover:text-blue-600 text-xl"
              title="Star this Playbook"
              onClick={() => onPlaybookStarClicked(playbook)}
            />
          </div>
        );
      },
    },
  ];

  const onPlaybookStarClicked = (playbook: Playbook) => {
    console.log('Starred:', playbook);
    toast.success('Playbook starred');
  };

  const onPlaybookRunClicked = (playbook: Playbook) => {
    console.log('Clicked Run:', playbook);
    toast.success('Playbook Run Clicked');
  };

  const handleRowClick = (playbook: Playbook, e: React.MouseEvent) => {
    // Check if the clicked element is a button or the svg in the button
    if (e.target instanceof HTMLButtonElement || e.target instanceof SVGElement)
      return;

    console.log('Row Clicked:', playbook);
    toast.success('Playbook Row Clicked');
  };

  return (
    <div className="container mx-auto py-4">
      {/* Title Section */}
      <section className="flex mb-4">
        <h1 className="text-2xl font-semibold">Orchestration Playbooks</h1>
        <Button
          onClick={() => router.push('/playbooks/new')}
          className="ml-auto"
          title="Create a new Playbook"
        >
          <div className="flex items-center">
            <FaPlus className="mr-2" />
            New Playbook
          </div>
        </Button>

        <div className="inline-flex rounded-md shadow-md ml-2" role="group">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border rounded-s-lg border-gray-200 hover:bg-blue-600 hover:text-white focus:z-10 duration-200"
            onClick={() => toast.info('Importing not yet implemented')}
            title="Import Playbooks"
          >
            <FaDownload className="text-lg" />
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border rounded-e-lg border-gray-200 hover:bg-blue-600 hover:text-white focus:z-10 duration-200"
            onClick={() => toast.info('Exporting not yet implemented')}
            title="Export Playbooks"
          >
            <FaArrowUpFromBracket className="text-lg" />
          </button>
        </div>
      </section>

      {/* Starred Playbooks */}
      <section className="mb-4">
        <div className="flex items-center">
          <h3 className="mb-0">Starred Playbooks</h3>
          <span
            className="cursor-pointer hover:text-blue-600 duration-200 ml-2"
            onClick={() => setShowStarred(!showStarred)}
          >
            {showStarred ? <FaChevronDown /> : <FaChevronUp />}
          </span>
        </div>
        {showStarred && (
          <>
            <Card>
              <p className="text-center">No starred Playbooks found.</p>
            </Card>
          </>
        )}
      </section>

      {/* All Playbooks */}
      <section className="mb-4">
        <div className="flex items-center">
          <h3 className="mb-0">All Playbooks</h3>
          <span
            className="cursor-pointer hover:text-blue-600 duration-200 ml-2"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? <FaChevronDown /> : <FaChevronUp />}
          </span>
        </div>
        {showAll && (
          <>
            {loading ? (
              <Card>
                <p className="text-center">Loading playbooks...</p>
              </Card>
            ) : playbooks.length === 0 ? (
              <Card>
                <p className="text-center">No Playbooks found.</p>
              </Card>
            ) : (
              <DataTable
                data={playbooks}
                columns={columns}
                onRowClick={handleRowClick}
                className="my-4"
              />
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default PlaybooksPage;
