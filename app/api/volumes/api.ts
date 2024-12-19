import {
  DeleteVolumeCommand,
  DeleteVolumeCommandOutput,
  EC2Client,
} from '@aws-sdk/client-ec2';

const ec2Client = new EC2Client({ region: 'us-east-1' });

/**
 * Deletes one or more volumes by ID(s).
 * @param volumeIds - A single volume ID (string) or a list of volume IDs (string[]).
 * @returns A promise that resolves when the volume(s) are deleted.
 * @throws Error if the operation fails.
 */
export async function deleteVolume(
  volumeIds: string | string[]
): Promise<void> {
  const ids = Array.isArray(volumeIds) ? volumeIds : [volumeIds];

  if (ids.length === 0) {
    throw new Error('No volume IDs provided for deletion');
  }

  try {
    // Process all volume IDs
    const deletePromises: Promise<DeleteVolumeCommandOutput>[] = ids.map(
      (volumeId) => {
        const command = new DeleteVolumeCommand({ VolumeId: volumeId });
        return ec2Client.send(command);
      }
    );

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    console.log(`Volumes ${ids.join(', ')} deleted successfully`);
  } catch (error) {
    // Narrow error type
    if (error instanceof Error) {
      console.error(`Failed to delete volumes ${ids.join(', ')}:`, error);
      throw new Error(`Failed to delete volumes: ${error.message}`);
    } else {
      console.error(
        `Failed to delete volumes ${ids.join(', ')}, unknown error:`,
        error
      );
      throw new Error('Failed to delete volumes due to an unknown error');
    }
  }
}
