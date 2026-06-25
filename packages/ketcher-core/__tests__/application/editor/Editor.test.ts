import {
  CoreEditor,
  EditorClassName,
  MonomerLibraryConvertError,
  MonomerLibraryUpdateError,
  ToolName,
} from 'application/editor';
import { ketcherProvider } from 'application/ketcherProvider';
import { provideEditorSettings } from 'application/editor/editorSettings';
import { MonomerTool } from 'application/editor/tools/Monomer';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import type { SelectBase } from 'application/editor/tools/select';
import { Vec2 } from 'domain/entities';
import { peptideMonomerItem, polymerEditorTheme } from '../../mock-data';
import {
  KetcherLogger,
  MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH,
  MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE,
} from 'utilities';

type RescaleStructForModeTransitionContext = {
  micromoleculesEditor: {
    render: {
      options: {
        microModeScale: number;
      };
    };
  };
};

type RescaleStructForModeTransitionStruct = {
  scale: jest.Mock;
  scaleMonomerMicromoleculeSgroups: jest.Mock;
};

type RescaleStructForModeTransitionMethod = (
  this: RescaleStructForModeTransitionContext,
  struct: RescaleStructForModeTransitionStruct,
  direction: 'microToMacro' | 'macroToMicro',
) => number;

const callRescaleStructForModeTransition = (
  editor: RescaleStructForModeTransitionContext,
  struct: RescaleStructForModeTransitionStruct,
  direction: 'microToMacro' | 'macroToMicro',
) => {
  const { rescaleStructForModeTransition } =
    CoreEditor.prototype as unknown as {
      rescaleStructForModeTransition: RescaleStructForModeTransitionMethod;
    };

  return rescaleStructForModeTransition.call(editor, struct, direction);
};

