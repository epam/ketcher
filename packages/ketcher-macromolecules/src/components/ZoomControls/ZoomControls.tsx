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

import { useState, useRef, useCallback, useEffect, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR, Icon } from 'ketcher-react';
import { ZoomInput } from 'components/ZoomControls/ZoomInput';
import { ZoomTool } from 'ketcher-core';
import {
  Dropdown,
  DropDownButton,
  DropDownContent,
  ElementAndDropdown,
  ShortcutLabel,
  ZoomControlButton,
  ZoomLabel,
} from 'components/ZoomControls/styles';
import {
  getIntegerFromString,
  getValidZoom,
  hotkeysShortcuts,
  updateInputString,
} from 'components/ZoomControls/helpers';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';

export const ZoomControls = () => {
  const { t } = useTranslation('macromolecules');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(100);
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const editor = useAppSelector(selectEditor);
  const zoomTool = editor?.zoomTool;

  useEffect(() => {
    if (!zoomTool) {
      return;
    }

    const handler = () => {
      setCurrentZoom(Math.round(zoomTool.getZoomLevel() * 100));
    };

    zoomTool.subscribeOnZoomEvent(handler);

    return () => {
      zoomTool.unsubscribeOnZoomEvent(handler);
    };
  }, [zoomTool]);

  const onZoomSubmit = useCallback(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;
    const userInput = getIntegerFromString(inputEl.value);
    if (userInput && userInput !== currentZoom) {
      const zoomToSet = getValidZoom(userInput, currentZoom);
      updateInputString(zoomToSet, inputEl);
      ZoomTool.instance.zoomTo(zoomToSet / 100);
    } else {
      updateInputString(currentZoom, inputEl);
    }
  }, [currentZoom]);

  const onClose = () => {
    setIsExpanded(false);
  };

  const onExpand = () => {
    setIsExpanded(true);
  };

  const onZoomIn = () => {
    ZoomTool.instance.zoomIn();
  };

  const onZoomOut = () => {
    ZoomTool.instance.zoomOut();
  };

  const onZoomReset = () => {
    ZoomTool.instance.resetZoom();
  };

  return (
    <ElementAndDropdown ref={setContainerElement}>
      <DropDownButton onClick={onExpand} data-testid="zoom-selector">
        <ZoomLabel data-testid="zoom-input">{currentZoom}%</ZoomLabel>
        <Icon name="chevron" />
      </DropDownButton>

      <Dropdown
        open={isExpanded}
        onClose={onClose}
        anchorEl={containerElement}
        container={document.querySelector(
          KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
        )}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        disableEnforceFocus
      >
        <DropDownContent>
          <ZoomInput
            onZoomSubmit={onZoomSubmit}
            inputRef={inputRef as RefObject<HTMLInputElement>}
            currentZoom={currentZoom}
          />
          <ZoomControlButton
            data-testid="zoom-out"
            title={t('zoom.zoomOutTitle')}
            onClick={onZoomOut}
          >
            <span>{t('zoom.zoomOutLabel')}</span>
            <ShortcutLabel>{hotkeysShortcuts['zoom-minus']}</ShortcutLabel>
          </ZoomControlButton>
          <ZoomControlButton
            data-testid="zoom-in"
            title={t('zoom.zoomInTitle')}
            onClick={onZoomIn}
          >
            <span>{t('zoom.zoomInLabel')}</span>
            <ShortcutLabel>{hotkeysShortcuts['zoom-plus']}</ShortcutLabel>
          </ZoomControlButton>
          <ZoomControlButton
            data-testid="zoom-default"
            title={t('zoom.zoomReset')}
            onClick={onZoomReset}
          >
            <span>{t('zoom.zoomReset')}</span>
            <ShortcutLabel>{hotkeysShortcuts['zoom-reset']}</ShortcutLabel>
          </ZoomControlButton>
        </DropDownContent>
      </Dropdown>
    </ElementAndDropdown>
  );
};
