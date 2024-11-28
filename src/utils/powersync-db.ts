import { wrapPowerSyncWithKysely } from '@powersync/kysely-driver';
import { PowerSyncDatabase } from '@powersync/web';

import { Database, PowerSyncSchema } from './powersync-schema';

export const powerSyncPool = new PowerSyncDatabase({
  schema: PowerSyncSchema,
  database: {
    dbFilename: 'main.db',
  },
  flags: {
    useWebWorker: true,
    ssrMode: false,
  },
});

export const db = wrapPowerSyncWithKysely<Database>(powerSyncPool);