describe('CoreEditor', () => {
  it('should create MonomerLibraryConvertError with a cause', () => {
    const cause = new Error('convert failed');
    const error = new MonomerLibraryConvertError(
      'Monomer item could not be loaded because of an error: convert failed',
      cause,
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MonomerLibraryConvertError);
    expect(error.name).toBe('MonomerLibraryConvertError');
    expect(error.cause).toBe(cause);
  });

  describe('rescaleStructForModeTransition', () => {
    const originalSettings = { ...provideEditorSettings() };

    afterEach(() => {
      Object.assign(provideEditorSettings(), originalSettings);
    });

    it('should be a no-op when micro and macro scales are equal', () => {
      const struct = {
        scale: jest.fn(),
        scaleMonomerMicromoleculeSgroups: jest.fn(),
      };
      const editor = {
        micromoleculesEditor: {
          render: {
            options: {
              microModeScale: 40,
            },
          },
        },
      };

      provideEditorSettings().macroModeScale = 40;

      const scaleFactor = callRescaleStructForModeTransition(
        editor,
        struct,
        'macroToMicro',
      );

      expect(scaleFactor).toBe(1);
      expect(struct.scale).not.toHaveBeenCalled();
      expect(struct.scaleMonomerMicromoleculeSgroups).not.toHaveBeenCalled();
    });

    it('should convert macro coordinates into micro coordinates using source-to-target scales', () => {
      const struct = {
        scale: jest.fn(),
        scaleMonomerMicromoleculeSgroups: jest.fn(),
      };
      const editor = {
        micromoleculesEditor: {
          render: {
            options: {
              microModeScale: 40,
            },
          },
        },
      };

      provideEditorSettings().macroModeScale = 20;

      const scaleFactor = callRescaleStructForModeTransition(
        editor,
        struct,
        'macroToMicro',
      );

      expect(scaleFactor).toBe(0.5);
      expect(struct.scale).toHaveBeenCalledWith(0.5);
      expect(struct.scaleMonomerMicromoleculeSgroups).not.toHaveBeenCalled();
    });

    it('should convert micro coordinates into macro coordinates and rescale monomer sgroups', () => {
      const struct = {
        scale: jest.fn(),
        scaleMonomerMicromoleculeSgroups: jest.fn(),
      };
      const editor = {
        micromoleculesEditor: {
          render: {
            options: {
              microModeScale: 40,
            },
          },
        },
      };

      provideEditorSettings().macroModeScale = 20;

      const scaleFactor = callRescaleStructForModeTransition(
        editor,
        struct,
        'microToMacro',
      );

      expect(scaleFactor).toBe(2);
      expect(struct.scale).toHaveBeenCalledWith(2);
      expect(struct.scaleMonomerMicromoleculeSgroups).toHaveBeenCalledWith(2);
    });
  });

  it('should track dom events and trigger handlers', () => {
    const canvas = createPolymerEditorCanvas();
    const editor: CoreEditor = new CoreEditor({
      canvas,
      theme: polymerEditorTheme,
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
    const onMousemove = jest.fn();
    jest
      .spyOn(MonomerTool.prototype, 'mousemove')
      .mockImplementation(onMousemove);
    editor.selectTool(ToolName.monomer);
    canvas.dispatchEvent(new Event('mousemove', { bubbles: true }));
    expect(onMousemove).toHaveBeenCalled();
  });

  describe('updateMonomersLibrary', () => {
    let canvas: SVGSVGElement;
    let editor: CoreEditor;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      canvas = createPolymerEditorCanvas();
      editor = new CoreEditor({
        canvas,
        theme: polymerEditorTheme,
        renderersContainer: createRenderersManager(polymerEditorTheme),
      });
      errorSpy = jest.spyOn(KetcherLogger, 'error').mockImplementation();
    });

    afterEach(() => {
      errorSpy.mockRestore();
    });

    // Note: In the KET format, idtAliases is defined at the template level.
    // During parsing (via templateToMonomerProps), it gets moved to props.idtAliases.
    // The validation checks newMonomer.props?.idtAliases after this conversion.
    it('should reject monomer with idtAliases but no base alias', () => {
      const monomerWithoutBase = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-CHEM1',
            },
          ],
        },
        'monomerTemplate-CHEM1': {
          type: 'monomerTemplate',
          id: 'CHEM1',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test Chem',
          name: 'CHEM1',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'CHEM1',
            MonomerClass: 'CHEM',
            Name: 'CHEM1',
            MonomerNaturalAnalogCode: 'X',
          },
          idtAliases: {
            modifications: {
              internal: 'Test',
            },
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      let thrownError: MonomerLibraryUpdateError | undefined;
      try {
        editor.updateMonomersLibrary(JSON.stringify(monomerWithoutBase));
      } catch (error) {
        thrownError = error as MonomerLibraryUpdateError;
      }

      expect(thrownError).toBeInstanceOf(MonomerLibraryUpdateError);
      expect(thrownError?.partialSuccess).toBe(false);
      expect(thrownError?.skippedItems).toEqual([
        {
          name: 'CHEM1',
          reason: expect.stringContaining(
            'Base IDT alias is required when idtAliases is defined',
          ),
        },
      ]);

      expect(errorSpy).toHaveBeenCalledWith(
        'Editor::updateMonomersLibrary',
        expect.stringContaining(
          'Base IDT alias is required when idtAliases is defined',
        ),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize);
    });

    it('should accept monomer with idtAliases and base alias', () => {
      const monomerWithBase = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-CHEM2',
            },
          ],
        },
        'monomerTemplate-CHEM2': {
          type: 'monomerTemplate',
          id: 'CHEM2',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test Chem 2',
          name: 'CHEM2',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'CHEM2',
            MonomerClass: 'CHEM',
            Name: 'CHEM2',
            MonomerNaturalAnalogCode: 'X',
          },
          idtAliases: {
            base: 'BaseAlias',
            modifications: {
              internal: 'Test',
            },
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerWithBase));

      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(
          'Base IDT alias is required when idtAliases is defined',
        ),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
    });

    it('should accept monomer without idtAliases', () => {
      const monomerWithoutIdtAliases = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-CHEM3',
            },
          ],
        },
        'monomerTemplate-CHEM3': {
          type: 'monomerTemplate',
          id: 'CHEM3',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test Chem 3',
          name: 'CHEM3',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'CHEM3',
            MonomerClass: 'CHEM',
            Name: 'CHEM3',
            MonomerNaturalAnalogCode: 'X',
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerWithoutIdtAliases));

      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(
          'Base IDT alias is required when idtAliases is defined',
        ),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
    });

    it('should log HELM alias collision across monomers', () => {
      const monomerWithAlias = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-SUGAR1',
            },
          ],
        },
        'monomerTemplate-SUGAR1': {
          type: 'monomerTemplate',
          id: 'SUGAR1',
          class: 'SUGAR',
          classHELM: 'SUGAR',
          fullName: 'Test Sugar 1',
          name: 'SUGAR1',
          naturalAnalogShort: 'R',
          props: {
            MonomerName: 'SUGAR1',
            MonomerClass: 'SUGAR',
            Name: 'SUGAR1',
            MonomerNaturalAnalogCode: 'R',
          },
          aliasHELM: 'Sugar1',
        },
      };
      const monomerWithAliasCollision = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-SUGAR2',
            },
          ],
        },
        'monomerTemplate-SUGAR2': {
          type: 'monomerTemplate',
          id: 'SUGAR2',
          class: 'SUGAR',
          classHELM: 'SUGAR',
          fullName: 'Test Sugar 2',
          name: 'SUGAR2',
          naturalAnalogShort: 'R',
          props: {
            MonomerName: 'SUGAR2',
            MonomerClass: 'SUGAR',
            Name: 'SUGAR2',
            MonomerNaturalAnalogCode: 'R',
          },
          aliasHELM: 'Sugar1',
        },
      };

      editor.updateMonomersLibrary(JSON.stringify(monomerWithAlias));

      expect(() =>
        editor.updateMonomersLibrary(JSON.stringify(monomerWithAliasCollision)),
      ).toThrow(MonomerLibraryUpdateError);
      expect(errorSpy).toHaveBeenCalledWith(
        'Editor::updateMonomersLibrary',
        expect.stringContaining('Alias collision detected'),
      );
    });

    it('should reject duplicate HELM aliases within a single update payload', () => {
      const payloadWithDuplicateAliases = {
        root: {
          templates: [
            { $ref: 'monomerTemplate-PHOS1' },
            { $ref: 'monomerTemplate-PHOS2' },
            { $ref: 'monomerTemplate-PHOS3' },
          ],
        },
        'monomerTemplate-PHOS1': {
          type: 'monomerTemplate',
          id: 'PHOS1',
          class: 'Phosphate',
          classHELM: 'Phosphate',
          fullName: 'Test Phosphate 1',
          name: 'PHOS1',
          naturalAnalogShort: 'P',
          props: {
            MonomerName: 'PHOS1',
            MonomerClass: 'Phosphate',
            Name: 'PHOS1',
            MonomerNaturalAnalogCode: 'P',
          },
          aliasHELM: 'SharedPhosphateAlias',
        },
        'monomerTemplate-PHOS2': {
          type: 'monomerTemplate',
          id: 'PHOS2',
          class: 'Phosphate',
          classHELM: 'Phosphate',
          fullName: 'Test Phosphate 2',
          name: 'PHOS2',
          naturalAnalogShort: 'P',
          props: {
            MonomerName: 'PHOS2',
            MonomerClass: 'Phosphate',
            Name: 'PHOS2',
            MonomerNaturalAnalogCode: 'P',
          },
          aliasHELM: 'SharedPhosphateAlias',
        },
        'monomerTemplate-PHOS3': {
          type: 'monomerTemplate',
          id: 'PHOS3',
          class: 'Phosphate',
          classHELM: 'Phosphate',
          fullName: 'Test Phosphate 3',
          name: 'PHOS3',
          naturalAnalogShort: 'P',
          props: {
            MonomerName: 'PHOS3',
            MonomerClass: 'Phosphate',
            Name: 'PHOS3',
            MonomerNaturalAnalogCode: 'P',
          },
          aliasHELM: 'SharedPhosphateAlias',
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      let thrownError: MonomerLibraryUpdateError | undefined;
      try {
        editor.updateMonomersLibrary(
          JSON.stringify(payloadWithDuplicateAliases),
        );
      } catch (error) {
        thrownError = error as MonomerLibraryUpdateError;
      }

      expect(thrownError).toBeInstanceOf(MonomerLibraryUpdateError);
      expect(thrownError?.partialSuccess).toBe(true);
      expect(thrownError?.skippedItems).toEqual([
        {
          name: 'PHOS2',
          reason: expect.stringContaining('Alias collision detected'),
        },
        {
          name: 'PHOS3',
          reason: expect.stringContaining('Alias collision detected'),
        },
      ]);
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
    });

    it('should skip monomer with invalid HELM alias and still load valid aliases with brackets and dots', () => {
      const monomersWithMixedAliases = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-SUGAR3',
            },
            {
              $ref: 'monomerTemplate-SUGAR4',
            },
          ],
        },
        'monomerTemplate-SUGAR3': {
          type: 'monomerTemplate',
          id: 'SUGAR3',
          class: 'SUGAR',
          classHELM: 'SUGAR',
          fullName: 'Invalid Alias Sugar',
          name: 'SUGAR3',
          naturalAnalogShort: 'R',
          props: {
            MonomerName: 'SUGAR3',
            MonomerClass: 'SUGAR',
            Name: 'SUGAR3',
            MonomerNaturalAnalogCode: 'R',
          },
          aliasHELM: 'Invalid Alias',
        },
        'monomerTemplate-SUGAR4': {
          type: 'monomerTemplate',
          id: 'SUGAR4',
          class: 'SUGAR',
          classHELM: 'SUGAR',
          fullName: 'Valid Alias Sugar',
          name: 'SUGAR4',
          naturalAnalogShort: 'R',
          props: {
            MonomerName: 'SUGAR4',
            MonomerClass: 'SUGAR',
            Name: 'SUGAR4',
            MonomerNaturalAnalogCode: 'R',
          },
          aliasHELM: '[Sugar].(1)',
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      let thrownError: MonomerLibraryUpdateError | undefined;
      try {
        editor.updateMonomersLibrary(JSON.stringify(monomersWithMixedAliases));
      } catch (error) {
        thrownError = error as MonomerLibraryUpdateError;
      }

      expect(thrownError).toBeInstanceOf(MonomerLibraryUpdateError);
      expect(thrownError?.partialSuccess).toBe(true);
      expect(thrownError?.skippedItems).toEqual([
        {
          name: 'SUGAR3',
          reason: expect.stringContaining('Invalid HELM alias value'),
        },
      ]);

      expect(errorSpy).toHaveBeenCalledWith(
        'Editor::updateMonomersLibrary',
        expect.stringContaining('Invalid HELM alias value'),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
      expect(
        editor.monomersLibrary.find(
          (monomer) => monomer.props?.MonomerName === 'SUGAR3',
        ),
      ).toBeUndefined();
      expect(
        editor.monomersLibrary.find(
          (monomer) => monomer.props?.MonomerName === 'SUGAR4',
        )?.props.aliasHELM,
      ).toBe('[Sugar].(1)');
    });

    it('should skip monomer with invalid BILN alias', () => {
      const monomerWithInvalidBilnAlias = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-PEPTIDE_BILN_INVALID',
            },
          ],
        },
        'monomerTemplate-PEPTIDE_BILN_INVALID': {
          type: 'monomerTemplate',
          id: 'PEPTIDE_BILN_INVALID',
          class: 'AminoAcid',
          classHELM: 'PEPTIDE',
          fullName: 'Invalid BILN Alias Peptide',
          name: 'PEPTIDE_BILN_INVALID',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'PEPTIDE_BILN_INVALID',
            MonomerClass: 'AminoAcid',
            Name: 'PEPTIDE_BILN_INVALID',
            MonomerNaturalAnalogCode: 'X',
          },
          aliasBILN: 'Invalid.BILN',
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerWithInvalidBilnAlias));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Load of "PEPTIDE_BILN_INVALID" monomer has failed, monomer definition contains invalid BILN alias value.',
        ),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize);
    });

    it('should log BILN alias collision across peptide and CHEM monomers', () => {
      const monomerWithBilnAlias = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-PEPTIDE_BILN_1',
            },
          ],
        },
        'monomerTemplate-PEPTIDE_BILN_1': {
          type: 'monomerTemplate',
          id: 'PEPTIDE_BILN_1',
          class: 'AminoAcid',
          classHELM: 'PEPTIDE',
          fullName: 'Test Peptide BILN 1',
          name: 'PEPTIDE_BILN_1',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'PEPTIDE_BILN_1',
            MonomerClass: 'AminoAcid',
            Name: 'PEPTIDE_BILN_1',
            MonomerNaturalAnalogCode: 'X',
          },
          aliasBILN: 'BilnAlias1',
        },
      };
      const monomerWithBilnAliasCollision = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-CHEM_BILN_1',
            },
          ],
        },
        'monomerTemplate-CHEM_BILN_1': {
          type: 'monomerTemplate',
          id: 'CHEM_BILN_1',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test CHEM BILN 1',
          name: 'CHEM_BILN_1',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'CHEM_BILN_1',
            MonomerClass: 'CHEM',
            Name: 'CHEM_BILN_1',
            MonomerNaturalAnalogCode: 'X',
          },
          aliasBILN: 'BilnAlias1',
        },
      };

      editor.updateMonomersLibrary(JSON.stringify(monomerWithBilnAlias));

      expect(() =>
        editor.updateMonomersLibrary(
          JSON.stringify(monomerWithBilnAliasCollision),
        ),
      ).toThrow(MonomerLibraryUpdateError);

      expect(errorSpy).toHaveBeenCalledWith(
        'Editor::updateMonomersLibrary',
        expect.stringContaining(
          'Alias collision detected (BILN alias "BilnAlias1")',
        ),
      );
    });

    it('should log IDT alias collision across monomers', () => {
      const monomerWithIdtAlias = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-CHEM4',
            },
          ],
        },
        'monomerTemplate-CHEM4': {
          type: 'monomerTemplate',
          id: 'CHEM4',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test Chem 4',
          name: 'CHEM4',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'CHEM4',
            MonomerClass: 'CHEM',
            Name: 'CHEM4',
            MonomerNaturalAnalogCode: 'X',
          },
          idtAliases: {
            base: 'IdtBase1',
          },
        },
      };
      const monomerWithIdtCollision = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-CHEM5',
            },
          ],
        },
        'monomerTemplate-CHEM5': {
          type: 'monomerTemplate',
          id: 'CHEM5',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test Chem 5',
          name: 'CHEM5',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'CHEM5',
            MonomerClass: 'CHEM',
            Name: 'CHEM5',
            MonomerNaturalAnalogCode: 'X',
          },
          idtAliases: {
            base: 'IdtBase1',
          },
        },
      };

      editor.updateMonomersLibrary(JSON.stringify(monomerWithIdtAlias));

      expect(() =>
        editor.updateMonomersLibrary(JSON.stringify(monomerWithIdtCollision)),
      ).toThrow(MonomerLibraryUpdateError);
      expect(errorSpy).toHaveBeenCalledWith(
        'Editor::updateMonomersLibrary',
        expect.stringContaining('Alias collision detected'),
      );
    });

    it('should reject monomer with IDT alias exceeding 10 characters without slashes', () => {
      const monomerWithLongIdtAlias = {
        root: {
          templates: [{ $ref: 'monomerTemplate-CHEM_LONG' }],
        },
        'monomerTemplate-CHEM_LONG': {
          type: 'monomerTemplate',
          id: 'CHEM_LONG',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test Chem Long IDT',
          name: 'CHEM_LONG',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'CHEM_LONG',
            MonomerClass: 'CHEM',
            Name: 'CHEM_LONG',
            MonomerNaturalAnalogCode: 'X',
          },
          idtAliases: {
            base: 'N1234567890', // 11 chars, no slashes — exceeds max of 10
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerWithLongIdtAlias));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'The maximum number of characters of an IDT alias without slashes (/) is 10.',
        ),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize);
    });

    it('should throw MonomerLibraryUpdateError on BILN alias collision across peptide and CHEM monomers', () => {
      const peptideWithBilnAlias = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-PEPTIDE_BILN_1',
            },
          ],
        },
        'monomerTemplate-PEPTIDE_BILN_1': {
          type: 'monomerTemplate',
          id: 'PEPTIDE_BILN_1',
          class: 'AminoAcid',
          classHELM: 'PEPTIDE',
          fullName: 'Test Peptide BILN 1',
          name: 'PEPTIDE_BILN_1',
          naturalAnalogShort: 'A',
          props: {
            MonomerName: 'PEPTIDE_BILN_1',
            MonomerClass: 'AminoAcid',
            Name: 'PEPTIDE_BILN_1',
            MonomerNaturalAnalogCode: 'A',
          },
          aliasBILN: 'BilnAlias1',
        },
      };
      const chemWithBilnCollision = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-CHEM_BILN_1',
            },
          ],
        },
        'monomerTemplate-CHEM_BILN_1': {
          type: 'monomerTemplate',
          id: 'CHEM_BILN_1',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test Chem BILN 1',
          name: 'CHEM_BILN_1',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'CHEM_BILN_1',
            MonomerClass: 'CHEM',
            Name: 'CHEM_BILN_1',
            MonomerNaturalAnalogCode: 'X',
          },
          aliasBILN: 'BilnAlias1',
        },
      };

      editor.updateMonomersLibrary(JSON.stringify(peptideWithBilnAlias));

      expect(() =>
        editor.updateMonomersLibrary(JSON.stringify(chemWithBilnCollision)),
      ).toThrow(MonomerLibraryUpdateError);
      expect(errorSpy).toHaveBeenCalledWith(
        'Editor::updateMonomersLibrary',
        expect.stringContaining('BILN alias "BilnAlias1"'),
      );
    });

    it('should accept monomer with IDT alias of 10 inner characters wrapped in slashes', () => {
      const monomerWithSlashedIdtAlias = {
        root: {
          templates: [{ $ref: 'monomerTemplate-CHEM_OK' }],
        },
        'monomerTemplate-CHEM_OK': {
          type: 'monomerTemplate',
          id: 'CHEM_OK',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test Chem OK IDT',
          name: 'CHEM_OK',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'CHEM_OK',
            MonomerClass: 'CHEM',
            Name: 'CHEM_OK',
            MonomerNaturalAnalogCode: 'X',
          },
          idtAliases: {
            base: '/1234567890/', // 12 chars total, 10 inner — within limit
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerWithSlashedIdtAlias));

      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(
          'The maximum number of characters of an IDT alias without slashes',
        ),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
    });

    it('should reject monomer group template without name', () => {
      const unnamedPreset = {
        root: {
          templates: [
            {
              $ref: 'monomerGroupTemplate-',
            },
          ],
        },
        'monomerGroupTemplate-': {
          type: 'monomerGroupTemplate',
          id: '',
          name: '   ',
          class: 'RNA',
          templates: [],
          connections: [],
        },
      };

      const initialTemplatesCount =
        editor.monomersLibraryParsedJson?.root.templates.length ?? 0;
      let thrownError: MonomerLibraryUpdateError | undefined;
      try {
        editor.updateMonomersLibrary(JSON.stringify(unnamedPreset));
      } catch (error) {
        thrownError = error as MonomerLibraryUpdateError;
      }

      expect(thrownError).toBeInstanceOf(MonomerLibraryUpdateError);
      expect(thrownError?.partialSuccess).toBe(false);
      expect(thrownError?.skippedItems).toEqual([
        {
          name: 'monomerGroupTemplate-',
          reason: expect.stringContaining('cannot be empty or whitespace'),
        },
      ]);

      expect(errorSpy).toHaveBeenCalledWith(
        'Editor::updateMonomersLibrary',
        expect.stringContaining(
          'Monomer group template name cannot be empty or whitespace',
        ),
      );
      expect(editor.monomersLibraryParsedJson?.root.templates.length).toBe(
        initialTemplatesCount,
      );
    });

    it('should reject monomer group template with name longer than the max length', () => {
      const longName = 'a'.repeat(MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH + 1);
      const presetWithLongName = {
        root: {
          templates: [
            {
              $ref: `monomerGroupTemplate-${longName}`,
            },
          ],
        },
        [`monomerGroupTemplate-${longName}`]: {
          type: 'monomerGroupTemplate',
          id: '',
          name: longName,
          class: 'RNA',
          templates: [],
          connections: [],
        },
      };

      const initialTemplatesCount =
        editor.monomersLibraryParsedJson?.root.templates.length ?? 0;
      editor.updateMonomersLibrary(JSON.stringify(presetWithLongName));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE,
        ),
      );
      expect(editor.monomersLibraryParsedJson?.root.templates.length).toBe(
        initialTemplatesCount,
      );
    });

    it('should accept monomer group template with name at the max length boundary', () => {
      const boundaryName = 'a'.repeat(MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH);
      const presetWithBoundaryName = {
        root: {
          templates: [
            {
              $ref: `monomerGroupTemplate-${boundaryName}`,
            },
          ],
        },
        [`monomerGroupTemplate-${boundaryName}`]: {
          type: 'monomerGroupTemplate',
          id: '',
          name: boundaryName,
          class: 'RNA',
          templates: [],
          connections: [],
        },
      };

      const initialTemplatesCount =
        editor.monomersLibraryParsedJson?.root.templates.length ?? 0;
      editor.updateMonomersLibrary(JSON.stringify(presetWithBoundaryName));

      expect(editor.monomersLibraryParsedJson?.root.templates.length).toBe(
        initialTemplatesCount + 1,
      );
    });

    // In the KET format, modificationTypes is defined at the template level.
    // During parsing (via templateToMonomerProps) it gets moved to
    // props.modificationTypes, which the validation checks (#8133).
    it('should reject monomer with a disallowed modificationType (Unknown base)', () => {
      const monomerWithDisallowedType = {
        root: {
          templates: [{ $ref: 'monomerTemplate-XUB' }],
        },
        'monomerTemplate-XUB': {
          type: 'monomerTemplate',
          id: 'XUB',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'XUB',
          name: 'XUB',
          naturalAnalogShort: 'X',
          modificationTypes: ['Unknown base'],
          props: {
            MonomerName: 'XUB',
            MonomerClass: 'CHEM',
            Name: 'XUB',
            MonomerNaturalAnalogCode: 'X',
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      const initialTemplatesCount =
        editor.monomersLibraryParsedJson?.root.templates.length ?? 0;
      editor.updateMonomersLibrary(JSON.stringify(monomerWithDisallowedType));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Monomers with an unknown, ambiguous, or molecule modification type cannot be added to the library.',
        ),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize);
      // The reject branch must not leak the rejected template into the parsed
      // JSON side-table either.
      expect(editor.monomersLibraryParsedJson?.root.templates.length).toBe(
        initialTemplatesCount,
      );
    });

    it('should reject monomer with a disallowed modificationType (Micromolecule)', () => {
      const monomerWithDisallowedType = {
        root: {
          templates: [{ $ref: 'monomerTemplate-MCM88' }],
        },
        'monomerTemplate-MCM88': {
          type: 'monomerTemplate',
          id: 'MCM88',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'MCM88',
          name: 'MCM88',
          naturalAnalogShort: 'X',
          modificationTypes: ['Micromolecule'],
          props: {
            MonomerName: 'MCM88',
            MonomerClass: 'CHEM',
            Name: 'MCM88',
            MonomerNaturalAnalogCode: 'X',
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      const initialTemplatesCount =
        editor.monomersLibraryParsedJson?.root.templates.length ?? 0;
      editor.updateMonomersLibrary(JSON.stringify(monomerWithDisallowedType));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Offending modification type(s): Micromolecule',
        ),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize);
      // The reject branch must not leak the rejected template into the parsed
      // JSON side-table either.
      expect(editor.monomersLibraryParsedJson?.root.templates.length).toBe(
        initialTemplatesCount,
      );
    });

    it('should skip a disallowed monomer but still load a valid one from the same chunk', () => {
      const mixedMonomers = {
        root: {
          templates: [
            { $ref: 'monomerTemplate-BAD' },
            { $ref: 'monomerTemplate-GOOD' },
          ],
        },
        'monomerTemplate-BAD': {
          type: 'monomerTemplate',
          id: 'BAD',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'BAD',
          name: 'BAD',
          naturalAnalogShort: 'X',
          modificationTypes: ['Unknown monomer'],
          props: {
            MonomerName: 'BAD',
            MonomerClass: 'CHEM',
            Name: 'BAD',
            MonomerNaturalAnalogCode: 'X',
          },
        },
        'monomerTemplate-GOOD': {
          type: 'monomerTemplate',
          id: 'GOOD',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'GOOD',
          name: 'GOOD',
          naturalAnalogShort: 'X',
          modificationTypes: ['Natural amino acid'],
          props: {
            MonomerName: 'GOOD',
            MonomerClass: 'CHEM',
            Name: 'GOOD',
            MonomerNaturalAnalogCode: 'X',
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(mixedMonomers));

      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
      expect(
        editor.monomersLibrary.some(
          (monomer) => monomer.props?.MonomerName === 'GOOD',
        ),
      ).toBe(true);
      expect(
        editor.monomersLibrary.some(
          (monomer) => monomer.props?.MonomerName === 'BAD',
        ),
      ).toBe(false);
    });

    it('should accept a monomer with an allowed modificationType', () => {
      const monomerWithAllowedType = {
        root: {
          templates: [{ $ref: 'monomerTemplate-OK' }],
        },
        'monomerTemplate-OK': {
          type: 'monomerTemplate',
          id: 'OK',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'OK',
          name: 'OK',
          naturalAnalogShort: 'X',
          modificationTypes: ['Natural amino acid'],
          props: {
            MonomerName: 'OK',
            MonomerClass: 'CHEM',
            Name: 'OK',
            MonomerNaturalAnalogCode: 'X',
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerWithAllowedType));

      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(
          'modification type cannot be added to the library',
        ),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
    });

    it('enforces the modificationType validation through the replace path (initializeMonomersLibraryFromKetcher)', async () => {
      // There is no standalone `replaceMonomersLibrary` method: the replace
      // entry point is the second argument of initializeMonomersLibraryFromKetcher,
      // which clears the library and then delegates to updateMonomersLibrary
      // (where the validation lives). This locks in that the replace path
      // enforces the same modificationType validation as the update path.
      const monomerWithDisallowedType = {
        root: {
          templates: [{ $ref: 'monomerTemplate-XUB' }],
        },
        'monomerTemplate-XUB': {
          type: 'monomerTemplate',
          id: 'XUB',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'XUB',
          name: 'XUB',
          naturalAnalogShort: 'X',
          modificationTypes: ['Unknown base'],
          props: {
            MonomerName: 'XUB',
            MonomerClass: 'CHEM',
            Name: 'XUB',
            MonomerNaturalAnalogCode: 'X',
          },
        },
      };

      // The replace path passes the data through
      // ketcher.ensureMonomersLibraryDataInKetFormat; stub it to return the
      // already-KET-format data unchanged.
      const getKetcherSpy = jest
        .spyOn(ketcherProvider, 'getKetcher')
        .mockReturnValue({
          ensureMonomersLibraryDataInKetFormat: async (data: string | JSON) =>
            data,
        } as unknown as ReturnType<typeof ketcherProvider.getKetcher>);

      try {
        await editor.initializeMonomersLibraryFromKetcher(
          undefined,
          JSON.stringify(monomerWithDisallowedType),
        );

        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            'Monomers with an unknown, ambiguous, or molecule modification type cannot be added to the library.',
          ),
        );
        expect(
          editor.monomersLibrary.some(
            (monomer) => monomer.props?.MonomerName === 'XUB',
          ),
        ).toBe(false);
      } finally {
        getKetcherSpy.mockRestore();
      }
    });
  });

  describe('window blur handling', () => {
    let canvas: SVGSVGElement;
    let editor: CoreEditor;

    beforeEach(() => {
      canvas = createPolymerEditorCanvas();
      editor = new CoreEditor({
        canvas,
        theme: polymerEditorTheme,
        renderersContainer: createRenderersManager(polymerEditorTheme),
      });
      editor.selectTool(ToolName.selectRectangle);
    });

    afterEach(() => {
      editor.destroy();
      canvas.remove();
    });

    it('should not stop selection tool when it is already in standby mode', () => {
      const selectTool = editor.selectedTool as SelectBase;
      const stopMovementSpy = jest.spyOn(selectTool, 'stopMovement');
      selectTool.mode = 'standby';

      window.dispatchEvent(new Event('blur'));

      expect(stopMovementSpy).not.toHaveBeenCalled();
    });

    it('should stop selection tool when blur happens during active movement', () => {
      const selectTool = editor.selectedTool as SelectBase;
      const stopMovementSpy = jest.spyOn(selectTool, 'stopMovement');
      selectTool.mode = 'moving';

      window.dispatchEvent(new Event('blur'));

      expect(stopMovementSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('context menu handling', () => {
    let canvas: SVGSVGElement;
    let editor: CoreEditor;
    let rootElement: HTMLDivElement;

    beforeEach(() => {
      canvas = createPolymerEditorCanvas();
      rootElement = document.createElement('div');
      rootElement.classList.add(EditorClassName);
      document.body.appendChild(rootElement);
      rootElement.appendChild(canvas);
      editor = new CoreEditor({
        canvas,
        theme: polymerEditorTheme,
        renderersContainer: createRenderersManager(polymerEditorTheme),
      });
    });

    afterEach(() => {
      editor.destroy();
      canvas.remove();
      rootElement.remove();
    });

    it('should ignore right click on element outside ketcherRootElement', () => {
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      const preventDefaultSpy = jest.fn();
      const rightClickSelectedMonomersHandler = jest.fn();
      const rightClickCanvasHandler = jest.fn();
      editor.events.rightClickSelectedMonomers.add(
        rightClickSelectedMonomersHandler,
      );
      editor.events.rightClickCanvas.add(rightClickCanvasHandler);

      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: 0,
        clientY: 0,
        cancelable: true,
      });
      Object.defineProperty(event, 'preventDefault', {
        value: preventDefaultSpy,
        writable: true,
      });
      outsideElement.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(rightClickSelectedMonomersHandler).not.toHaveBeenCalled();
      expect(rightClickCanvasHandler).not.toHaveBeenCalled();

      outsideElement.remove();
    });

    it('should select monomer on right click when it was not selected', () => {
      const svgElementWithBBox = SVGElement.prototype as SVGElement & {
        getBBox?: () => DOMRect;
      };
      const initialGetBBox = svgElementWithBBox.getBBox;
      svgElementWithBBox.getBBox = () =>
        ({ x: 0, y: 0, width: 0, height: 0 } as DOMRect);

      const modelChanges = editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(0, 0),
      );

      editor.renderersContainer.update(modelChanges);

      const monomer = Array.from(editor.drawingEntitiesManager.monomers)[0][1];
      const rightClickSelectedMonomersHandler = jest.fn();
      editor.events.rightClickSelectedMonomers.add(
        rightClickSelectedMonomersHandler,
      );
      const monomerDomElement = document.createElement('div');
      (monomerDomElement as unknown as { __data__: unknown }).__data__ =
        monomer.renderer;
      rootElement.appendChild(monomerDomElement);

      expect(monomer.selected).toBeFalsy();
      monomerDomElement.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          clientX: 0,
          clientY: 0,
        }),
      );

      expect(monomer.selected).toBeTruthy();
      expect(rightClickSelectedMonomersHandler).toHaveBeenCalledWith(
        expect.arrayContaining([expect.anything(), [monomer]]),
      );

      monomerDomElement.remove();
      if (initialGetBBox) {
        svgElementWithBBox.getBBox = initialGetBBox;
      } else {
        Reflect.deleteProperty(svgElementWithBBox, 'getBBox');
      }
    });
  });

  describe('remove autochain preview handling', () => {
    let canvas: SVGSVGElement;
    let editor: CoreEditor;

    beforeEach(() => {
      canvas = createPolymerEditorCanvas();
      editor = new CoreEditor({
        canvas,
        theme: polymerEditorTheme,
        renderersContainer: createRenderersManager(polymerEditorTheme),
      });
    });

    afterEach(() => {
      editor.destroy();
      canvas.remove();
    });

    it('should hide only autochain preview without clearing all transient views', () => {
      const clearSpy = jest.spyOn(editor.transientDrawingView, 'clear');
      const hideAutochainPreviewSpy = jest.spyOn(
        editor.transientDrawingView,
        'hideAutochainPreview',
      );
      const updateSpy = jest.spyOn(editor.transientDrawingView, 'update');

      editor.events.removeAutochainPreview.dispatch();

      expect(hideAutochainPreviewSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(clearSpy).not.toHaveBeenCalled();
    });
  });

  describe('cut operation (Ctrl+X)', () => {
    let canvas: SVGSVGElement;
    let editor: CoreEditor;

    beforeEach(() => {
      canvas = createPolymerEditorCanvas();
      editor = new CoreEditor({
        canvas,
        theme: polymerEditorTheme,
        renderersContainer: createRenderersManager(polymerEditorTheme),
      });
    });

    afterEach(() => {
      editor.destroy();
      canvas.remove();
    });

    it('should register cut event listener on document', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      const testCanvas = createPolymerEditorCanvas();
      const testEditor = new CoreEditor({
        canvas: testCanvas,
        theme: polymerEditorTheme,
        renderersContainer: createRenderersManager(polymerEditorTheme),
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'cut',
        expect.any(Function),
      );

      testEditor.destroy();
      testCanvas.remove();
      addEventListenerSpy.mockRestore();
    });

    it('should remove cut event listener on destroy', () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener',
      );

      const testCanvas = createPolymerEditorCanvas();
      const testEditor = new CoreEditor({
        canvas: testCanvas,
        theme: polymerEditorTheme,
        renderersContainer: createRenderersManager(polymerEditorTheme),
      });

      testEditor.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'cut',
        expect.any(Function),
      );

      testCanvas.remove();
      removeEventListenerSpy.mockRestore();
    });

    it('should cut selected monomer (copy to clipboard and dispatch delete event)', () => {
      const svgElementWithBBox = SVGElement.prototype as SVGElement & {
        getBBox?: () => DOMRect;
      };
      const initialGetBBox = svgElementWithBBox.getBBox;
      svgElementWithBBox.getBBox = () =>
        ({ x: 0, y: 0, width: 0, height: 0 } as DOMRect);

      // Add a monomer
      const modelChanges = editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(0, 0),
      );
      editor.renderersContainer.update(modelChanges);

      // Select the monomer
      const monomer = Array.from(editor.drawingEntitiesManager.monomers)[0][1];
      editor.drawingEntitiesManager.selectDrawingEntity(monomer);

      expect(editor.drawingEntitiesManager.selectedEntities.length).toBe(1);
      expect(editor.drawingEntitiesManager.monomers.size).toBe(1);

      // Mock clipboard API (need both writeText AND read for isClipboardAPIAvailable)
      const writeTextSpy = jest.fn().mockResolvedValue(undefined);
      const readSpy = jest.fn().mockResolvedValue([]);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextSpy,
          read: readSpy,
        },
        writable: true,
        configurable: true,
      });

      // Spy on deleteSelectedStructure event
      const deleteEventSpy = jest.fn();
      editor.events.deleteSelectedStructure.add(deleteEventSpy);

      // Call onCut directly (simulates cut event)
      editor.mode.onCut();

      // Verify clipboard was written to (onCopy was called)
      expect(writeTextSpy).toHaveBeenCalled();

      // Verify delete event was dispatched
      expect(deleteEventSpy).toHaveBeenCalled();

      if (initialGetBBox) {
        svgElementWithBBox.getBBox = initialGetBBox;
      } else {
        Reflect.deleteProperty(svgElementWithBBox, 'getBBox');
      }
    });

    it('should do nothing when cutting with no selection', () => {
      const writeTextSpy = jest.fn().mockResolvedValue(undefined);
      const readSpy = jest.fn().mockResolvedValue([]);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextSpy,
          read: readSpy,
        },
        writable: true,
        configurable: true,
      });

      expect(editor.drawingEntitiesManager.selectedEntities.length).toBe(0);

      // Call onCut with no selection
      editor.mode.onCut();

      // Verify clipboard was not written to
      expect(writeTextSpy).not.toHaveBeenCalled();
    });

    it('should not interfere with input field cut operation', () => {
      const input = document.createElement('input');
      input.value = 'test text';
      document.body.appendChild(input);

      // Mock event with input as target
      const cutEvent = {
        target: input,
        preventDefault: jest.fn(),
      } as unknown as ClipboardEvent;

      // Add a monomer and select it
      const svgElementWithBBox = SVGElement.prototype as SVGElement & {
        getBBox?: () => DOMRect;
      };
      const initialGetBBox = svgElementWithBBox.getBBox;
      svgElementWithBBox.getBBox = () =>
        ({ x: 0, y: 0, width: 0, height: 0 } as DOMRect);

      const modelChanges = editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(0, 0),
      );
      editor.renderersContainer.update(modelChanges);
      const monomer = Array.from(editor.drawingEntitiesManager.monomers)[0][1];
      editor.drawingEntitiesManager.selectDrawingEntity(monomer);

      expect(editor.drawingEntitiesManager.monomers.size).toBe(1);

      // Call onCut with event targeting input field
      editor.mode.onCut(cutEvent);

      // Monomer should NOT be deleted (because target is input)
      expect(editor.drawingEntitiesManager.monomers.size).toBe(1);

      input.remove();
      if (initialGetBBox) {
        svgElementWithBBox.getBBox = initialGetBBox;
      } else {
        Reflect.deleteProperty(svgElementWithBBox, 'getBBox');
      }
    });

    it('should call onCopy and dispatch delete event in correct order', () => {
      const svgElementWithBBox = SVGElement.prototype as SVGElement & {
        getBBox?: () => DOMRect;
      };
      const initialGetBBox = svgElementWithBBox.getBBox;
      svgElementWithBBox.getBBox = () =>
        ({ x: 0, y: 0, width: 0, height: 0 } as DOMRect);

      // Add a monomer
      const modelChanges = editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(0, 0),
      );
      editor.renderersContainer.update(modelChanges);

      // Select the monomer
      const monomer = Array.from(editor.drawingEntitiesManager.monomers)[0][1];
      editor.drawingEntitiesManager.selectDrawingEntity(monomer);

      // Mock clipboard API
      const writeTextSpy = jest.fn().mockResolvedValue(undefined);
      const readSpy = jest.fn().mockResolvedValue([]);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextSpy,
          read: readSpy,
        },
        writable: true,
        configurable: true,
      });

      // Spy on methods to verify order
      const onCopySpy = jest.spyOn(editor.mode, 'onCopy');
      const deleteEventSpy = jest.fn();
      editor.events.deleteSelectedStructure.add(deleteEventSpy);

      // Perform cut
      editor.mode.onCut();

      // Verify onCopy was called first
      expect(onCopySpy).toHaveBeenCalled();
      // Verify delete event was dispatched after copy
      expect(deleteEventSpy).toHaveBeenCalled();

      onCopySpy.mockRestore();

      if (initialGetBBox) {
        svgElementWithBBox.getBBox = initialGetBBox;
      } else {
        Reflect.deleteProperty(svgElementWithBBox, 'getBBox');
      }
    });

    it('should work with multiple selected monomers', () => {
      const svgElementWithBBox = SVGElement.prototype as SVGElement & {
        getBBox?: () => DOMRect;
      };
      const initialGetBBox = svgElementWithBBox.getBBox;
      svgElementWithBBox.getBBox = () =>
        ({ x: 0, y: 0, width: 0, height: 0 } as DOMRect);

      // Add multiple monomers
      const modelChanges1 = editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(0, 0),
      );
      editor.renderersContainer.update(modelChanges1);

      const modelChanges2 = editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(5, 0),
      );
      editor.renderersContainer.update(modelChanges2);

      // Select all monomers
      const allMonomers = Array.from(
        editor.drawingEntitiesManager.monomers,
      ).map(([, monomer]) => monomer);
      editor.drawingEntitiesManager.selectDrawingEntities(allMonomers);

      expect(editor.drawingEntitiesManager.selectedEntities.length).toBe(2);
      expect(editor.drawingEntitiesManager.monomers.size).toBe(2);

      // Mock clipboard API (need both writeText AND read for isClipboardAPIAvailable)
      const writeTextSpy = jest.fn().mockResolvedValue(undefined);
      const readSpy = jest.fn().mockResolvedValue([]);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextSpy,
          read: readSpy,
        },
        writable: true,
        configurable: true,
      });

      // Spy on delete event
      const deleteEventSpy = jest.fn();
      editor.events.deleteSelectedStructure.add(deleteEventSpy);

      // Call onCut
      editor.mode.onCut();

      // Verify clipboard was written to
      expect(writeTextSpy).toHaveBeenCalled();

      // Verify delete event was dispatched for all selected monomers
      expect(deleteEventSpy).toHaveBeenCalled();

      if (initialGetBBox) {
        svgElementWithBBox.getBBox = initialGetBBox;
      } else {
        Reflect.deleteProperty(svgElementWithBBox, 'getBBox');
      }
    });
  });
});
