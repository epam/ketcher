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

import { useState, useRef, useCallback, useEffect } from 'react';
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
  shortcuts,
  updateInputString,
} from 'components/ZoomControls/helpers';

export const ZoomControls = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ZoomTool?.instance?.subscribeOnZoomEvent(() => {
      setCurrentZoom(Math.round(ZoomTool?.instance?.getZoomLevel() * 100));
    });
  }, [ZoomTool?.instance]);

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
    <ElementAndDropdown ref={containerRef}>
      <DropDownButton onClick={onExpand} data-testid="zoom-selector">
        <ZoomLabel data-testid="zoom-input">{currentZoom}%</ZoomLabel>
        <Icon name="chevron" />
      </DropDownButton>

      <Dropdown
        open={isExpanded}
        onClose={onClose}
        anchorEl={containerRef.current}
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
      >
        <DropDownContent>
          <ZoomInput
            onZoomSubmit={onZoomSubmit}
            inputRef={inputRef}
            currentZoom={currentZoom}
          />
          <ZoomControlButton
            data-testid="zoom-out-button"
            title="Zoom Out"
            onClick={onZoomOut}
          >
            <span>Zoom out</span>
            <ShortcutLabel>{shortcuts['zoom-minus']}</ShortcutLabel>
          </ZoomControlButton>
          <ZoomControlButton
            data-testid="zoom-in-button"
            title="Zoom In"
            onClick={onZoomIn}
          >
            <span>Zoom in</span>
            <ShortcutLabel>{shortcuts['zoom-plus']}</ShortcutLabel>
          </ZoomControlButton>
          <ZoomControlButton
            data-testid="reset-zoom-button"
            title="Zoom 100%"
            onClick={onZoomReset}
          >
            <span>Zoom 100%</span>
            <ShortcutLabel>{shortcuts['zoom-reset']}</ShortcutLabel>
          </ZoomControlButton>
        </DropDownContent>
      </Dropdown>
    </ElementAndDropdown>
  );
};
