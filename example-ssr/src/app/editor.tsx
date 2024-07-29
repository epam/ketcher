'use client';

import 'ketcher-react/dist/index.css';

import { StandaloneStructServiceProvider as StandaloneStructServiceProviderType } from 'ketcher-standalone';

import { Editor } from 'ketcher-react';

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

        window.parent.postMessage(
          {
            eventType: 'init',
          },
          '*',
        );
      }}
    />
  );
}
