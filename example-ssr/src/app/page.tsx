import 'ketcher-react/dist/index.css';

import { EditorClient } from './editor-client';

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <EditorClient />
    </main>
  );
}
