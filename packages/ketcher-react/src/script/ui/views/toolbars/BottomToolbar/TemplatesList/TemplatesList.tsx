/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ****************************************************************************/

import { useEffect, useState } from 'react';
import { KetcherLogger, KetSerializer, type Struct } from 'ketcher-core';
import { getIconName } from 'components';
import action, { type UiAction, type UiActionAction } from '../../../../action';
import defaultTemplates from '../../../../data/templates';
import type { ActionStatus } from '../../../../state/action';
import type { TemplatesState } from '../../../../state/store.types';
import type { ActiveTool } from '../../../../state/toolbar/types';
import { ActionButton } from '../../ToolbarGroupItem/ActionButton';
import type { ToolbarStatus } from '../../toolbar.types';

type TemplateActionId = `template-${number}`;

interface TemplatesListProps {
  active?: ActiveTool;
  disableableButtons: string[];
  indigoVerification: boolean;
  status: ToolbarStatus & Partial<Record<TemplateActionId, ActionStatus>>;
  templates: ReadonlyArray<TemplatesState['lib'][number]>;
}

interface TemplatesListCallProps {
  onAction: (action: UiActionAction) => void;
}

type Props = TemplatesListProps & TemplatesListCallProps;

const templateActions: Partial<Record<TemplateActionId, UiAction>> = action;

const TemplatePreview = ({
  struct,
  name,
}: {
  struct: Struct;
  name: string;
}) => {
  const [preview, setPreview] = useState<{ struct: Struct; url: string }>();

  useEffect(() => {
    const ketcher = window.ketcher;
    if (typeof ketcher?.generateImage !== 'function') {
      KetcherLogger.warn(
        'Ketcher generateImage is not available for template:',
        name,
      );
      return;
    }

    let objectUrl: string | undefined;
    let cancelled = false;

    const generatePreview = async () => {
      try {
        const ket = new KetSerializer().serialize(struct);
        const result = await ketcher.generateImage(ket, {
          outputFormat: 'svg',
        });
        if (cancelled) {
          return;
        }

        if (typeof result === 'string') {
          setPreview({
            struct,
            url:
              'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(result),
          });
          return;
        }

        objectUrl = URL.createObjectURL(result);
        setPreview({ struct, url: objectUrl });
      } catch (error) {
        KetcherLogger.error(
          'Could not generate template preview:',
          name,
          error,
        );
      }
    };

    void generatePreview();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [struct, name]);

  if (preview?.struct !== struct) {
    return (
      <span
        aria-hidden="true"
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
        }}
      >
        ...
      </span>
    );
  }

  return (
    <img
      src={preview.url}
      alt={name}
      title={name}
      style={{
        width: '28px',
        height: '28px',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
};

const TemplatesList = (props: Props) => {
  const {
    active,
    disableableButtons,
    indigoVerification,
    onAction,
    status,
    templates,
  } = props;
  const activeOptions =
    typeof active !== 'function' && active?.tool === 'template'
      ? active.opts
      : undefined;
  const activeStruct =
    activeOptions &&
    typeof activeOptions === 'object' &&
    'struct' in activeOptions
      ? activeOptions.struct
      : undefined;
  const dbTemplates = templates.filter(
    ({ props }) => props.group === 'DB Templates',
  );
  const useDbTemplates = dbTemplates.length > 0;
  const structures: ReadonlyArray<Struct> = useDbTemplates
    ? dbTemplates.map(({ struct }) => struct)
    : defaultTemplates;

  return (
    <>
      {structures.map((struct, index) => {
        const actionId: TemplateActionId = `template-${index}`;
        const nativeIconName = getIconName(actionId);
        const iconName =
          nativeIconName ?? (useDbTemplates ? 'template-0' : null);
        if (!iconName) {
          return null;
        }

        const title = useDbTemplates
          ? struct.name || `Template ${index + 1}`
          : struct.name;
        const templateAction: UiAction = {
          action: { tool: 'template', opts: { struct } },
          shortcut: useDbTemplates
            ? undefined
            : templateActions[actionId]?.shortcut,
          title,
        };

        return (
          <ActionButton
            key={useDbTemplates ? `${title}-${index}` : iconName}
            name={iconName}
            action={templateAction}
            title={useDbTemplates ? title : undefined}
            dataTestId={useDbTemplates ? `db-template-${index}` : undefined}
            showShortcut={!useDbTemplates}
            onAction={onAction}
            selected={activeStruct === struct}
            status={
              status[actionId] ??
              (nativeIconName ? undefined : status['template-0'])
            }
            disableableButtons={disableableButtons}
            indigoVerification={indigoVerification}
            customIcon={
              useDbTemplates ? (
                <TemplatePreview struct={struct} name={title} />
              ) : undefined
            }
          />
        );
      })}
    </>
  );
};

export type { TemplatesListProps, TemplatesListCallProps };
export { TemplatesList };
