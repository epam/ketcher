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

import {
  type CSSProperties,
  type RefObject,
  useLayoutEffect,
  useState,
} from 'react';
import { KETCHER_ROOT_NODE_CSS_SELECTOR } from 'src/constants';

type HookParams = [
  RefObject<HTMLDivElement | null>,
  boolean,
  boolean?,
  string?,
];

function usePortalStyle([
  ref,
  isOpen,
  isTop,
  rootElementSelector,
]: HookParams): [CSSProperties] {
  const [portalStyle, setPortalStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler -- false positive: this measures DOM layout after mount/open, it isn't an event handler that belongs in the parent
    if (!ref.current) {
      return;
    }

    const editorRect = document
      .querySelector(rootElementSelector ?? KETCHER_ROOT_NODE_CSS_SELECTOR)
      ?.getBoundingClientRect() ?? { top: 0, left: 0 };
    const menuItemRect = ref.current.getBoundingClientRect();

    const spaceBetween = 4;
    const alignmentOffset = 2;
    const top =
      menuItemRect.top -
      editorRect.top +
      (isTop ? spaceBetween + menuItemRect.height : 0) -
      (isTop ? 0 : alignmentOffset);
    const left =
      menuItemRect.left -
      editorRect.left +
      (isTop ? 0 : spaceBetween + menuItemRect.width) -
      (isTop ? alignmentOffset : 0);

    // eslint-disable-next-line react-you-might-not-need-an-effect/no-derived-state -- false positive: portalStyle depends on DOM measurements only available after layout, it can't be computed synchronously during render
    setPortalStyle({ top: `${top}px`, left: `${left}px` });
  }, [ref, isOpen, isTop, rootElementSelector]);

  return [portalStyle];
}

export { usePortalStyle };
