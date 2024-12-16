export async function startInstance(instanceIds: string | string[]) {
  // Ensure the argument is always treated as an array
  const idsArray = Array.isArray(instanceIds) ? instanceIds : [instanceIds];

  const response = await fetch(`/api/instances/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ instanceIds: idsArray }),
  });

  if (!response.ok) {
    throw new Error('Failed to start the instance(s)');
  }

  return response.json();
}

export async function stopInstance(instanceIds: string | string[]) {
  // Ensure the argument is always treated as an array
  const idsArray = Array.isArray(instanceIds) ? instanceIds : [instanceIds];

  const response = await fetch(`/api/instances/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ instanceIds: idsArray }),
  });

  if (!response.ok) {
    throw new Error('Failed to start the instance(s)');
  }

  return response.json();
}
