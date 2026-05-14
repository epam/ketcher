import { CoreEditor, ToolName } from 'application/editor';
import { MonomerTool } from 'application/editor/tools/Monomer';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import { SelectBase } from 'application/editor/tools/select';
import { Vec2 } from 'domain/entities';
import { peptideMonomerItem, polymerEditorTheme } from '../../mock-data';
import {
  KetcherLogger,
  MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH,
  MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE,
} from 'utilities';

describe('CoreEditor', () => {
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
      editor.updateMonomersLibrary(JSON.stringify(monomerWithoutBase));

      expect(errorSpy).toHaveBeenCalledWith(
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

      editor.updateMonomersLibrary(JSON.stringify(monomerWithAliasCollision));
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Alias collision detected'),
      );
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
      editor.updateMonomersLibrary(JSON.stringify(monomersWithMixedAliases));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Load of "SUGAR3" monomer has failed, monomer definition contains invalid HELM alias value.',
        ),
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

      editor.updateMonomersLibrary(JSON.stringify(monomerWithIdtCollision));
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Alias collision detected'),
      );
    });

    it('should skip monomer with duplicate IDT position alias in the same library update', () => {
      const monomersWithDuplicatePositionIdtAlias = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-RNA1',
            },
            {
              $ref: 'monomerTemplate-RNA2',
            },
          ],
        },
        'monomerTemplate-RNA1': {
          type: 'monomerTemplate',
          id: 'RNA1',
          class: 'RNA',
          classHELM: 'RNA',
          fullName: 'Test RNA 1',
          name: 'RNA1',
          naturalAnalogShort: 'A',
          props: {
            MonomerName: 'RNA1',
            MonomerClass: 'RNA',
            Name: 'RNA1',
            MonomerNaturalAnalogCode: 'A',
          },
          idtAliases: {
            base: 'RNA1Base',
            modifications: {
              endpoint3: '/same_ep3/',
            },
          },
        },
        'monomerTemplate-RNA2': {
          type: 'monomerTemplate',
          id: 'RNA2',
          class: 'RNA',
          classHELM: 'RNA',
          fullName: 'Test RNA 2',
          name: 'RNA2',
          naturalAnalogShort: 'A',
          props: {
            MonomerName: 'RNA2',
            MonomerClass: 'RNA',
            Name: 'RNA2',
            MonomerNaturalAnalogCode: 'A',
          },
          idtAliases: {
            base: 'RNA2Base',
            modifications: {
              endpoint3: '/same_ep3/',
            },
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(
        JSON.stringify(monomersWithDuplicatePositionIdtAlias),
      );

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Alias collision detected for monomer RNA2'),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
      expect(
        editor.monomersLibrary.find(
          (monomer) => monomer.props?.MonomerName === 'RNA1',
        ),
      ).toBeDefined();
      expect(
        editor.monomersLibrary.find(
          (monomer) => monomer.props?.MonomerName === 'RNA2',
        ),
      ).toBeUndefined();
    });

    it('should validate shorthand IDT position aliases from converted SDF data', () => {
      const monomersWithShorthandIdtAliases = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-RNA3',
            },
            {
              $ref: 'monomerTemplate-RNA4',
            },
            {
              $ref: 'monomerTemplate-RNA5',
            },
            {
              $ref: 'monomerTemplate-RNA6',
            },
            {
              $ref: 'monomerTemplate-RNA7',
            },
            {
              $ref: 'monomerTemplate-RNA8',
            },
          ],
        },
        'monomerTemplate-RNA3': {
          type: 'monomerTemplate',
          id: 'RNA3',
          class: 'RNA',
          classHELM: 'RNA',
          fullName: 'Test RNA 3',
          name: 'RNA3',
          naturalAnalogShort: 'A',
          props: {
            MonomerName: 'RNA3',
            MonomerClass: 'RNA',
            Name: 'RNA3',
            MonomerNaturalAnalogCode: 'A',
          },
          idtAliases: {
            base: 'RNA3Base',
            modifications: {
              ep3: '/same_sdf_ep3/',
            },
          },
        },
        'monomerTemplate-RNA4': {
          type: 'monomerTemplate',
          id: 'RNA4',
          class: 'RNA',
          classHELM: 'RNA',
          fullName: 'Test RNA 4',
          name: 'RNA4',
          naturalAnalogShort: 'A',
          props: {
            MonomerName: 'RNA4',
            MonomerClass: 'RNA',
            Name: 'RNA4',
            MonomerNaturalAnalogCode: 'A',
          },
          idtAliases: {
            base: 'RNA4Base',
            modifications: {
              ep3: '/same_sdf_ep3/',
            },
          },
        },
        'monomerTemplate-RNA5': {
          type: 'monomerTemplate',
          id: 'RNA5',
          class: 'RNA',
          classHELM: 'RNA',
          fullName: 'Test RNA 5',
          name: 'RNA5',
          naturalAnalogShort: 'A',
          props: {
            MonomerName: 'RNA5',
            MonomerClass: 'RNA',
            Name: 'RNA5',
            MonomerNaturalAnalogCode: 'A',
          },
          idtAliases: {
            base: 'RNA5Base',
            modifications: {
              ep5: '/same_sdf_ep5/',
            },
          },
        },
        'monomerTemplate-RNA6': {
          type: 'monomerTemplate',
          id: 'RNA6',
          class: 'RNA',
          classHELM: 'RNA',
          fullName: 'Test RNA 6',
          name: 'RNA6',
          naturalAnalogShort: 'A',
          props: {
            MonomerName: 'RNA6',
            MonomerClass: 'RNA',
            Name: 'RNA6',
            MonomerNaturalAnalogCode: 'A',
          },
          idtAliases: {
            base: 'RNA6Base',
            modifications: {
              ep5: '/same_sdf_ep5/',
            },
          },
        },
        'monomerTemplate-RNA7': {
          type: 'monomerTemplate',
          id: 'RNA7',
          class: 'RNA',
          classHELM: 'RNA',
          fullName: 'Test RNA 7',
          name: 'RNA7',
          naturalAnalogShort: 'A',
          props: {
            MonomerName: 'RNA7',
            MonomerClass: 'RNA',
            Name: 'RNA7',
            MonomerNaturalAnalogCode: 'A',
          },
          idtAliases: {
            base: 'RNA7Base',
            modifications: {
              i: '/same_sdf_internal/',
            },
          },
        },
        'monomerTemplate-RNA8': {
          type: 'monomerTemplate',
          id: 'RNA8',
          class: 'RNA',
          classHELM: 'RNA',
          fullName: 'Test RNA 8',
          name: 'RNA8',
          naturalAnalogShort: 'A',
          props: {
            MonomerName: 'RNA8',
            MonomerClass: 'RNA',
            Name: 'RNA8',
            MonomerNaturalAnalogCode: 'A',
          },
          idtAliases: {
            base: 'RNA8Base',
            modifications: {
              i: '/same_sdf_internal/',
            },
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(
        JSON.stringify(monomersWithShorthandIdtAliases),
      );

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Alias collision detected for monomer RNA4'),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Alias collision detected for monomer RNA6'),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Alias collision detected for monomer RNA8'),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 3);
      expect(
        editor.monomersLibrary.find(
          (monomer) => monomer.props?.MonomerName === 'RNA4',
        ),
      ).toBeUndefined();
      expect(
        editor.monomersLibrary.find(
          (monomer) => monomer.props?.MonomerName === 'RNA6',
        ),
      ).toBeUndefined();
      expect(
        editor.monomersLibrary.find(
          (monomer) => monomer.props?.MonomerName === 'RNA8',
        ),
      ).toBeUndefined();
    });

    it('should reject preset with idtAliases but no base alias and still load valid preset', () => {
      const presetsWithMixedIdtAliases = {
        root: {
          templates: [
            {
              $ref: 'monomerGroupTemplate-InvalidPresetIdtAlias',
            },
            {
              $ref: 'monomerGroupTemplate-ValidPresetIdtAlias',
            },
          ],
        },
        'monomerGroupTemplate-InvalidPresetIdtAlias': {
          type: 'monomerGroupTemplate',
          id: 'InvalidPresetIdtAlias',
          name: 'Invalid Preset IDT Alias',
          class: 'RNA',
          templates: [],
          connections: [],
          idtAliases: {
            modifications: {
              endpoint5: '/invalid_preset_ep5/',
            },
          },
        },
        'monomerGroupTemplate-ValidPresetIdtAlias': {
          type: 'monomerGroupTemplate',
          id: 'ValidPresetIdtAlias',
          name: 'Valid Preset IDT Alias',
          class: 'RNA',
          templates: [],
          connections: [],
          idtAliases: {
            base: 'ValidPresetBase',
            modifications: {
              endpoint5: '/valid_preset_ep5/',
            },
          },
        },
      };

      const initialTemplatesCount =
        editor.monomersLibraryParsedJson?.root.templates.length ?? 0;
      editor.updateMonomersLibrary(JSON.stringify(presetsWithMixedIdtAliases));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Base IDT alias is required when idtAliases is defined for preset Invalid Preset IDT Alias',
        ),
      );
      expect(editor.monomersLibraryParsedJson?.root.templates.length).toBe(
        initialTemplatesCount + 1,
      );
      expect(
        editor.monomersLibraryParsedJson?.[
          'monomerGroupTemplate-InvalidPresetIdtAlias'
        ],
      ).toBeUndefined();
      expect(
        editor.monomersLibraryParsedJson?.[
          'monomerGroupTemplate-ValidPresetIdtAlias'
        ],
      ).toBeDefined();
    });

    it('should skip preset with duplicate IDT position alias in the same library update', () => {
      const presetsWithDuplicateIdtAliases = {
        root: {
          templates: [
            {
              $ref: 'monomerGroupTemplate-PresetWithUniqueInternalAlias',
            },
            {
              $ref: 'monomerGroupTemplate-PresetWithDuplicateInternalAlias',
            },
          ],
        },
        'monomerGroupTemplate-PresetWithUniqueInternalAlias': {
          type: 'monomerGroupTemplate',
          id: 'PresetWithUniqueInternalAlias',
          name: 'Preset With Unique Internal Alias',
          class: 'RNA',
          templates: [],
          connections: [],
          idtAliases: {
            base: 'PresetInternalBase1',
            modifications: {
              internal: '/same_preset_internal/',
            },
          },
        },
        'monomerGroupTemplate-PresetWithDuplicateInternalAlias': {
          type: 'monomerGroupTemplate',
          id: 'PresetWithDuplicateInternalAlias',
          name: 'Preset With Duplicate Internal Alias',
          class: 'RNA',
          templates: [],
          connections: [],
          idtAliases: {
            base: 'PresetInternalBase2',
            modifications: {
              internal: '/same_preset_internal/',
            },
          },
        },
      };

      const initialTemplatesCount =
        editor.monomersLibraryParsedJson?.root.templates.length ?? 0;
      editor.updateMonomersLibrary(
        JSON.stringify(presetsWithDuplicateIdtAliases),
      );

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Alias collision detected for preset Preset With Duplicate Internal Alias',
        ),
      );
      expect(editor.monomersLibraryParsedJson?.root.templates.length).toBe(
        initialTemplatesCount + 1,
      );
      expect(
        editor.monomersLibraryParsedJson?.[
          'monomerGroupTemplate-PresetWithUniqueInternalAlias'
        ],
      ).toBeDefined();
      expect(
        editor.monomersLibraryParsedJson?.[
          'monomerGroupTemplate-PresetWithDuplicateInternalAlias'
        ],
      ).toBeUndefined();
    });

    it('should skip preset with IDT position alias colliding with monomer', () => {
      const monomerWithEndpoint5Alias = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-RNA5',
            },
          ],
        },
        'monomerTemplate-RNA5': {
          type: 'monomerTemplate',
          id: 'RNA5',
          class: 'RNA',
          classHELM: 'RNA',
          fullName: 'Test RNA 5',
          name: 'RNA5',
          naturalAnalogShort: 'A',
          props: {
            MonomerName: 'RNA5',
            MonomerClass: 'RNA',
            Name: 'RNA5',
            MonomerNaturalAnalogCode: 'A',
          },
          idtAliases: {
            base: 'RNA5Base',
            modifications: {
              endpoint5: '/same_monomer_preset_ep5/',
            },
          },
        },
      };
      const presetWithCollidingEndpoint5Alias = {
        root: {
          templates: [
            {
              $ref: 'monomerGroupTemplate-PresetWithCollidingEndpoint5Alias',
            },
          ],
        },
        'monomerGroupTemplate-PresetWithCollidingEndpoint5Alias': {
          type: 'monomerGroupTemplate',
          id: 'PresetWithCollidingEndpoint5Alias',
          name: 'Preset With Colliding Endpoint5 Alias',
          class: 'RNA',
          templates: [],
          connections: [],
          idtAliases: {
            base: 'PresetEndpoint5Base',
            modifications: {
              endpoint5: '/same_monomer_preset_ep5/',
            },
          },
        },
      };

      editor.updateMonomersLibrary(JSON.stringify(monomerWithEndpoint5Alias));
      const templatesCountAfterMonomer =
        editor.monomersLibraryParsedJson?.root.templates.length ?? 0;
      editor.updateMonomersLibrary(
        JSON.stringify(presetWithCollidingEndpoint5Alias),
      );

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Alias collision detected for preset Preset With Colliding Endpoint5 Alias',
        ),
      );
      expect(editor.monomersLibraryParsedJson?.root.templates.length).toBe(
        templatesCountAfterMonomer,
      );
      expect(
        editor.monomersLibraryParsedJson?.[
          'monomerGroupTemplate-PresetWithCollidingEndpoint5Alias'
        ],
      ).toBeUndefined();
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
      editor.updateMonomersLibrary(JSON.stringify(unnamedPreset));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Monomer group template name cannot be empty or whitespace for template monomerGroupTemplate-',
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
      document.body.appendChild(monomerDomElement);

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
