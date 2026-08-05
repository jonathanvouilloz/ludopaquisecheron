/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly LUDOHUB_PUBLIC_API_BASE?: string;
  readonly LUDOHUB_PUBLIC_LUDO_SLUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
