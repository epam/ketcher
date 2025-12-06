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

import { FC, KeyboardEvent } from 'react';
import { Struct } from 'ketcher-core';
import classes from './TemplateTable.module.less';
import { greekify } from '../../utils';
import { Icon, StructRender } from 'components';

export interface Template {
  struct: Struct;
  props: {
    atomid: number;
    bondid: number;
    group: string;
    prerender?: string;
    abbreviation: string;
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
const is3DTemplate = (template) => template.props.group === '3D Templates';

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
    return tmpl.props.abbreviation;
  }
  if (is3DTemplate(tmpl) && tmpl.props.name?.trim()) {
    return tmpl.props.name;
  }
  return tmpl.struct.name || `${tmpl.props.group} template ${i + 1}`;
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

  return (
    <div
      className={`${classes.tableContent} ${
        titleRows === 1 ? classes.oneRowTitleTable : classes.twoRowsTitleTable
      }`}
      data-testid="templates-modal"
    >
      {templates.map((tmpl, i) => {
        return (
          <button
            type="button"
            className={
              tmpl.struct !== selected?.struct
                ? classes.td
                : `${classes.td} ${classes.selected}`
            }
            title={greekify(getTemplateTitle(tmpl, i))}
            key={
              tmpl.struct.name !== selected?.struct.name
                ? `${tmpl.struct.name}_${i}`
                : `${tmpl.struct.name}_${i}_selected`
            }
            onClick={() => onSelect(tmpl)}
          >
            <StructRender
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
                selected?.struct === tmpl.struct ? classes.selectedTitle : ''
              }`}
            >
              {greekify(tmplName(tmpl, i))}
            </div>
            {tmpl.props.group === 'User Templates' && (
              <span
                role="button"
                tabIndex={0}
                data-testid={'delete-template-button'}
                className={`${classes.button} ${classes.deleteButton}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete!(tmpl);
                }}
                onKeyDown={createKeyDownHandler(() => onDelete!(tmpl))}
              >
                <Icon name="delete" />
              </span>
            )}
            {!isFunctionalGroupTemplate(tmpl) &&
              !isSaltOrSolventTemplate(tmpl) && (
                <span
                  role="button"
                  tabIndex={0}
                  data-testid={'edit-template-button'}
                  className={`${classes.button} ${classes.editButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttach!(tmpl);
                  }}
                  onKeyDown={createKeyDownHandler(() => onAttach!(tmpl))}
                >
                  <Icon name="edit" />
                </span>
              )}
          </button>
        );
      })}
    </div>
  );
};

export default TemplateTable;
