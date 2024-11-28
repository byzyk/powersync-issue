import { Schema } from '@powersync/web';

export const PowerSyncSchema = new Schema({});

export type Database = (typeof PowerSyncSchema)['types'];
