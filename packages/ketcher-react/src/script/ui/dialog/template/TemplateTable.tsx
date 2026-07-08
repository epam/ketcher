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
  type KeyboardEvent,
  memo,
  useState,
  useEffect,
  useRef,
  useTransition,
} from 'react';
import type { Struct } from 'ketcher-core';
import classes from './TemplateTable.module.less';
import { greekify } from '../../utils';
import { Icon, MemoizedStructRender } from 'components';

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
  templates: Array<Template>;
  selected: Template | null;
  onSelect: (tmpl: Template) => void;
  onDelete?: (tmpl: Template) => void;
  onAttach?: (tmpl: Template) => void;
  titleRows?: 1 | 2;
  renderOptions?: any;
}

const isSaltOrSolventTemplate = (template) =>
  template.props.group === 'Salts and Solvents';
const isFunctionalGroupTemplate = (template) =>
  template.props.group === 'Functional Groups';

function getTemplateTitle(template: Template, index: number): string {
  if (isSaltOrSolventTemplate(template)) {
    return template.props.name;
  }
  return (
    template.struct.name || `${template.props.group} template ${index + 1}`
  );
}

function tmplName(tmpl: Template, i: number): string {
  if (isSaltOrSolventTemplate(tmpl)) {
    return tmpl.props.abbreviation ?? '';
  }
  return (
    tmpl.props.abbreviation ??
    tmpl.struct.name ??
    `${tmpl.props.group} template ${i + 1}`
  );
}

function createKeyDownHandler(callback: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      callback();
    }
  };
}

/**
 * Memoized individual template item component
 * Prevents unnecessary re-renders when parent selection changes
 */
interface TemplateItemProps {
  tmpl: Template;
  index: number;
  isSelected: boolean;
  shouldRenderPreview: boolean;
  renderOptions?: any;
  onSelect: (tmpl: Template) => void;
  onDelete?: (tmpl: Template) => void;
  onAttach?: (tmpl: Template) => void;
}

const TemplateItem: FC<TemplateItemProps> = memo(
  ({
    tmpl,
    index,
    isSelected,
    shouldRenderPreview,
    renderOptions,
    onSelect,
    onDelete,
    onAttach,
  }) => {
    return (
      <div
        className={
          !isSelected ? classes.td : `${classes.td} ${classes.selected}`
        }
      >
        <button
          type="button"
          data-testid={tmpl.struct.name}
          className={classes.selectButton}
          title={greekify(getTemplateTitle(tmpl, index))}
          onClick={() => onSelect(tmpl)}
        >
          <div className={classes.structSlot}>
            {!shouldRenderPreview && (
              <div className={classes.structPlaceholder} />
            )}
            {shouldRenderPreview && (
              <div className={`${classes.structFade} ${classes.structVisible}`}>
                <MemoizedStructRender
                  struct={tmpl.struct}
                  className={classes.struct}
                  fullsize={true}
                  options={{
                    ...renderOptions,
                    autoScaleMargin: 10,
                    cachePrefix: 'templates',
                    downScale: true,
                  }}
                />
              </div>
            )}
          </div>
          <div
            className={`${classes.structTitle} ${
              isSelected ? classes.selectedTitle : ''
            }`}
          >
            {greekify(tmplName(tmpl, index))}
          </div>
        </button>
        {tmpl.props.group === 'User Templates' && (
          <button
            type="button"
            data-testid={'delete-template-button'}
            className={`${classes.button} ${classes.deleteButton}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(tmpl);
            }}
            onKeyDown={createKeyDownHandler(() => onDelete?.(tmpl))}
          >
            <Icon name="delete" />
          </button>
        )}
        {!isFunctionalGroupTemplate(tmpl) && !isSaltOrSolventTemplate(tmpl) && (
          <button
            type="button"
            data-testid={'edit-template-button'}
            className={`${classes.button} ${classes.editButton}`}
            onClick={(e) => {
              e.stopPropagation();
              onAttach?.(tmpl);
            }}
            onKeyDown={createKeyDownHandler(() => onAttach?.(tmpl))}
          >
            <Icon name="edit" />
          </button>
        )}
      </div>
    );
  },
  // Custom comparison: only re-render if these specific props change
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.shouldRenderPreview === nextProps.shouldRenderPreview &&
      prevProps.tmpl === nextProps.tmpl &&
      prevProps.index === nextProps.index &&
      prevProps.renderOptions === nextProps.renderOptions &&
      prevProps.onSelect === nextProps.onSelect &&
      prevProps.onDelete === nextProps.onDelete &&
      prevProps.onAttach === nextProps.onAttach
    );
  },
);

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

  // Render all tiles immediately to keep accordion height stable,
  // then progressively mount heavy SVG previews with low-priority updates.
  const INITIAL_PREVIEW_COUNT = 4;
  const PREVIEW_BATCH_SIZE = 4;
  const [previewRenderedCount, setPreviewRenderedCount] = useState(
    Math.min(INITIAL_PREVIEW_COUNT, templates.length),
  );
  const [, startTransition] = useTransition();
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate container size once to avoid getBoundingClientRect() calls during rendering
  // This prevents forced reflows when rendering multiple items in a batch
  useEffect(() => {
    if (!containerRef.current) return;

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
    setPreviewRenderedCount(Math.min(INITIAL_PREVIEW_COUNT, templates.length));
  }, [templates]);

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
      className={`${classes.tableContent} ${
        titleRows === 1 ? classes.oneRowTitleTable : classes.twoRowsTitleTable
      }`}
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
