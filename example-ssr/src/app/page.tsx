'use client';

import dynamic from 'next/dynamic';

import 'ketcher-react/dist/index.css';

const EditorComponent = dynamic(
  () => import('./editor').then((module) => module.EditorComponent),
  { ssr: false },
);

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <EditorComponent />
    </main>
  );
}
