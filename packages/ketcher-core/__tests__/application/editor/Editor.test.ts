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
