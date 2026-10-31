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

// Names the toolbar groups check in `hiddenButtons`, in rendering order.
// `copies` is the copy dropdown; custom buttons are counted separately.
const TOP_TOOLBAR_ICON_BUTTONS = [
  'clear',
  'open',
  'save',
  'copies',
  'paste',
  'cut',
  'undo',
  'redo',
  'arom',
  'dearom',
  'layout',
  'clean',
  'cip',
  'check',
  'analyse',
  'explicit-hydrogens',
  'miew',
  'settings',
  'help',
  'about',
  'fullscreen',
];

// The sizes below mirror the styles they have to agree with:
// TopToolbarIconButton (28/32/40 px at the 1024/1920 px container queries),
// ModeControl (icon only below 900 px, with its label from there on),
// Divider (1 px rule plus 6 px margins) and ZoomControls.
const ICON_BUTTON_WIDTH = { narrow: 28, medium: 32, wide: 40 };
const MEDIUM_CONTAINER_WIDTH = 1024;
const WIDE_CONTAINER_WIDTH = 1920;
const MODE_SWITCHER_WIDTH = { icon: 28, labelled: 162 };
const MODE_SWITCHER_LABEL_CONTAINER_WIDTH = 900;
const DIVIDER_WIDTH = 13;
const ZOOM_CONTROLS_WIDTH = 64;
// UndoRedo draws a divider on each side of itself, TopToolbar one before the zoom.
const FIXED_DIVIDERS_COUNT = 3;

type ExpandedToolbarWidthParams = {
  /** Width of the app container the CSS container queries are resolved against */
  containerWidth: number;
  hiddenButtons: string[];
  customButtonsCount: number;
  hasModeSwitcher: boolean;
};

const getIconButtonWidth = (containerWidth: number) => {
  if (containerWidth >= WIDE_CONTAINER_WIDTH) {
    return ICON_BUTTON_WIDTH.wide;
  }

  return containerWidth >= MEDIUM_CONTAINER_WIDTH
    ? ICON_BUTTON_WIDTH.medium
    : ICON_BUTTON_WIDTH.narrow;
};

/**
 * Content width the top toolbar needs to show every button without collapsing
 * the external functions and custom buttons into dropdowns.
 */
export function getExpandedToolbarWidth({
  containerWidth,
  hiddenButtons,
  customButtonsCount,
  hasModeSwitcher,
}: ExpandedToolbarWidthParams) {
  const iconButtonWidth = getIconButtonWidth(containerWidth);
  const visibleIconButtonsCount = TOP_TOOLBAR_ICON_BUTTONS.filter(
    (name) => !hiddenButtons.includes(name),
  ).length;
  const modeSwitcherWidth = hasModeSwitcher
    ? (containerWidth >= MODE_SWITCHER_LABEL_CONTAINER_WIDTH
        ? MODE_SWITCHER_WIDTH.labelled
        : MODE_SWITCHER_WIDTH.icon) + DIVIDER_WIDTH
    : 0;
  const zoomControlsWidth = hiddenButtons.includes('zoom-list')
    ? 0
    : ZOOM_CONTROLS_WIDTH;
  const customButtonsDividerWidth = customButtonsCount > 0 ? DIVIDER_WIDTH : 0;

  return (
    (visibleIconButtonsCount + customButtonsCount) * iconButtonWidth +
    FIXED_DIVIDERS_COUNT * DIVIDER_WIDTH +
    modeSwitcherWidth +
    zoomControlsWidth +
    customButtonsDividerWidth
  );
}
