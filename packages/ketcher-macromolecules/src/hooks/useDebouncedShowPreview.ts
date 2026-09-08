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

import { useCallback, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch } from './stateHooks';
import { showPreview as showPreviewAction } from 'state/common';
import type { EditorStatePreview } from 'state';

export const useDebouncedShowPreview = () => {
  const dispatch = useAppDispatch();

  const showPreview = useMemo(
    () =>
      debounce(
        (payload: EditorStatePreview | undefined) =>
          dispatch(showPreviewAction(payload)),
        500,
      ),
    [dispatch],
  );

  const closePreview = useCallback(() => {
    showPreview.cancel();
    dispatch(showPreviewAction(undefined));
  }, [showPreview, dispatch]);

  useEffect(() => () => showPreview.cancel(), [showPreview]);

  return { showPreview, closePreview };
};
