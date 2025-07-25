/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import 'intersection-observer';
import 'element-closest-polyfill';
import 'regenerator-runtime/runtime';
import 'url-search-params-polyfill';
import 'whatwg-fetch';
import './index.less';

import init, { Config } from './script';
import { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { Ketcher, StructService } from 'ketcher-core';
import classes from './Editor.module.less';
import clsx from 'clsx';
import { useResizeObserver } from './hooks';
import {
  ketcherInitEventName,
  KETCHER_ROOT_NODE_CLASS_NAME,
} from './constants';
import { KetcherBuilder } from './script/builders';

const mediaSizes = {
  smallWidth: 1040,
  smallHeight: 600,
};

export interface EditorProps extends Omit<Config, 'element' | 'appRoot'> {
  onInit?: (ketcher: Ketcher) => void;
  onSetKetcherId?: (ketcherId: string) => void;
}

function MicromoleculesEditor(props: EditorProps) {
  const initPromiseRef = useRef<ReturnType<typeof init> | null>(null);
  const appRootRef = useRef<Root | null>(null);
  const cleanupRef = useRef<(() => unknown) | null>(null);
  const ketcherBuilderRef = useRef<KetcherBuilder | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const setServerRef = useRef<(structService: StructService) => void>(() => {});
  const structServiceProvider = props.structServiceProvider;

  const rootElRef = useRef<HTMLDivElement>(null);

  const { height, width } = useResizeObserver<HTMLDivElement>({
    ref: rootElRef,
  });

  useEffect(() => {
    if (!props.ketcherId) {
      return;
    }
    ketcherBuilderRef.current?.reinitializeApi(
      props.ketcherId,
      props.structServiceProvider,
      setServerRef.current,
    );
  }, [structServiceProvider]);

  const initKetcher = async () => {
    appRootRef.current = createRoot(rootElRef.current as HTMLDivElement);

    initPromiseRef.current = init({
      ...props,
      element: rootElRef.current,
      appRoot: appRootRef.current,
    });

    initPromiseRef.current?.then(({ ketcher, cleanup, builder, setServer }) => {
      cleanupRef.current = cleanup;
      ketcherBuilderRef.current = builder;
      setServerRef.current = setServer;
      props.onSetKetcherId?.(ketcher.id);

      if (typeof props.onInit === 'function' && ketcher) {
        props.onInit(ketcher);
        const ketcherInitEvent = new Event(ketcherInitEventName(ketcher.id));
        window.dispatchEvent(ketcherInitEvent);
      }
    });
  };
  useEffect(() => {
    if (initPromiseRef.current === null) {
      initKetcher();
    } else {
      initPromiseRef.current?.finally(() => {
        initKetcher();
      });
    }

    return () => {
      initPromiseRef.current?.then(() => {
        cleanupRef.current?.();
        appRootRef.current?.unmount();
      });
    };
    // TODO: provide the list of dependencies after implementing unsubscribe function
  }, []);

  return (
    <div
      ref={rootElRef}
      className={clsx(KETCHER_ROOT_NODE_CLASS_NAME, classes.editor, {
        [classes.small]:
          (height && height <= mediaSizes.smallHeight) ||
          (width && width <= mediaSizes.smallWidth),
      })}
    />
  );
}

export { MicromoleculesEditor };
