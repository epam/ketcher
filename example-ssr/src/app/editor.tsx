'use client';

import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import type { Editor } from 'ketcher-react';

type EditorState = {
  Editor: typeof Editor;
  structServiceProvider: ComponentProps<typeof Editor>['structServiceProvider'];
};

const safePostMessage = (
  message: Record<string, unknown>,
  fallbackOrigin: string = window.location.origin,
): void => {
  if (window.parent === window) return;

  let parentOrigin = fallbackOrigin;
  try {
    parentOrigin = window.parent.location.origin || fallbackOrigin;
  } catch {}

  if (
    !parentOrigin ||
    parentOrigin === 'null' ||
    parentOrigin === 'undefined'
  ) {
    parentOrigin = fallbackOrigin;
  }

  window.parent.postMessage(message, parentOrigin);
};

export function EditorComponent() {
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([import('ketcher-react'), import('ketcher-standalone')])
      .then(([{ Editor }, { StandaloneStructServiceProvider }]) => {
        if (!isMounted) return;

        setEditorState({
          Editor,
          structServiceProvider: new StandaloneStructServiceProvider(),
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!editorState) return null;

  const { Editor, structServiceProvider } = editorState;

  return (
    <Editor
      staticResourcesUrl={process.env.PUBLIC_URL || ''}
      structServiceProvider={structServiceProvider}
      errorHandler={(message: string) => {
        console.error(message);
      }}
      onInit={(ketcher) => {
        window.ketcher = ketcher;
        safePostMessage({
          eventType: 'init',
        });
      }}
    />
  );
}
