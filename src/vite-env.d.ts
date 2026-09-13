/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_ENGINE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENROUTER_API_KEY?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
