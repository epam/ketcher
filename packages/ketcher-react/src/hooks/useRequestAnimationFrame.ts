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

import { useEffect, useRef } from 'react';

export const useRequestAnimationFrame = (
  isActive: boolean,
  onFrame: (deltaTimeInMilliseconds: number) => void,
) => {
  const callbackReference = useRef(onFrame);
  useEffect(() => {
    callbackReference.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!isActive) return;

    let requestAnimationFrameId = 0;
    let previousTime = performance.now();

    const loop = (now: number) => {
      const dt = now - previousTime;
      previousTime = now;
      callbackReference.current(dt);
      requestAnimationFrameId = requestAnimationFrame(loop);
    };

    requestAnimationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestAnimationFrameId);
  }, [isActive]);
};
