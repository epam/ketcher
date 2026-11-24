import { useEffect, useState } from 'react';
import type { Ketcher } from 'ketcher-core';
import { Editor } from 'ketcher-react';
import { StandaloneStructServiceProvider } from 'ketcher-standalone/dist/binaryWasm';
import 'ketcher-react/dist/index.css';
import type {
  DialogToHostMessage,
  HostToDialogMessage,
  StructurePayload,
} from '../shared/messages';

const structServiceProvider = new StandaloneStructServiceProvider();

function sendToHost(message: DialogToHostMessage) {
  Office.context.ui.messageParent(JSON.stringify(message));
}

function isBlank(ket: string) {
  const parsed = JSON.parse(ket) as { root?: { nodes?: unknown[] } };
  return !parsed.root?.nodes?.length;
}

async function exportStructure(ketcher: Ketcher): Promise<StructurePayload> {
  const ket = await ketcher.getKet();
  if (isBlank(ket)) throw new Error('Draw a structure first.');
  const image = await ketcher.generateImage(ket, { outputFormat: 'svg' });
  return { ket, svg: await image.text() };
}

declare global {
  interface Window {
    ketcher?: Ketcher;
  }
}

export function EditorApp({ inOfficeDialog }: { inOfficeDialog: boolean }) {
  const [ketcher, setKetcher] = useState<Ketcher | null>(null);
  // undefined: the host has not answered yet; null: start with an empty canvas.
  const [initialKet, setInitialKet] = useState<string | null | undefined>(
    inOfficeDialog ? undefined : null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [previewSvg, setPreviewSvg] = useState('');

  useEffect(() => {
    if (!inOfficeDialog) return;
    Office.context.ui.addHandlerAsync(
      Office.EventType.DialogParentMessageReceived,
      (arg) => {
        const message = JSON.parse(arg.message) as HostToDialogMessage;
        if (message.type === 'load') setInitialKet(message.ket);
      },
      () => sendToHost({ type: 'ready' }),
    );
  }, [inOfficeDialog]);

  useEffect(() => {
    if (!ketcher || !initialKet) return;
    void ketcher.setMolecule(initialKet);
  }, [ketcher, initialKet]);

  const onInsert = async () => {
    if (!ketcher) return;
    setBusy(true);
    setError('');
    try {
      const payload = await exportStructure(ketcher);
      if (inOfficeDialog) {
        sendToHost({ type: 'insert', ...payload });
      } else {
        setPreviewSvg(payload.svg);
      }
    } catch (exportError) {
      setError((exportError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onCancel = () => {
    if (inOfficeDialog) sendToHost({ type: 'cancel' });
    else setPreviewSvg('');
  };

  return (
    <div className="editor-page">
      <header className="editor-bar">
        <span className="editor-title">Ketcher</span>
        {error && (
          <span className="editor-error" role="alert">
            {error}
          </span>
        )}
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          disabled={!ketcher || busy}
          onClick={onInsert}
          data-testid="insert-into-slide"
        >
          {busy ? 'Exporting…' : 'Insert into slide'}
        </button>
      </header>
      <div className="editor-canvas">
        <Editor
          staticResourcesUrl={import.meta.env.BASE_URL}
          structServiceProvider={structServiceProvider}
          disableMacromoleculesEditor
          errorHandler={(message) => setError(String(message))}
          onInit={(instance: Ketcher) => {
            window.ketcher = instance;
            setKetcher(instance);
          }}
        />
      </div>
      {previewSvg && (
        <aside className="editor-preview" data-testid="slide-preview">
          <p>Outside PowerPoint: this picture would go on the slide.</p>
          <img
            alt="Structure preview"
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(previewSvg)}`}
          />
        </aside>
      )}
    </div>
  );
}
