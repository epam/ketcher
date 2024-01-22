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

import { useCallback, useEffect, useState } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'state';
import { selectEditor } from 'state/common';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useSnakeMode() {
  const editor = useAppSelector(selectEditor);
  const [snakeMode, setSnakeMode] = useState(false);

  const onSnakeModeChange = useCallback(
    (newSnakeMode: boolean) => {
      setSnakeMode(newSnakeMode);
    },
    [setSnakeMode],
  );
  useEffect(() => {
    editor?.events.snakeModeChange.add(onSnakeModeChange);

    return () => {
      editor?.events.snakeModeChange.remove(onSnakeModeChange);
    };
  }, [onSnakeModeChange, editor?.events.snakeModeChange]);

  return snakeMode;
}
