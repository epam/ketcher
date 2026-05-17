'use client';

import dynamic from 'next/dynamic';

const EditorComponent = dynamic(
  () => import('./editor').then((mod) => mod.EditorComponent),
  { ssr: false },
);

export function EditorWrapper() {
  return <EditorComponent />;
}
