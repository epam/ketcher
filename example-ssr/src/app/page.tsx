'use client';

import dynamic from 'next/dynamic';

const EditorComponent = dynamic(
  () => import('./editor').then((mod) => ({ default: mod.EditorComponent })),
  { ssr: false },
);

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <EditorComponent />
    </main>
  );
}
