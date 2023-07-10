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
  scrollUp: any;
  scrollDown: any;
}

const ArrowScroll = ({
  startInView,
  endInView,
  scrollUp,
  scrollDown,
}: ArrowScrollProps) => {
  const [isScrollDown, setScrollDown] = useState(false);
  const [isScrollUp, setScrollUp] = useState(false);
  useInterval(scrollDown, isScrollDown ? 100 : null);
  useInterval(scrollUp, isScrollUp ? 100 : null);

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
    <div className={classes.scroll}>
      {endInView ? (
        <></>
      ) : (
        <button
          onClick={() => scrollDown()}
          onMouseUp={() => setScrollDown(false)}
          onMouseDown={() => setScrollDown(true)}
          className={clsx(classes.button, classes.down)}
        >
          ▼
        </button>
      )}
      {startInView ? (
        <></>
      ) : (
        <button
          onClick={() => scrollUp()}
          onMouseUp={() => setScrollUp(false)}
          onMouseDown={() => setScrollUp(true)}
          className={clsx(classes.button, classes.up)}
        >
          ▲
        </button>
      )}
    </div>
  );
};

export { ArrowScroll };
