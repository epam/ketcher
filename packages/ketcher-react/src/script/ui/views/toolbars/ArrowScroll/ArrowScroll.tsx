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

import classes from './ArrowScroll.module.less';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useRequestAnimationFrame } from '../../../../../hooks';

interface ArrowScrollProps {
  startInView: boolean;
  endInView: boolean;
  scrollForward: (dtMs: number) => void;
  scrollBack: (dtMs: number) => void;
  isLeftRight?: boolean;
}

const ArrowScroll = ({
  startInView,
  endInView,
  scrollForward,
  scrollBack,
  isLeftRight,
}: ArrowScrollProps) => {
  const [isScrollDown, setIsScrollDown] = useState(false);
  const [isScrollUp, setIsScrollUp] = useState(false);
  useRequestAnimationFrame(isScrollDown, (dt) => scrollForward(dt));
  useRequestAnimationFrame(isScrollUp, (dt) => scrollBack(dt));

  useEffect(() => {
    return () => {
      setIsScrollUp(false);
    };
  }, [startInView]);

  useEffect(() => {
    return () => {
      setIsScrollDown(false);
    };
  }, [endInView]);

  return (
    <div
      className={clsx(
        classes.scroll,
        isLeftRight ? classes.leftRight : classes.upDown,
      )}
    >
      {endInView ? (
        <></>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            scrollForward(100);
          }}
          onMouseUp={() => setIsScrollDown(false)}
          onMouseDown={() => setIsScrollDown(true)}
          className={clsx(
            classes.button,
            isLeftRight ? classes.right : classes.down,
          )}
          data-testid="arrow-scroll-right-button"
        >
          {isLeftRight ? '►' : '▼'}
        </button>
      )}
      {startInView ? (
        <></>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            scrollBack(100);
          }}
          onMouseUp={() => setIsScrollUp(false)}
          onMouseDown={() => setIsScrollUp(true)}
          className={clsx(
            classes.button,
            isLeftRight ? classes.left : classes.up,
          )}
          data-testid="arrow-scroll-left-button"
        >
          {isLeftRight ? '◄' : '▲'}
        </button>
      )}
    </div>
  );
};

export { ArrowScroll };
