import { EC2Client } from '@aws-sdk/client-ec2';
import { IAMClient } from '@aws-sdk/client-iam';
import { STSClient } from '@aws-sdk/client-sts';

if (!process.env.AWS_REGION) {
  console.warn('AWS_REGION is not set. Defaulting to us-east-1.');
}

const clientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

export const ec2Client = new EC2Client(clientConfig);
export const iamClient = new IAMClient(clientConfig);
export const stsClient = new STSClient(clientConfig);
