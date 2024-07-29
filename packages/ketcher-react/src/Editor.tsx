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

import { Ketcher } from 'ketcher-core';
import classes from './Editor.module.less';
import clsx from 'clsx';
import { useResizeObserver } from './hooks';
import {
  ketcherInitEventName,
  KETCHER_ROOT_NODE_CLASS_NAME,
} from './constants';
import { createRoot, Root } from 'react-dom/client';

const mediaSizes = {
  smallWidth: 1040,
  smallHeight: 600,
};

interface EditorProps extends Omit<Config, 'element' | 'appRoot'> {
  onInit?: (ketcher: Ketcher) => void;
}

function Editor(props: EditorProps) {
  const initPromiseRef = useRef<ReturnType<typeof init> | null>(null);
  const appRootRef = useRef<Root | null>(null);
  const cleanupRef = useRef<(() => unknown) | null>(null);

  const rootElRef = useRef<HTMLDivElement>(null);

  const { height, width } = useResizeObserver<HTMLDivElement>({
    ref: rootElRef,
  });

  const initKetcher = () => {
    appRootRef.current = createRoot(rootElRef.current as HTMLDivElement);

    initPromiseRef.current = init({
      ...props,
      element: rootElRef.current,
      appRoot: appRootRef.current,
    });

    initPromiseRef.current?.then(({ ketcher, ketcherId, cleanup }) => {
      cleanupRef.current = cleanup;

      if (typeof props.onInit === 'function' && ketcher) {
        props.onInit(ketcher);
        const ketcherInitEvent = new Event(ketcherInitEventName(ketcherId));
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

export { Editor };
