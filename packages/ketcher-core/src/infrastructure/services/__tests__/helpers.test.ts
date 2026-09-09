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

import { ShowHydrogenLabels } from 'application/render';
import { ketcherProvider } from 'application/ketcherProvider';
import { getLabelRenderModeForIndigo } from '../helpers';

jest.mock('application/ketcherProvider', () => ({
  ketcherProvider: {
    getKetcher: jest.fn(),
  },
}));

const KETCHER_ID = 'test-id';

function mockEditorOptions(
  carbonExplicitly: boolean,
  showHydrogenLabels: ShowHydrogenLabels,
) {
  (ketcherProvider.getKetcher as jest.Mock).mockReturnValue({
    editor: {
      options: () => ({ carbonExplicitly, showHydrogenLabels }),
    },
  });
}

describe('getLabelRenderModeForIndigo', () => {
  describe('carbonExplicitly: true', () => {
    it('returns "all" regardless of showHydrogenLabels', () => {
      const hydrogenLabelModes = [
        ShowHydrogenLabels.Off,
        ShowHydrogenLabels.Hetero,
        ShowHydrogenLabels.Terminal,
        ShowHydrogenLabels.TerminalAndHetero,
        ShowHydrogenLabels.On,
      ];

      for (const mode of hydrogenLabelModes) {
        mockEditorOptions(true, mode);
        expect(getLabelRenderModeForIndigo(KETCHER_ID)).toBe('all');
      }
    });
  });

  describe('carbonExplicitly: false', () => {
    it('maps Off → "hetero"', () => {
      mockEditorOptions(false, ShowHydrogenLabels.Off);
      expect(getLabelRenderModeForIndigo(KETCHER_ID)).toBe('hetero');
    });

    it('maps Hetero → "hetero"', () => {
      mockEditorOptions(false, ShowHydrogenLabels.Hetero);
      expect(getLabelRenderModeForIndigo(KETCHER_ID)).toBe('hetero');
    });

    it('maps Terminal → "terminal-hetero"', () => {
      mockEditorOptions(false, ShowHydrogenLabels.Terminal);
      expect(getLabelRenderModeForIndigo(KETCHER_ID)).toBe('terminal-hetero');
    });

    it('maps TerminalAndHetero → "terminal-hetero"', () => {
      mockEditorOptions(false, ShowHydrogenLabels.TerminalAndHetero);
      expect(getLabelRenderModeForIndigo(KETCHER_ID)).toBe('terminal-hetero');
    });

    it('maps On → "all"', () => {
      mockEditorOptions(false, ShowHydrogenLabels.On);
      expect(getLabelRenderModeForIndigo(KETCHER_ID)).toBe('all');
    });

    it('falls back to "none" for an unknown showHydrogenLabels value', () => {
      mockEditorOptions(false, 'unknown-value' as ShowHydrogenLabels);
      expect(getLabelRenderModeForIndigo(KETCHER_ID)).toBe('none');
    });
  });
});
