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

import { RefCallback, RefObject, useMemo, useState } from 'react';

import { throttle } from 'lodash';
import useResizeObserver from 'use-resize-observer/polyfilled';

const throttleMilliseconds = 100;

type Size = {
  width: number | undefined;
  height: number | undefined;
};

type Options<THTMLElement extends HTMLElement> = {
  ref?: RefObject<THTMLElement> | THTMLElement | null | undefined;
};

type HookResponse<THTMLElement extends HTMLElement> = {
  ref: RefCallback<THTMLElement>;
  width: number | undefined;
  height: number | undefined;
};

function useThrottleResizeObserver<THTMLElement extends HTMLElement>(
  options: Options<THTMLElement> = {}
): HookResponse<THTMLElement> {
  const [size, setSize] = useState<Size>({
    height: undefined,
    width: undefined,
  });

  const onResize = useMemo(() => throttle(setSize, throttleMilliseconds), []);

  const { ref } = useResizeObserver<THTMLElement>({ onResize, ...options });
  return { ref, ...size };
}

export { useThrottleResizeObserver as useResizeObserver };
