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
  });
});
