/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import * as editorStyles from './index.less';

import init, { type Config } from './script';
import { type RefObject, useCallback, useEffect, useRef } from 'react';
import { type Root, createRoot } from 'react-dom/client';

import type { Ketcher } from 'ketcher-core';
import classes from './Editor.module.less';
import clsx from 'clsx';
import { useResizeObserver } from './hooks';
import type { Api } from './script/api';
import {
  ketcherInitEventName,
  KETCHER_ROOT_NODE_CLASS_NAME,
} from './constants';
import type { KetcherBuilder } from './script/builders';

// Bind the Less import so it stays in JS but is erased from declarations.
void editorStyles;

const mediaSizes = {
  smallWidth: 1040,
  smallHeight: 600,
};

export interface EditorProperties extends Omit<Config, 'element' | 'appRoot'> {
  onInit?: (ketcher: Ketcher) => void;
  onSetKetcherId?: (ketcherId: string) => void;
}

function MicromoleculesEditor(properties: Readonly<EditorProperties>) {
  const initPromiseReference = useRef<ReturnType<typeof init> | null>(null);
  const appRootReference = useRef<Root | null>(null);
  const cleanupReference = useRef<(() => unknown) | null>(null);
  const ketcherBuilderReference = useRef<KetcherBuilder | null>(null);
  const ketcherReference = useRef<Ketcher | null>(null);

  const setServerReference = useRef<(structService: Api) => void>(() => {});
  const structServiceProvider = properties.structServiceProvider;

  const rootElementReference = useRef<HTMLDivElement>(null);

  const { height, width } = useResizeObserver<HTMLDivElement>({
    ref: rootElementReference as RefObject<HTMLDivElement>,
  });

  useEffect(() => {
    const ketcherId = ketcherReference.current?.id;

    if (!ketcherId) {
      return;
    }

    ketcherBuilderReference.current?.reinitializeApi(
      ketcherId,
      structServiceProvider,
      setServerReference.current,
    );
  }, [structServiceProvider]);

  // Editor is initialized once on mount with the props of the first render
  const initialPropertiesReference = useRef(properties);

  const initKetcher = useCallback(async () => {
    const initialProperties = initialPropertiesReference.current;
    appRootReference.current = createRoot(
      rootElementReference.current as HTMLDivElement,
    );

    initPromiseReference.current = init({
      ...initialProperties,
      element: rootElementReference.current,
      appRoot: appRootReference.current,
    });

    const initPromise = initPromiseReference.current;
    if (initPromise) {
      void (async () => {
        const { ketcher, cleanup, builder, setServer } = await initPromise;
        cleanupReference.current = cleanup;
        ketcherBuilderReference.current = builder;
        ketcherReference.current = ketcher;
        setServerReference.current = setServer;
        initialProperties.onSetKetcherId?.(ketcher.id);

        if (ketcher && typeof initialProperties.onInit === 'function') {
          initialProperties.onInit(ketcher);
          const ketcherInitEvent = new Event(ketcherInitEventName(ketcher.id));
          globalThis.dispatchEvent(ketcherInitEvent);
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (initPromiseReference.current === null) {
      initKetcher();
    } else {
      const initPromise = initPromiseReference.current;
      void (async () => {
        try {
          await initPromise;
        } finally {
          initKetcher();
        }
      })();
    }

    return () => {
      const initPromise = initPromiseReference.current;
      if (initPromise) {
        void (async () => {
          await initPromise;
          cleanupReference.current?.();
          appRootReference.current?.unmount();
          ketcherBuilderReference.current?.destroy();
        })();
      }
    };
  }, [initKetcher]);

  return (
    <div
      ref={rootElementReference}
      className={clsx(KETCHER_ROOT_NODE_CLASS_NAME, classes.editor, {
        [classes.small]:
          (height && height <= mediaSizes.smallHeight) ||
          (width && width <= mediaSizes.smallWidth),
      })}
    />
  );
}

export { MicromoleculesEditor };
