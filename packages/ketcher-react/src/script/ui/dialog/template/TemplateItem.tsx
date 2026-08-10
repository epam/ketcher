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

import { type FC, type KeyboardEvent, memo } from 'react';
import clsx from 'clsx';
import classes from './TemplateTable.module.less';
import { greekify } from '../../utils';
import {
  Icon,
  MemoizedStructRender,
  type IStructRenderProps,
} from 'components';
import type { Template } from './TemplateTable';

const isSaltOrSolventTemplate = (template: Template) =>
  template.props.group === 'Salts and Solvents';

const isFunctionalGroupTemplate = (template: Template) =>
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
export interface TemplateItemProps {
  tmpl: Template;
  index: number;
  isSelected: boolean;
  shouldRenderPreview: boolean;
  renderOptions?: IStructRenderProps['options'];
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
      <div className={clsx(classes.td, { [classes.selected]: isSelected })}>
        <button
          type="button"
          data-testid={tmpl.struct.name}
          className={classes.selectButton}
          title={greekify(getTemplateTitle(tmpl, index))}
          onClick={() => onSelect(tmpl)}
        >
          <div className={classes.structSlot}>
            {shouldRenderPreview ? (
              <div className={clsx(classes.structFade, classes.structVisible)}>
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
            ) : (
              <div className={classes.structPlaceholder} />
            )}
          </div>
          <div
            className={clsx(classes.structTitle, {
              [classes.selectedTitle]: isSelected,
            })}
          >
            {greekify(tmplName(tmpl, index))}
          </div>
        </button>
        {tmpl.props.group === 'User Templates' && (
          <button
            type="button"
            data-testid="delete-template-button"
            className={clsx(classes.button, classes.deleteButton)}
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
            data-testid="edit-template-button"
            className={clsx(classes.button, classes.editButton)}
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
      prevProps.renderOptions === nextProps.renderOptions &&
      prevProps.onSelect === nextProps.onSelect &&
      prevProps.onDelete === nextProps.onDelete &&
      prevProps.onAttach === nextProps.onAttach
    );
  },
);

export default TemplateItem;
