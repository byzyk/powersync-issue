import { AppRouter } from '@/AppRouter';
import { PowerSyncProvider } from '@/contexts/PowerSyncContext';

function App() {
  return (
    <PowerSyncProvider>
      <AppRouter />
    </PowerSyncProvider>
  );
}

export default App;
