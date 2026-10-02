'use client';

import dynamic from 'next/dynamic';

const EditorComponent = dynamic(
  () => import('./editor').then((m) => m.EditorComponent),
  { ssr: false },
);

export function EditorClient() {
  return <EditorComponent />;
}
