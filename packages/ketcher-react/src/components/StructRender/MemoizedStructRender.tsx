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

import { memo } from 'react';
import StructRender from './StructRender';

/**
 * Memoized version of StructRender that prevents unnecessary re-renders
 * when parent component re-renders but struct/options haven't changed.
 *
 * Performance improvement:
 * - Prevents redundant Raphael rendering operations
 * - Leverages built-in RenderStruct cache more effectively
 * - Critical for list-based layouts (templates, search results)
 *
 * In TemplateTable with 21 items:
 * - Without memo: All 21 items re-render on any parent state change (selection, hover, etc.)
 * - With memo: Only items whose props changed actually re-render
 * - Expected improvement: 95%+ faster on subsequent interactions after initial load
 */
const MemoizedStructRender = memo(
  StructRender,
  (previousProperties, nextProperties) => {
    // Return true if props are equal (skip re-render)
    // Return false if props differ (perform re-render)

    const structsEqual = previousProperties.struct === nextProperties.struct;
    const optionsEqual =
      JSON.stringify(previousProperties.options) ===
      JSON.stringify(nextProperties.options);
    const otherPropertiesEqual =
      previousProperties.className === nextProperties.className &&
      previousProperties.fullsize === nextProperties.fullsize &&
      previousProperties.update === nextProperties.update &&
      previousProperties.testId === nextProperties.testId;

    // Props are equal, skip re-render
    if (structsEqual && optionsEqual && otherPropertiesEqual) {
      return true;
    }

    // Props differ, perform re-render
    return false;
  },
);

MemoizedStructRender.displayName = 'MemoizedStructRender';

export default MemoizedStructRender;
