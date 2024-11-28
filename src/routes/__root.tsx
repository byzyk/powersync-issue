import { createRootRouteWithContext } from '@tanstack/react-router';

import { useDB } from '@/contexts/PowerSyncContext';

export const Route = createRootRouteWithContext()({
  component: Root,
});

function Root() {
  const { status } = useDB();

  return (
    <>
      Hello! I'm <strong>{status.connected ? 'connected' : 'not connected'}</strong>
    </>
  );
}
