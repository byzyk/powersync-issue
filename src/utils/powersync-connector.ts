import { AbstractPowerSyncDatabase, PowerSyncBackendConnector } from '@powersync/web';

// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
  // Class 22 — Data Exception
  // Examples include data type mismatch.
  new RegExp('^22...$'),
  // Class 23 — Integrity Constraint Violation.
  // Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
  new RegExp('^23...$'),
  // INSUFFICIENT PRIVILEGE - typically a row-level security violation
  new RegExp('^42501$'),
];

type Config = {
  syncApiUrl: string;
};

export class Connector implements PowerSyncBackendConnector {
  config: Config;

  constructor() {
    this.config = {
      syncApiUrl: import.meta.env.VITE_SYNC_API_URL,
    };
  }

  async fetchCredentials() {
    return {
      endpoint: this.config.syncApiUrl,
      token: import.meta.env.VITE_TOKEN,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase) {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) {
      return;
    }

    try {
      // ... sync api here
      await transaction.complete();
    } catch (err: any) {
      console.debug(err);
      if (typeof err.code == 'string' && FATAL_RESPONSE_CODES.some((regex) => regex.test(err.code))) {
        /**
         * Instead of blocking the queue with these errors,
         * discard the (rest of the) transaction.
         *
         * Note that these errors typically indicate a bug in the application.
         * If protecting against data loss is important, save the failing records
         * elsewhere instead of discarding, and/or notify the user.
         */
        console.error(`Data upload error`, err);
        await transaction.complete();
      } else {
        // Error may be retryable - e.g. network error or temporary server error.
        // Throwing an error here causes this call to be retried after a delay.
        throw err;
      }
    }
  }
}
