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

/**
 * Generic paginator for AWS SDK v3 commands that use NextToken pagination.
 * @param commandFn   A function that receives `nextToken` and returns the command response.
 * @param resultKey   The key on the response object that contains the result items.
 */
export async function paginate<TItem, TResponse extends { NextToken?: string }>(
  commandFn: (nextToken: string | undefined) => Promise<TResponse>,
  resultKey: keyof TResponse,
): Promise<TItem[]> {
  const items: TItem[] = [];
  let nextToken: string | undefined;

  do {
    const response = await commandFn(nextToken);
    const page = response[resultKey];
    if (Array.isArray(page)) {
      items.push(...(page as TItem[]));
    }
    nextToken = response.NextToken;
  } while (nextToken);

  return items;
}
