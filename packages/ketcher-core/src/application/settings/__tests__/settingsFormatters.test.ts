import {
  normalizeSettingsForCore,
  normalizeSettingsForForm,
} from '../settingsFormatters';
import { getDefaultSettings } from '../schema';

describe('settingsFormatters', () => {
  describe('normalizeSettingsForCore', () => {
    it.each([
      ['Iupac', 'IUPAC'],
      ['Classic', 'classic'],
      ['On', 'On-Atoms'],
      ['On-Atoms', 'On-Atoms'],
      ['Off', 'off'],
    ] as const)(
      'normalizes stereoLabelStyle from %s to %s',
      (formValue, coreValue) => {
        expect(
          normalizeSettingsForCore({ stereoLabelStyle: formValue })
            .stereoLabelStyle,
        ).toBe(coreValue);
      },
    );

    it('normalizes legacy form values to core values', () => {
      expect(
        normalizeSettingsForCore({
          imageResolution: '600',
          showHydrogenLabels: 'all',
          font: 'Arial',
          init: true,
        }),
      ).toEqual({
        imageResolution: 600,
        showHydrogenLabels: 'On',
        font: '30px Arial',
      });
    });

    it('keeps an existing font size prefix', () => {
      expect(normalizeSettingsForCore({ font: '24px Arial' }).font).toBe(
        '24px Arial',
      );
    });
  });

  describe('normalizeSettingsForForm', () => {
    it.each([
      ['IUPAC', 'Iupac'],
      ['classic', 'Classic'],
      ['On-Atoms', 'On'],
      ['off', 'Off'],
    ] as const)(
      'normalizes stereoLabelStyle from %s to %s',
      (coreValue, formValue) => {
        expect(
          normalizeSettingsForForm({ stereoLabelStyle: coreValue })
            .stereoLabelStyle,
        ).toBe(formValue);
      },
    );

    it('normalizes core values to form values', () => {
      expect(
        normalizeSettingsForForm({
          imageResolution: 72,
          font: 'Arial',
        }),
      ).toEqual({
        imageResolution: '72',
        font: '30px Arial',
      });
    });

    it('removes core-only fields when requested for Redux compatibility', () => {
      const formSettings = normalizeSettingsForForm(getDefaultSettings(), {
        removeCoreOnlyFields: true,
      });

      expect(formSettings.selectionTool).toBeUndefined();
      expect(formSettings.editorLineLength).toBeUndefined();
      expect(formSettings.disableCustomQuery).toBeUndefined();
      expect(formSettings.monomerLibraryUpdates).toBeUndefined();
    });
  });
});
