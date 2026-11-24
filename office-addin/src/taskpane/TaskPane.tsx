import { useState } from 'react';
import { editInKetcher } from './dialog';
import { getSelectedStructure, insertStructure } from './powerpoint';

type Status = { kind: 'idle' | 'busy' | 'error' | 'done'; text: string };

const IDLE: Status = { kind: 'idle', text: '' };

export function TaskPane({ inPowerPoint }: { inPowerPoint: boolean }) {
  const [status, setStatus] = useState<Status>(IDLE);

  if (!inPowerPoint) {
    return (
      <main className="pane">
        <h1>Ketcher</h1>
        <p>
          Open this page from PowerPoint. To try the editor alone, open{' '}
          <a href="editor.html">editor.html</a>.
        </p>
      </main>
    );
  }

  const run = async (action: () => Promise<string | null>) => {
    setStatus({ kind: 'busy', text: 'Waiting for Ketcher…' });
    try {
      const text = await action();
      setStatus(text ? { kind: 'done', text } : IDLE);
    } catch (error) {
      setStatus({ kind: 'error', text: (error as Error).message });
    }
  };

  const insertNew = () =>
    run(async () => {
      const payload = await editInKetcher(null);
      if (!payload) return null;
      await insertStructure(payload);
      return 'Structure inserted.';
    });

  const editSelected = () =>
    run(async () => {
      const selected = await getSelectedStructure();
      if (!selected) {
        throw new Error(
          'Select one picture that was inserted with Ketcher, then try again.',
        );
      }
      const payload = await editInKetcher(selected.ket);
      if (!payload) return null;
      await insertStructure(payload, selected);
      return 'Structure updated.';
    });

  const busy = status.kind === 'busy';

  return (
    <main className="pane">
      <h1>Ketcher</h1>
      <p>Draw a chemical structure and place it on the current slide.</p>
      <button type="button" disabled={busy} onClick={insertNew}>
        Insert structure
      </button>
      <button
        type="button"
        className="secondary"
        disabled={busy}
        onClick={editSelected}
      >
        Edit selected structure
      </button>
      {status.text && (
        <p className={`status ${status.kind}`} role="status">
          {status.text}
        </p>
      )}
    </main>
  );
}
