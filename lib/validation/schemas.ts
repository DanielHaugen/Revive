import { z } from 'zod';

// --- Shared primitives ---

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(255);

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

export const awsInstanceIdSchema = z
  .string()
  .trim()
  .min(1, 'Instance ID is required');

export const awsSnapshotIdSchema = z
  .string()
  .trim()
  .min(1, 'Snapshot ID is required');

export const awsVolumeIdSchema = z
  .string()
  .trim()
  .min(1, 'Volume ID is required');

export const playbookIdSchema = z.coerce
  .number()
  .int()
  .positive('Playbook ID must be a positive integer');

// --- Auth ---

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
});

// --- Instances ---

export const instanceIdsSchema = z.object({
  instanceIds: z
    .array(awsInstanceIdSchema)
    .min(1, 'At least one instance ID is required')
    .max(50),
});

// --- Playbooks ---

const targetSchema = z.union([
  z.string().trim().min(1),
  z.object({
    instanceId: z.string().trim().min(1),
    instanceName: z.string().trim().max(255).optional(),
    availabilityZone: z.string().trim().max(64).optional(),
    snapshotId: z.string().trim().optional(),
    snapshotName: z.string().trim().max(255).optional(),
  }),
]);

const stepSchema = z.object({
  type: z.enum(['start-instances', 'stop-instances', 'restore-instances']),
  targets: z.array(targetSchema).min(1, 'Each step must have at least one target'),
});

export const playbookBodySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  steps: z.array(stepSchema).min(1, 'At least one step is required').max(20),
});

// --- Snapshots ---

const tagSchema = z.object({
  Key: z.string().trim().min(1).max(128),
  Value: z.string().trim().max(256),
});

export const snapshotTagsSchema = z.object({
  tags: z.array(tagSchema).min(1, 'At least one tag is required').max(50),
});

export const resourceTagsSchema = z.object({
  tags: z.array(tagSchema).max(50).optional(),
  deleteTags: z.array(tagSchema).max(50).optional(),
}).refine(
  (data) => (data.tags && data.tags.length > 0) || (data.deleteTags && data.deleteTags.length > 0),
  { message: 'At least one tag to add or remove is required' },
);

// --- Volumes ---

export const createVolumeSchema = z.object({
  availabilityZone: z.string().trim().min(1, 'Availability zone is required'),
  size: z.number().int().min(1, 'Size must be at least 1 GB').max(16384),
  volumeType: z.enum(['gp2', 'gp3', 'io1', 'io2', 'st1', 'sc1', 'standard']),
});

export const attachVolumeSchema = z.object({
  instanceId: awsInstanceIdSchema,
  device: z.string().trim().min(1, 'Device name is required'),
});

export const detachVolumeSchema = z.object({
  volumeId: awsVolumeIdSchema,
});

// --- Snapshots ---

export const createSnapshotSchema = z.object({
  volumeId: awsVolumeIdSchema,
  description: z.string().trim().max(255).optional(),
});
