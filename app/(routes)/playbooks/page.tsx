'use client';

import Card from '@/lib/ui/card/Card';
import DataTable, { Column } from '@/lib/ui/tables/DataTable';
import Button from '@/lib/ui/buttons/Button';
import ConfirmationModal from '@/lib/ui/modals/ConfirmationModal';
import { Playbook } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FaArrowUpFromBracket,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaPlay,
  FaPlus,
  FaRegStar,
  FaStar,
  FaTrash,
} from 'react-icons/fa6';
import { toast } from 'react-toastify';

const PlaybooksPage = () => {
  const [showStarred, setShowStarred] = useState<boolean>(true);
  const [showAll, setShowAll] = useState<boolean>(true);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]); // State to store fetched playbooks
  const [loading, setLoading] = useState<boolean>(true);
  const [runningPlaybookId, setRunningPlaybookId] = useState<number | null>(
    null
  ); // ID of the running playbook
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
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
    {
      header: 'Name',
      accessor: (item) => item as unknown as React.ReactNode,
      render: (value) => {
        const playbook = value as unknown as Playbook;
        return (
          <div className="flex gap-2 items-center">
            <span>{playbook.name}</span>
            {playbook.starred ? (
              <FaStar
                className="cursor-pointer hover:text-yellow-500 text-xl text-blue-600 duration-200"
                title="Unstar this Playbook"
                onClick={() => onPlaybookStarClicked(playbook)}
              />
            ) : (
              <FaRegStar
                className="cursor-pointer hover:text-blue-600 text-xl"
                title="Star this Playbook"
                onClick={() => onPlaybookStarClicked(playbook)}
              />
            )}
          </div>
        );
      },
    },
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
              disabled={runningPlaybookId === playbook.id}
              title="Run this Playbook"
            >
              {runningPlaybookId === playbook.id ? (
                <span>Running...</span>
              ) : (
                <>
                  <FaPlay className="text-white-600 mr-2" />
                  Run
                </>
              )}
            </Button>
            <Button
              onClick={() => onPlaybookDeleteClicked(playbook.id)}
              ariaLabel="Delete Playbook"
              className="flex items-center justify-center"
              variant="danger"
              title="Delete this Playbook"
            >
              <FaTrash className="text-white-600 my-1" />
            </Button>
          </div>
        );
      },
    },
  ];

  const onPlaybookStarClicked = async (playbook: Playbook) => {
    try {
      const response = await fetch(`/api/playbooks/${playbook.id}/star`, {
        method: 'PUT',
      });

      if (response.ok) {
        const updatedPlaybook: Playbook = await response.json();
        setPlaybooks((prev) =>
          prev.map((p) => (p.id === updatedPlaybook.id ? updatedPlaybook : p))
        );
        toast.success(
          `${updatedPlaybook.starred ? 'Starred' : 'Unstarred'} playbook "${
            playbook.name
          }".`
        );
      } else {
        const error = await response.json();
        toast.error(`Failed to toggle star: ${error.message}`);
      }
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('An error occurred while toggling the star.');
    }
  };

  const onPlaybookRunClicked = async (playbook: Playbook) => {
    setRunningPlaybookId(playbook.id); // Mark as running
    try {
      const response = await fetch(`/api/playbooks/${playbook.id}/run`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`Playbook "${playbook.name}" is running.`);
      } else {
        const error = await response.json();
        toast.error(`Failed to run playbook: ${error.message}`);
      }
    } catch (error) {
      console.error('Error running playbook:', error);
      toast.error('An error occurred while running the playbook.');
    } finally {
      setRunningPlaybookId(null); // Reset running state
    }
  };

  const handleRowClick = (playbook: Playbook, e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement || e.target instanceof SVGElement)
      return;
    router.push(`/playbooks/${playbook.id}`);
  };

  const onPlaybookDeleteClicked = async (playbookId: number) => {
    setDeleteTarget(playbookId);
  };

  const confirmDeletePlaybook = async () => {
    if (deleteTarget === null) return;
    const playbookId = deleteTarget;
    setDeleteTarget(null);

    try {
      const response = await fetch(`/api/playbooks/${playbookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPlaybooks((prev) => prev.filter((p) => p.id !== playbookId));
        toast.success('Playbook deleted successfully.');
      } else {
        const error = await response.json();
        toast.error(`Failed to delete playbook: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting playbook:', error);
      toast.error('An error occurred while deleting the playbook.');
    }
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
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-s-lg hover:bg-blue-600 hover:text-white focus:z-10 duration-200"
            onClick={() => toast.info('Importing not yet implemented')}
            title="Import Playbooks"
          >
            <FaDownload className="text-lg" />
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-e-lg hover:bg-blue-600 hover:text-white focus:z-10 duration-200"
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
            {playbooks.filter((p) => p.starred).length === 0 ? (
              <Card>
                <p className="text-center">No starred Playbooks found.</p>
              </Card>
            ) : (
              <DataTable
                data={playbooks.filter((p) => p.starred)}
                columns={columns}
                onRowClick={handleRowClick}
                className="my-4"
              />
            )}
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

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeletePlaybook}
        message="Are you sure you want to delete this playbook?"
      />
    </div>
  );
};

export default PlaybooksPage;
