/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_ENGINE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
