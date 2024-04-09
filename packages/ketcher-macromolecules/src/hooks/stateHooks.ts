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
import { LayoutMode, SequenceMode } from 'ketcher-core';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useLayoutMode() {
  const editor = useAppSelector(selectEditor);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('flex-layout-mode');

  const onLayoutModeChange = useCallback(
    (newLayoutMode: LayoutMode) => {
      setLayoutMode(newLayoutMode);
    },
    [setLayoutMode],
  );
  useEffect(() => {
    editor?.events.layoutModeChange.add(onLayoutModeChange);

    return () => {
      editor?.events.layoutModeChange.remove(onLayoutModeChange);
    };
  }, [onLayoutModeChange, editor?.events.layoutModeChange]);

  return layoutMode;
}

export function useSequenceEditInRNABuilderMode() {
  const editor = useAppSelector(selectEditor);
  const isSequenceEditInRNABuilderModeInitial =
    editor?.mode instanceof SequenceMode && editor?.mode.isEditInRNABuilderMode;
  const [isSequenceEditInRNABuilderMode, setIsSequenceEditInRNABuilderMode] =
    useState<boolean>(isSequenceEditInRNABuilderModeInitial);

  const onSequenceEditInRNABuilderModeChange = (value: boolean) => {
    setIsSequenceEditInRNABuilderMode(value);
  };

  useEffect(() => {
    editor?.events.toggleSequenceEditInRNABuilderMode.add(
      onSequenceEditInRNABuilderModeChange,
    );

    return () => {
      editor?.events.toggleSequenceEditInRNABuilderMode.remove(
        onSequenceEditInRNABuilderModeChange,
      );
    };
  }, [
    onSequenceEditInRNABuilderModeChange,
    editor?.events.toggleSequenceEditInRNABuilderMode,
  ]);

  return isSequenceEditInRNABuilderMode;
}
