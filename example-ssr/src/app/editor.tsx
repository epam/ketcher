'use client';

import { StandaloneStructServiceProvider as StandaloneStructServiceProviderType } from 'ketcher-standalone';
import { Editor } from 'ketcher-react';

import 'ketcher-react/dist/index.css';

const safePostMessage = (
  message: Record<string, unknown>,
  fallbackOrigin: string = globalThis.location.origin,
): void => {
  if (globalThis.parent === globalThis) return;

  let parentOrigin = fallbackOrigin;
  try {
    parentOrigin = globalThis.parent.location.origin || fallbackOrigin;
  } catch {}

  if (
    !parentOrigin ||
    parentOrigin === 'null' ||
    parentOrigin === 'undefined'
  ) {
    parentOrigin = fallbackOrigin;
  }

  globalThis.parent.postMessage(message, parentOrigin);
};

const StandaloneStructServiceProvider =
  StandaloneStructServiceProviderType as unknown as new () => any;

const structServiceProvider = new StandaloneStructServiceProvider();

export function EditorComponent() {
  return (
    <Editor
      staticResourcesUrl={process.env.PUBLIC_URL || ''}
      structServiceProvider={structServiceProvider}
      errorHandler={(message: string) => {
        console.error(message);
      }}
      onInit={(ketcher) => {
        globalThis.ketcher = ketcher;
        safePostMessage({
          eventType: 'init',
        });
      }}
    />
  );
}
