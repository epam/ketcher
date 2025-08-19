'use client';

import { StandaloneStructServiceProvider as StandaloneStructServiceProviderType } from 'ketcher-standalone';
import { Editor } from 'ketcher-react';

import 'ketcher-react/dist/index.css';

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

const StandaloneStructServiceProvider =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        window.ketcher = ketcher;
        safePostMessage({
          eventType: 'init',
        });
      }}
    />
  );
}
