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
    renderOptions,
    onSelect,
    onDelete,
    onAttach,
  }) => {
    return (
      <div
        role="button"
        tabIndex={0}
        className={
          !isSelected ? classes.td : `${classes.td} ${classes.selected}`
        }
        title={greekify(getTemplateTitle(tmpl, index))}
        key={
          !isSelected
            ? `${tmpl.struct.name}_${index}`
            : `${tmpl.struct.name}_${index}_selected`
        }
        onClick={() => onSelect(tmpl)}
        onKeyDown={createKeyDownHandler(() => onSelect(tmpl))}
      >
        <MemoizedStructRender
          testId={tmpl.struct.name}
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
        <div
          className={`${classes.structTitle} ${
            isSelected ? classes.selectedTitle : ''
          }`}
        >
          {greekify(tmplName(tmpl, index))}
        </div>
        {tmpl.props.group === 'User Templates' && (
          <button
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

  // Progressive rendering: only render first batch initially,
  // then render remaining items in idle time to avoid blocking main thread
  const BATCH_SIZE = 8; // Render 8 items per frame (~65-75ms for first batch, then rest progressively)
  const [renderedCount, setRenderedCount] = useState(
    Math.min(BATCH_SIZE, templates.length),
  );
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
    if (renderedCount >= templates.length) {
      return;
    }

    // Use requestIdleCallback if available for non-blocking rendering
    // Otherwise fall back to setTimeout
    if ('requestIdleCallback' in window) {
      const callback = window.requestIdleCallback?.(
        () => {
          setRenderedCount((prev) =>
            Math.min(prev + BATCH_SIZE, templates.length),
          );
        },
        { timeout: 500 }, // Force render after 500ms even if main thread is busy
      );
      return () => {
        if (callback) window.cancelIdleCallback?.(callback);
      };
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeoutId = setTimeout(() => {
        setRenderedCount((prev) =>
          Math.min(prev + BATCH_SIZE, templates.length),
        );
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [renderedCount, templates.length]);

  const visibleTemplates = templates.slice(0, renderedCount);

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
      {visibleTemplates.map((tmpl, i) => (
        <TemplateItem
          key={`${tmpl.struct.name}_${i}_${
            selected?.struct === tmpl.struct ? 'selected' : 'unselected'
          }`}
          tmpl={tmpl}
          index={i}
          isSelected={selected?.struct === tmpl.struct}
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
