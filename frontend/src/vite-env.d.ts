/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin for production builds, e.g. https://api.example.com (no trailing slash) */
  readonly VITE_BACKEND_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
