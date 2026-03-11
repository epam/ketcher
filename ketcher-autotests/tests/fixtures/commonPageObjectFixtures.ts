/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
  CommonTopLeftToolbar,
  CommonTopLeftToolbarType,
} from '@tests/pages/common/CommonTopLeftToolbar';
import { test as base } from './coreFixtures';
import {
  CommonTopRightToolbar,
  CommonTopRightToolbarType,
} from '@tests/pages/common/CommonTopRightToolbar';
import {
  MacromoleculesTopToolbar,
  MacromoleculesTopToolbarType,
} from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { Locator, Page } from '@playwright/test';
import {
  AntisenseStrandType,
  LayoutMode,
} from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

type CommonPageObjects = {
  CommonTopRightToolbar: (page: Page) => CommonTopRightToolbarType;
  MacromoleculesTopToolbar: (page: Page) => MacromoleculesTopToolbarType;
  CommonTopLeftToolbar: (page: Page) => CommonTopLeftToolbarType;
};

export const test = base.extend<_, CommonPageObjects>({
  CommonTopRightToolbar: [
    async (
      _: any,
      use: (
        arg0: (page: Page) => {
          help(): Promise<void>;
          about(): Promise<void>;
          setZoomInputValue(value: string): Promise<void>;
          selectZoomOutTool(count?: number): Promise<void>;
          selectZoomInTool(count?: number): Promise<void>;
          resetZoom(): Promise<void>;
          turnOnMacromoleculesEditor(options?: {
            enableFlexMode?: boolean;
            goToPeptides?: boolean;
            disableChainLengthRuler?: boolean;
            disableAutozoom?: boolean;
          }): Promise<void>;
          turnOnMicromoleculesEditor(): Promise<void>;
          zoomValueEditbox: Locator;
          zoomOutButton: Locator;
          zoomInButton: Locator;
          zoomDefaultButton: Locator;
          ketcherModeSwitcherCombobox: Locator;
          fullScreenButton: Locator;
          helpButton: Locator;
          aboutButton: Locator;
          zoomSelector: Locator;
        },
      ) => any,
    ) => {
      await use(CommonTopRightToolbar);
    },
    { scope: 'worker', auto: true },
  ],

  CommonTopLeftToolbar: [
    async (
      _: any,
      use: (
        arg0: (page: Page) => {
          clearCanvas(maxAttempts?: number): Promise<void>;
          openFile(): Promise<void>;
          saveFile(): Promise<void>;
          undo(): Promise<void>;
          redo(): Promise<void>;
          clearCanvasButton: Locator;
          openButton: Locator;
          saveButton: Locator;
          undoButton: Locator;
          redoButton: Locator;
        },
      ) => any,
    ) => {
      await use(CommonTopLeftToolbar);
    },
    { scope: 'worker', auto: true },
  ],

  MacromoleculesTopToolbar: [
    async (
      _: any,
      use: (
        arg0: (page: Page) => {
          createAntisenseStrand(): Promise<void>;
          expandCreateAntisenseStrandDropdown(): Promise<void>;
          selectAntisenseStrand(
            antisenseStrandType?: AntisenseStrandType,
          ): Promise<void>;
          arrangeAsARing(): Promise<void>;
          calculateProperties(options?: { timeout?: number }): Promise<void>;
          turnSyncEditModeOn(): Promise<void>;
          turnSyncEditModeOff(): Promise<void>;
          expandSwitchLayoutModeDropdown(): Promise<void>;
          selectLayoutModeTool(layoutMode: LayoutMode): Promise<void>;
          rna(): Promise<void>;
          dna(): Promise<void>;
          peptides(): Promise<void>;
          arrowScrollLeft(): Promise<void>;
          arrowScrollRight(): Promise<void>;
          arrangeAsRingButton: Locator;
          createAntisenseStrandDropdownButton: Locator;
          createAntisenseStrandDropdownExpandButton: Locator;
          arrangeAsARingButton: Locator;
          calculatePropertiesButton: Locator;
          syncSequenceEditModeButton: Locator;
          switchLayoutModeDropdownButton: Locator;
          switchLayoutModeDropdownExpandButton: Locator;
          rnaButton: Locator;
          dnaButton: Locator;
          peptidesButton: Locator;
          arrowScrollLeftButton: Locator;
          arrowScrollRightButton: Locator;
        },
      ) => any,
    ) => {
      await use(MacromoleculesTopToolbar);
    },
    { scope: 'worker', auto: true },
  ],
});
