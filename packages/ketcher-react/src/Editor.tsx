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
  KETCHER_INIT_EVENT_NAME,
  KETCHER_ROOT_NODE_CLASS_NAME,
} from './constants';
import { createRoot } from 'react-dom/client';

const mediaSizes = {
  smallWidth: 1040,
  smallHeight: 600,
};

interface EditorProps extends Omit<Config, 'element' | 'appRoot'> {
  onInit?: (ketcher: Ketcher) => void;
}

function Editor(props: EditorProps) {
  const rootElRef = useRef<HTMLDivElement>(null);
  const { onInit } = props;
  const { height, width } = useResizeObserver<HTMLDivElement>({
    ref: rootElRef,
  });
  const ketcherInitEvent = new Event(KETCHER_INIT_EVENT_NAME);

  useEffect(() => {
    const appRoot = createRoot(rootElRef.current as HTMLDivElement);
    init({
      ...props,
      element: rootElRef.current,
      appRoot,
    }).then((ketcher: Ketcher | undefined) => {
      if (typeof onInit === 'function' && ketcher) {
        onInit(ketcher);
        window.dispatchEvent(ketcherInitEvent);
      }
    });
    return () => {
      // setTimeout is used to disable the warn msg from react "Attempted to synchronously unmount a root while React was already rendering"
      setTimeout(() => {
        appRoot.unmount();
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
