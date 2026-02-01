import { CoreEditor, ToolName } from 'application/editor';
import { MonomerTool } from 'application/editor/tools/Monomer';
import { createPolymerEditorCanvas } from '../../helpers/dom';
import { KetcherLogger } from 'utilities';

describe('CoreEditor', () => {
  it('should track dom events and trigger handlers', () => {
    const canvas = createPolymerEditorCanvas();
    const editor: CoreEditor = new CoreEditor({
      canvas,
      theme: {},
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
        theme: {},
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
      expect(() =>
        editor.updateMonomersLibrary(JSON.stringify(monomerWithoutBase)),
      ).toThrow(/Base IDT alias is required/);

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

    it('should throw on HELM alias collision across monomers', () => {
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
      ).toThrow(/Alias collision detected/);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Alias collision detected'),
      );
    });

    it('should throw on IDT alias collision across monomers', () => {
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
      ).toThrow(/Alias collision detected/);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Alias collision detected'),
      );
    });
  });
});
