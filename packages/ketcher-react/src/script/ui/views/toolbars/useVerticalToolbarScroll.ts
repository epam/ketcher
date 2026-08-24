/****************************************************************************
 * Copyright 2026 EPAM Systems
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

import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { useResizeObserver } from '../../../../hooks';

const useVerticalToolbarScroll = () => {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [startRef, startInView] = useInView({ threshold: 1 });
  const [endRef, endInView] = useInView({ threshold: 1 });
  const { ref: scrollStepRef, height: scrollStep } =
    useResizeObserver<HTMLDivElement>();

  const scrollBack = () => {
    if (!scrollElement || !scrollStep) {
      return;
    }

    scrollElement.scrollBy({ top: -scrollStep });
  };

  const scrollForward = () => {
    if (!scrollElement || !scrollStep) {
      return;
    }

    scrollElement.scrollBy({ top: scrollStep });
  };

  return {
    scrollContainerRef: setScrollElement,
    scrollStepRef,
    startRef,
    endRef,
    startInView,
    endInView,
    isOverflowing: !startInView || !endInView,
    scrollBack,
    scrollForward,
  };
};

export { useVerticalToolbarScroll };
