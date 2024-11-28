/* eslint-disable react-refresh/only-export-components */
import { Kysely } from '@powersync/kysely-driver';
import { SyncStatus } from '@powersync/web';
import Logger from 'js-logger';
import { createContext, ReactNode, Suspense, useContext, useEffect, useState } from 'react';

import { Connector } from '@/utils/powersync-connector';
import { db, powerSyncPool } from '@/utils/powersync-db';
import { Database } from '@/utils/powersync-schema';

export type PowerSyncContextType = {
  powerSync: typeof powerSyncPool;
  db: Kysely<Database>;
  status: SyncStatus;
};

export const POWERSYNC_CONTEXT_DEFAULT: PowerSyncContextType = {
  powerSync: powerSyncPool,
  db,
  status: powerSyncPool.currentStatus,
};

const PowerSyncContext = createContext<PowerSyncContextType>(POWERSYNC_CONTEXT_DEFAULT);

export type PowerSyncContextProviderProps = {
  children: ReactNode;
};

export const PowerSyncProvider = ({ children }: PowerSyncContextProviderProps) => {
  const { powerSync, db } = POWERSYNC_CONTEXT_DEFAULT;
  const [connector] = useState(new Connector());

  const [status, setStatus] = useState(powerSync.currentStatus);

  useEffect(() => {
    const listener = powerSync.registerListener({
      statusChanged: setStatus,
    });

    return () => {
      listener();
    };
  }, [powerSync]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    Logger.useDefaults();
    Logger.setLevel(Logger.DEBUG);
    void (async function init() {
      await powerSync.init();
      await powerSync.connect(connector);
    })();
  }, [powerSync, connector]);

  return (
    <Suspense fallback={null}>
      <PowerSyncContext.Provider value={{ powerSync, db, status }}>
        {status.connected ? children : <>Connecting...</>}
      </PowerSyncContext.Provider>
    </Suspense>
  );
};

export const useDB = () => useContext<PowerSyncContextType>(PowerSyncContext);
