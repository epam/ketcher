'use client';

import dynamic from 'next/dynamic';

// `ssr: false` prevents the ketcher-standalone module (and its Web Worker
// instantiation at module level) from executing in the Node.js SSR context.
const EditorComponent = dynamic(
  () => import('./editor').then((mod) => mod.EditorComponent),
  { ssr: false },
);

export function ClientEditor() {
  return <EditorComponent />;
}
