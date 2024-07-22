import 'ketcher-react/dist/index.css';

import { EditorComponent } from './editor';

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <EditorComponent />
    </main>
  );
}
