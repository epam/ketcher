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

import { type ReactNode, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Icon } from 'components';
import classes from './SettingsPanel.module.less';
import SettingsAccordion, { type SettingsGroup } from './SettingsAccordion';
import { useSettingsPanelDrag } from './useSettingsPanelDrag';

export const SETTINGS_PANEL_WIDTH = 340;
export const SETTINGS_PANEL_GUTTER = 8;

export interface SettingsPanelProps {
  title: string;
  /** Icon controls rendered in the title row, left of the close button */
  headerControls?: ReactNode;
  /** Groups to render through `SettingsAccordion`. Ignored when `children` is given. */
  groups?: SettingsGroup[];
  /** Body content. Takes precedence over `groups` so consumers can wrap it in a form. */
  children?: ReactNode;
  /** The panel rect is always clamped inside this element's box */
  boundsElement?: HTMLElement | null;
  isApplyDisabled?: boolean;
  onApply: () => void;
  onCancel: () => void;
  onClose: () => void;
  className?: string;
}

const SettingsPanel = ({
  title,
  headerControls,
  groups,
  children,
  boundsElement,
  isApplyDisabled,
  onApply,
  onCancel,
  onClose,
  className,
}: SettingsPanelProps) => {
  const { t } = useTranslation('common');
  const panelRef = useRef<HTMLDivElement>(null);
  const { rect, setRect, startDrag, getBounds } = useSettingsPanelDrag({
    panelRef,
    boundsElement,
  });

  // Anchor to the right of the bounds element on open. The panel mounts on open and
  // unmounts on close, so the dragged position is never carried over to the next open.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const bounds = getBounds();
    if (!panel || !bounds) return;

    const width = panel.offsetWidth || SETTINGS_PANEL_WIDTH;
    const maxHeight = bounds.bottom - bounds.top - 2 * SETTINGS_PANEL_GUTTER;

    setRect({
      left: bounds.right - SETTINGS_PANEL_GUTTER - width,
      top: bounds.top + SETTINGS_PANEL_GUTTER,
      width,
      height: Math.min(panel.scrollHeight, maxHeight),
    });
    // The default rect is computed once per open; later moves come from the drag hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundsElement]);

  return (
    <div
      ref={panelRef}
      className={clsx(classes.panel, className)}
      style={
        rect
          ? { left: rect.left, top: rect.top, height: rect.height }
          : { visibility: 'hidden' }
      }
      data-testid="settings-panel"
    >
      <div
        className={classes.header}
        onPointerDown={startDrag}
        data-testid="settings-panel-header"
      >
        <span className={classes.title}>{title}</span>
        {headerControls && (
          <div
            className={classes.headerControls}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {headerControls}
          </div>
        )}
        <button
          type="button"
          className={classes.closeButton}
          title={t('button.close')}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onClose}
          data-testid="settings-panel-close"
        >
          <Icon name="close" />
        </button>
      </div>

      <div className={classes.body}>
        {children ?? (groups ? <SettingsAccordion groups={groups} /> : null)}
      </div>

      <div className={classes.footer}>
        <button
          type="button"
          className={classes.cancelButton}
          onClick={onCancel}
          data-testid="settings-panel-cancel"
        >
          {t('button.cancel')}
        </button>
        <button
          type="button"
          className={classes.applyButton}
          onClick={onApply}
          disabled={isApplyDisabled}
          data-testid="settings-panel-apply"
        >
          {t('button.apply')}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
