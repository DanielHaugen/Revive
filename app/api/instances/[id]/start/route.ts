import { startInstances } from '../../api';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  return await startInstances(id);
}
