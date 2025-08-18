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
import { useInterval } from '../../../../../hooks';

interface ArrowScrollProps {
  startInView: boolean;
  endInView: boolean;
  scrollForward: any;
  scrollBack: any;
  isLeftRight?: boolean;
}

const ArrowScroll = ({
  startInView,
  endInView,
  scrollForward,
  scrollBack,
  isLeftRight,
}: ArrowScrollProps) => {
  const [isScrollDown, setScrollDown] = useState(false);
  const [isScrollUp, setScrollUp] = useState(false);
  useInterval(scrollBack, isScrollDown ? 100 : null);
  useInterval(scrollForward, isScrollUp ? 100 : null);

  useEffect(() => {
    return () => {
      setScrollUp(false);
    };
  }, [startInView]);

  useEffect(() => {
    return () => {
      setScrollDown(false);
    };
  }, [endInView]);

  return (
    <div
      className={[
        classes.scroll,
        isLeftRight ? classes.leftRight : classes.upDown,
      ].join(' ')}
    >
      {endInView ? (
        <></>
      ) : (
        <button
          onClick={scrollForward}
          onMouseUp={() => setScrollDown(false)}
          onMouseDown={() => setScrollDown(true)}
          className={clsx(
            classes.button,
            isLeftRight ? classes.right : classes.down,
          )}
        >
          {isLeftRight ? '►' : '▼'}
        </button>
      )}
      {startInView ? (
        <></>
      ) : (
        <button
          onClick={scrollBack}
          onMouseUp={() => setScrollUp(false)}
          onMouseDown={() => setScrollUp(true)}
          className={clsx(
            classes.button,
            isLeftRight ? classes.left : classes.up,
          )}
        >
          {isLeftRight ? '◄' : '▲'}
        </button>
      )}
    </div>
  );
};

export { ArrowScroll };
