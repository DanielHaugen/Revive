import {
  CreateTagsCommand,
  DeleteTagsCommand,
  Tag,
} from '@aws-sdk/client-ec2';
import { ec2Client } from '@/lib/services/aws';

/** Add tags to one or more AWS resources (instances, volumes, snapshots). */
export async function tagResources(resourceIds: string[], tags: Tag[]) {
  const command = new CreateTagsCommand({
    Resources: resourceIds,
    Tags: tags,
  });
  await ec2Client.send(command);
}

/** Remove tags from one or more AWS resources. */
export async function untagResources(resourceIds: string[], tags: Tag[]) {
  const command = new DeleteTagsCommand({
    Resources: resourceIds,
    Tags: tags,
  });
  await ec2Client.send(command);
}
