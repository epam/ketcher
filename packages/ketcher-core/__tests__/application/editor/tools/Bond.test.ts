import { CoreEditor, FlexMode, SnakeMode } from 'application/editor';
import { PolymerBond } from 'application/editor/tools/Bond';
import { ToolName } from 'application/editor/tools/types';
import { Atom } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';
import { AtomLabel } from 'domain/constants';
import { Vec2 } from 'domain/entities/vec2';
import { BondRenderer } from 'application/render/renderers/BondRenderer';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { Peptide } from 'domain/entities/Peptide';
import { PeptideRenderer } from 'application/render/renderers/PeptideRenderer';
import { Command } from 'domain/entities/Command';
import { AttachmentPointName } from 'domain/types';
import { PolymerBondRendererFactory } from 'application/render/renderers/PolymerBondRenderer/PolymerBondRendererFactory';
import {
  coreEditorTheme,
  polymerEditorTheme,
  peptideMonomerItem,
} from '../../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe.each([
  ['Flex', FlexMode],
  ['Snake', SnakeMode],
] as const)('%s connection drawing', (_name, Mode) => {
  const originalGetBBox = SVGElement.prototype.getBBox;
  let editor: CoreEditor;
  let tool: PolymerBond;
  let monomer: Peptide;
  let bond: Bond;
  let bondRenderer: BondRenderer;

  beforeEach(() => {
    editor = new CoreEditor({
      theme: coreEditorTheme,
      canvas: createPolymerEditorCanvas(),
      renderersContainer: createRenderersManager(polymerEditorTheme),
      mode: new Mode(),
    });
    jest
      .spyOn(editor.renderersContainer, 'update')
      .mockImplementation((command) => {
        command?.operations.forEach((operation) => {
          if (operation.polymerBond && !operation.polymerBond.renderer) {
            PolymerBondRendererFactory.createInstance(operation.polymerBond);
          }
        });
      });
    monomer = new Peptide(peptideMonomerItem);
    monomer.setChosenFirstAttachmentPoint(AttachmentPointName.R2);
    new PeptideRenderer(monomer);
    bond = new Bond(
      new Atom(new Vec2(), monomer, 0, AtomLabel.C),
      new Atom(new Vec2(1, 0), monomer, 1, AtomLabel.C),
      0,
    );
    bondRenderer = new BondRenderer(bond);
    jest
      .spyOn(bondRenderer, 'getSelectionPoints')
      .mockReturnValue(
        Array.from({ length: 8 }, (_, index) => new Vec2(index, 0)),
      );
    editor.drawingEntitiesManager.bonds.set(bond.id, bond);
    editor.selectTool(ToolName.bondSingle, { toolName: ToolName.bondSingle });
    tool = editor.selectedTool as PolymerBond;
  });

  afterEach(() => {
    editor.destroy();
    document.body.innerHTML = '';
    jest.restoreAllMocks();

    if (originalGetBBox) {
      Object.defineProperty(SVGElement.prototype, 'getBBox', {
        configurable: true,
        value: originalGetBBox,
      });
    } else {
      Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
    }
  });

  const startDrawing = () => {
    const target = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    Object.assign(target, { __data__: monomer.renderer });
    tool.mousedown({ target } as unknown as MouseEvent);
    expect(editor.canvas.hasAttribute('data-drawing-connection')).toBe(true);
  };

  it('clears existing atomic bond hover when drawing starts', () => {
    bond.turnOnHover();
    bondRenderer.redrawHover();
    expect(editor.canvas.querySelector('.dynamic-element')).not.toBeNull();
    const clearHover = jest.spyOn(bond, 'turnOffHover');

    startDrawing();

    expect(bond.hovered).toBe(false);
    expect(clearHover).toHaveBeenCalledTimes(1);
    expect(editor.canvas.querySelector('.dynamic-element')).toBeNull();
  });

  it.each(['mouseup', 'destroy', 'switch', 'editor destroy', 'modal cancel'])(
    'restores atomic bond interaction after %s',
    (action) => {
      startDrawing();
      const clearHover = jest.spyOn(bond, 'turnOffHover');
      if (action === 'switch') {
        editor.selectTool(ToolName.selectRectangle);
      } else if (action === 'editor destroy') {
        editor.destroy();
      } else if (action === 'modal cancel') {
        tool.handleBondCreationCancellation(monomer);
      } else if (action === 'mouseup') {
        tool.mouseup();
      } else {
        tool.destroy();
      }
      expect(editor.canvas.hasAttribute('data-drawing-connection')).toBe(false);
      expect(clearHover).not.toHaveBeenCalled();
      bondRenderer.appendHover();
      expect(editor.canvas.querySelector('.dynamic-element')).not.toBeNull();
    },
  );

  it('restores atomic bond interaction after atom connection completion', () => {
    startDrawing();
    const clearHover = jest.spyOn(bond, 'turnOffHover');
    jest
      .spyOn(editor.drawingEntitiesManager, 'addMonomerToAtomBond')
      .mockReturnValue(new Command());
    const target = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    Object.assign(target, { __data__: { atom: bond.firstAtom } });

    tool.mouseUpAtom({ target } as unknown as MouseEvent);

    expect(
      editor.drawingEntitiesManager.addMonomerToAtomBond,
    ).toHaveBeenCalled();
    expect(editor.canvas.hasAttribute('data-drawing-connection')).toBe(false);
    expect(clearHover).not.toHaveBeenCalled();
  });

  it.each(['mouseup', 'destroy'] as const)(
    'clears stale drawing state on %s without a temporary renderer or clearing atomic hover',
    (action) => {
      editor.canvas.setAttribute('data-drawing-connection', '');
      bond.turnOnHover();
      bondRenderer.redrawHover();
      const cancel = jest.spyOn(
        editor.drawingEntitiesManager,
        'cancelPolymerBondCreation',
      );
      const clearHover = jest.spyOn(bond, 'turnOffHover');

      tool[action]();

      expect(editor.canvas.hasAttribute('data-drawing-connection')).toBe(false);
      expect(cancel).not.toHaveBeenCalled();
      expect(clearHover).not.toHaveBeenCalled();
      expect(bond.hovered).toBe(true);
      expect(editor.canvas.querySelector('.dynamic-element')).not.toBeNull();
    },
  );

  it('can clean up the tool and then destroy the editor without cancelling twice', () => {
    startDrawing();
    const cancel = jest.spyOn(
      editor.drawingEntitiesManager,
      'cancelPolymerBondCreation',
    );

    tool.destroy();
    tool.destroy();
    editor.destroy();

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(editor.canvas.hasAttribute('data-drawing-connection')).toBe(false);
    expect(editor.drawingEntitiesManager.polymerBonds.size).toBe(0);
    expect(bond.hovered).toBe(false);
  });

  it('keeps carbon atom highlighting and atom connection events functional', () => {
    SVGElement.prototype.getBBox = jest.fn().mockReturnValue({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
    const atomRenderer = new AtomRenderer(bond.firstAtom);
    atomRenderer.show();
    const atomElement = editor.canvas.querySelector('[data-testid="atom"]');
    expect(atomElement).not.toBeNull();
    const showHover = jest.spyOn(atomRenderer, 'showHover');
    const mouseUpAtom = jest.spyOn(tool, 'mouseUpAtom');

    startDrawing();
    atomElement?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    atomElement?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(showHover).toHaveBeenCalled();
    expect(mouseUpAtom).toHaveBeenCalled();
    expect(editor.canvas.hasAttribute('data-drawing-connection')).toBe(false);
  });
});
