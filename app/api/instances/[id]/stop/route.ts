import { stopInstances } from '../../api';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  return await stopInstances(id);
}
