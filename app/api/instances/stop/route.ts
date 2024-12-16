import { NextResponse } from 'next/server';
import { stopInstances } from '../api';

export async function POST(request: Request) {
  // Parse instance IDs from the request body
  const { instanceIds }: { instanceIds: string[] } = await request.json();

  // Validate instance IDs
  if (!Array.isArray(instanceIds) || instanceIds.length === 0) {
    return NextResponse.json(
      { message: 'Instance IDs are required and must be a non-empty array.' },
      { status: 400 }
    );
  }

  return await stopInstances(instanceIds);
}
