interface ImportMetaEnv {
  readonly SEPARATE_INDIGO_RENDER?: string;
  readonly NODE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
