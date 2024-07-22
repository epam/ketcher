'use client';

import 'ketcher-react/dist/index.css';

import { StructServiceProvider } from 'ketcher-core';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';

import { Editor } from 'ketcher-react';

const structServiceProvider =
  new StandaloneStructServiceProvider() as StructServiceProvider;

export function EditorComponent() {
  return (
    <Editor
      staticResourcesUrl={process.env.PUBLIC_URL || ''}
      structServiceProvider={structServiceProvider}
      errorHandler={(message: string) => {
        console.error(message);
      }}
      onInit={(ketcher) => {
        if (window) {
          window.ketcher = ketcher;

          window.parent.postMessage(
            {
              eventType: 'init',
            },
            '*',
          );
        }
      }}
    />
  );
}
