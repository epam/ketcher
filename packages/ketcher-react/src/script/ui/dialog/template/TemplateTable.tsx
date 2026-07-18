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
  type FC,
  useState,
  useEffect,
  useRef,
  useTransition,
  useLayoutEffect,
} from 'react';
import type { Struct } from 'ketcher-core';
import clsx from 'clsx';
import classes from './TemplateTable.module.less';
import TemplateItem from './TemplateItem';

export interface Template {
  struct: Struct;
  props: {
    atomid: number;
    bondid: number;
    group: string;
    prerender?: string;
    abbreviation?: string;
    name: string;
  };
}

interface TemplateTableProps {
  templates: ReadonlyArray<Template>;
  selected: Template | null;
  onSelect: (tmpl: Template) => void;
  onDelete?: (tmpl: Template) => void;
  onAttach?: (tmpl: Template) => void;
  titleRows?: 1 | 2;
  renderOptions?: any;
}

// Render all tiles immediately to keep accordion height stable,
// then progressively mount heavy SVG previews with low-priority updates.
const INITIAL_PREVIEW_COUNT = 4;
const PREVIEW_BATCH_SIZE = 4;

const TemplateTable: FC<TemplateTableProps> = (props) => {
  const {
    templates,
    selected,
    onSelect,
    onDelete,
    onAttach,
    titleRows = 2,
    renderOptions,
  } = props;

  const [prevTemplates, setPrevTemplates] = useState(templates);
  const [previewRenderedCount, setPreviewRenderedCount] = useState(() =>
    Math.min(INITIAL_PREVIEW_COUNT, templates.length),
  );
  const [, startTransition] = useTransition();
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (templates !== prevTemplates) {
    setPrevTemplates(templates);
    setPreviewRenderedCount(Math.min(INITIAL_PREVIEW_COUNT, templates.length));
  }

  // Calculate container size once to avoid getBoundingClientRect() calls during rendering
  // This prevents forced reflows when rendering multiple items in a batch
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const calculateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    // Calculate on mount
    calculateSize();

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateSize);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (previewRenderedCount >= templates.length) {
      return;
    }

    // Use idle/frame scheduling for progressive preview hydration.
    const requestIdle = window.requestIdleCallback;
    if (typeof requestIdle === 'function') {
      const callback = requestIdle(
        () => {
          startTransition(() => {
            setPreviewRenderedCount((prev) =>
              Math.min(prev + PREVIEW_BATCH_SIZE, templates.length),
            );
          });
        },
        { timeout: 500 },
      );
      return () => {
        if (callback) window.cancelIdleCallback?.(callback);
      };
    } else {
      const frameId = window.requestAnimationFrame(() => {
        startTransition(() => {
          setPreviewRenderedCount((prev) =>
            Math.min(prev + PREVIEW_BATCH_SIZE, templates.length),
          );
        });
      });
      return () => window.cancelAnimationFrame(frameId);
    }
  }, [previewRenderedCount, templates.length, startTransition]);

  // Pass container size to StructRender to avoid getBoundingClientRect() calls
  // This eliminates forced reflows during rendering batches
  const optimizedRenderOptions = {
    ...renderOptions,
    ...(containerSize && { wrapperDimensions: containerSize }),
  };

  return (
    <div
      className={clsx(classes.tableContent, {
        [classes.oneRowTitleTable]: titleRows === 1,
        [classes.twoRowsTitleTable]: titleRows !== 1,
      })}
      data-testid="templates-modal"
      ref={containerRef}
    >
      {templates.map((tmpl, i) => (
        <TemplateItem
          key={`${tmpl.struct.name}_${i}`}
          tmpl={tmpl}
          index={i}
          isSelected={selected?.struct === tmpl.struct}
          shouldRenderPreview={i < previewRenderedCount}
          renderOptions={optimizedRenderOptions}
          onSelect={onSelect}
          onDelete={onDelete}
          onAttach={onAttach}
        />
      ))}
    </div>
  );
};

export default TemplateTable;
