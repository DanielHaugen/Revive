export async function startInstance(instanceId: string) {
  const response = await fetch(`/api/instances/${instanceId}/start`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to start the instance');
  }

  return response.json();
}

export async function stopInstance(instanceId: string) {
  const response = await fetch(`/api/instances/${instanceId}/stop`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to stop the instance');
  }

  return response.json();
}
