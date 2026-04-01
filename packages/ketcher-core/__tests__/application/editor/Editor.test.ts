import { CoreEditor, ToolName } from 'application/editor';
import { MonomerTool } from 'application/editor/tools/Monomer';
import { SelectBase } from 'application/editor/tools/select';
import { Vec2 } from 'domain/entities';
import { createPolymerEditorCanvas } from '../../helpers/dom';
import { peptideMonomerItem, polymerEditorTheme } from '../../mock-data';
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
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      canvas = createPolymerEditorCanvas();
      editor = new CoreEditor({
        canvas,
        theme: {},
      });
      errorSpy = jest.spyOn(KetcherLogger, 'error').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      errorSpy.mockRestore();
      consoleErrorSpy.mockRestore();
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
          aliasHELM: 'Chem1',
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
          aliasHELM: 'Chem2',
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
          aliasHELM: 'Chem3',
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

    it('should accept monomer with missing aliasHELM', () => {
      const monomerMissingHelm = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-CHEM3MISSINGHELM',
            },
          ],
        },
        'monomerTemplate-CHEM3MISSINGHELM': {
          type: 'monomerTemplate',
          id: 'CHEM3MISSINGHELM',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test Chem 3 Missing HELM',
          name: 'CHEM3MISSINGHELM',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'CHEM3MISSINGHELM',
            MonomerClass: 'CHEM',
            Name: 'CHEM3MISSINGHELM',
            MonomerNaturalAnalogCode: 'X',
          },
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerMissingHelm));

      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('invalid HELM alias value'),
      );
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('invalid HELM alias value'),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
    });

    it('should reject monomer with empty aliasHELM and log required message', () => {
      const monomerEmptyHelm = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-HELMEMPTY',
            },
          ],
        },
        'monomerTemplate-HELMEMPTY': {
          type: 'monomerTemplate',
          id: 'HELMEMPTY',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test empty HELM',
          name: 'HELMEMPTY',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'HELMEMPTY',
            MonomerClass: 'CHEM',
            Name: 'HELMEMPTY',
            MonomerNaturalAnalogCode: 'X',
          },
          aliasHELM: '',
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerEmptyHelm));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Load of "HELMEMPTY" monomer has failed/),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Load of "HELMEMPTY" monomer has failed/),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'The HELM alias must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*), spaces prohibited.',
        ),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize);
    });

    it('should reject monomer with whitespace-only aliasHELM', () => {
      const monomerWhitespaceHelm = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-HELMWS',
            },
          ],
        },
        'monomerTemplate-HELMWS': {
          type: 'monomerTemplate',
          id: 'HELMWS',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test whitespace HELM',
          name: 'HELMWS',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'HELMWS',
            MonomerClass: 'CHEM',
            Name: 'HELMWS',
            MonomerNaturalAnalogCode: 'X',
          },
          aliasHELM: '  \t  ',
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerWhitespaceHelm));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Load of "HELMWS" monomer has failed'),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize);
    });

    it('should reject monomer with disallowed characters in aliasHELM', () => {
      const monomerInvalidHelm = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-HELMINV',
            },
          ],
        },
        'monomerTemplate-HELMINV': {
          type: 'monomerTemplate',
          id: 'HELMINV',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test invalid HELM',
          name: 'HELMINV',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'HELMINV',
            MonomerClass: 'CHEM',
            Name: 'HELMINV',
            MonomerNaturalAnalogCode: 'X',
          },
          aliasHELM: 'bad alias',
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerInvalidHelm));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Load of "HELMINV" monomer has failed'),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize);
    });

    it('should accept monomer with valid aliasHELM', () => {
      const monomerValidHelm = {
        root: {
          templates: [
            {
              $ref: 'monomerTemplate-HELMOK',
            },
          ],
        },
        'monomerTemplate-HELMOK': {
          type: 'monomerTemplate',
          id: 'HELMOK',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Test valid HELM',
          name: 'HELMOK',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'HELMOK',
            MonomerClass: 'CHEM',
            Name: 'HELMOK',
            MonomerNaturalAnalogCode: 'X',
          },
          aliasHELM: 'Ab-12_x*',
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(monomerValidHelm));

      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Load of "HELMOK" monomer has failed'),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
    });

    it('should skip monomer with invalid HELM and still load others in the same chunk', () => {
      const chunk = {
        root: {
          templates: [
            { $ref: 'monomerTemplate-BADHELM' },
            { $ref: 'monomerTemplate-GOODHELM' },
          ],
        },
        'monomerTemplate-BADHELM': {
          type: 'monomerTemplate',
          id: 'BADHELM',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Bad',
          name: 'BADHELM',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'BADHELM',
            MonomerClass: 'CHEM',
            Name: 'BADHELM',
            MonomerNaturalAnalogCode: 'X',
          },
          aliasHELM: 'x@y',
        },
        'monomerTemplate-GOODHELM': {
          type: 'monomerTemplate',
          id: 'GOODHELM',
          class: 'CHEM',
          classHELM: 'CHEM',
          fullName: 'Good',
          name: 'GOODHELM',
          naturalAnalogShort: 'X',
          props: {
            MonomerName: 'GOODHELM',
            MonomerClass: 'CHEM',
            Name: 'GOODHELM',
            MonomerNaturalAnalogCode: 'X',
          },
          aliasHELM: 'G1',
        },
      };

      const initialLibrarySize = editor.monomersLibrary.length;
      editor.updateMonomersLibrary(JSON.stringify(chunk));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Load of "BADHELM" monomer has failed'),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Load of "BADHELM" monomer has failed'),
      );
      expect(editor.monomersLibrary.length).toBe(initialLibrarySize + 1);
      expect(
        editor.monomersLibrary.some(
          (m) =>
            !('isAmbiguous' in m && m.isAmbiguous) &&
            m.props.MonomerName === 'GOODHELM',
        ),
      ).toBe(true);
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
          aliasHELM: 'Chem4',
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
          aliasHELM: 'Chem5',
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
  });

  describe('window blur handling', () => {
    let canvas: SVGSVGElement;
    let editor: CoreEditor;

    beforeEach(() => {
      canvas = createPolymerEditorCanvas();
      editor = new CoreEditor({
        canvas,
        theme: {},
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
        theme: {},
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
});
