'use client';

import { useEffect, useState } from 'react';

import type { StructServiceProvider } from 'ketcher-core';
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

export function EditorComponent() {
  const [structServiceProvider, setStructServiceProvider] =
    useState<StructServiceProvider | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    void import('ketcher-standalone').then(
      ({
        StandaloneStructServiceProvider: StandaloneStructServiceProviderType,
      }) => {
        if (!isSubscribed) {
          return;
        }

        const StandaloneStructServiceProvider =
          StandaloneStructServiceProviderType as unknown as new () => any;

        setStructServiceProvider(new StandaloneStructServiceProvider());
      },
    );

    return () => {
      isSubscribed = false;
    };
  }, []);

  if (!structServiceProvider) {
    return null;
  }

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
