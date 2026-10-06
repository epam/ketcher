'use client';

import dynamic from 'next/dynamic';

export const EditorComponent = dynamic(
  () =>
    import('./editor-client').then(({ EditorComponent }) => EditorComponent),
  { ssr: false },
);
