import { ChemicalMimeType } from 'domain/services/struct/structService.types';
import {
  type ClipboardData,
  getStructStringFromClipboardData,
  legacyCopy,
  legacyPaste,
} from '../clipboardUtils';

describe('clipboardUtils', () => {
  describe('legacyCopy', () => {
    it('copies plain text and additional mime types to clipboard data', () => {
      const setData = jest.fn();
      const clipboardData = {
        getData: jest.fn(),
        setData,
      };
      const data: ClipboardData = {
        'text/plain': 'plain text',
        [ChemicalMimeType.KET]: 'ket payload',
      };

      legacyCopy(clipboardData, data);

      expect(setData).toHaveBeenCalledWith('text/plain', 'plain text');
      expect(setData).toHaveBeenCalledWith(ChemicalMimeType.KET, 'ket payload');
    });
  });

  describe('legacyPaste', () => {
    it('returns plain text and requested mime types from clipboard data', () => {
      const clipboardValues = {
        'text/plain': 'plain text',
        [ChemicalMimeType.Mol]: 'mol payload',
      };
      const clipboardData = {
        getData: jest.fn(
          (mimeType: keyof typeof clipboardValues | string) =>
            clipboardValues[mimeType] || '',
        ),
        setData: jest.fn(),
      };

      expect(legacyPaste(clipboardData, [ChemicalMimeType.Mol])).toEqual({
        'text/plain': 'plain text',
        [ChemicalMimeType.Mol]: 'mol payload',
      });
    });
  });

  describe('getStructStringFromClipboardData', () => {
    it('prefers structured data over plain text for legacy clipboard payloads', async () => {
      const clipboardData: ClipboardData = {
        'text/plain': 'plain text',
        [ChemicalMimeType.Mol]: 'mol payload',
      };

      await expect(
        getStructStringFromClipboardData(clipboardData),
      ).resolves.toBe('mol payload');
    });

    it('reads the first available structured mime type from clipboard items', async () => {
      const clipboardItem = {
        getType: jest.fn(async (mimeType: string) => {
          if (mimeType === `web ${ChemicalMimeType.Mol}`) {
            return {
              size: 'mol payload'.length,
              text: async () => 'mol payload',
            } as unknown as Blob;
          }

          throw new DOMException('Missing mime type');
        }),
      } as unknown as ClipboardItem;

      await expect(
        getStructStringFromClipboardData([clipboardItem]),
      ).resolves.toBe('mol payload');
    });
  });
});
