import { EC2Client } from '@aws-sdk/client-ec2';

if (!process.env.AWS_REGION) {
  console.warn('AWS_REGION is not set. Defaulting to us-east-1.');
}

export const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || 'us-east-1',
});
