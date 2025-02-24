/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SYNC_API_URL: string;
  readonly VITE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
