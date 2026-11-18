import {
  CoreEditor,
  EditorHistory,
  FlexMode,
  SnakeMode,
} from 'application/editor';
import { resetEditorInstance } from 'application/editor/editorSingleton';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/types';
import { Coordinates } from 'application/editor/shared/coordinates';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { KetAmbiguousMonomerTemplateSubType } from 'application/formatters/types/ket';
import { SnakeLayoutCellWidth } from 'domain/constants';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { RNABase } from 'domain/entities/RNABase';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { KetMonomerClass } from 'domain/constants/monomers';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { Vec2 } from 'domain/entities';
import { replaceMonomer } from 'domain/entities/DrawingEntitiesManager.replaceMonomer';
import { getRnaBaseFromSugar } from 'domain/helpers/monomers';
import { AttachmentPointName } from 'domain/types';
import { coreEditorTheme, polymerEditorTheme } from '../../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

describe('Snake mode paired single nucleotides', () => {
  let editor: CoreEditor;
  let canvas: SVGSVGElement;
  let originalGetBBox: PropertyDescriptor | undefined;

  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
    );
    originalGetBBox = Object.getOwnPropertyDescriptor(
      SVGElement.prototype,
      'getBBox',
    );
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: vi.fn().mockReturnValue({ x: 0, y: 0, width: 12, height: 12 }),
    });
    canvas = createPolymerEditorCanvas();
    for (const dimension of ['width', 'height']) {
      Object.defineProperty(canvas, dimension, {
        configurable: true,
        value: { baseVal: { value: 500 } },
      });
    }
    editor = new CoreEditor({
      canvas,
      theme: coreEditorTheme,
      renderersContainer: createRenderersManager({
        ...polymerEditorTheme,
        monomer: {
          color: {
            ...polymerEditorTheme.monomer.color,
            R: { regular: 'blue' },
            P: { regular: 'pink' },
          },
        },
      }),
      mode: new FlexMode(),
    });
    await editor.ensureDefaultMonomersLibraryLoaded();
  });

  afterEach(() => {
    EditorHistory.getInstance(editor).destroy();
    resetEditorInstance();
    vi.unstubAllGlobals();
    if (originalGetBBox) {
      Object.defineProperty(SVGElement.prototype, 'getBBox', originalGetBBox);
    } else {
      Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
    }
    canvas.remove();
  });

  it('reuses the leftmost monomer edge and refreshes it after movement', () => {
    const nucleotide = Nucleotide.createOnCanvas('A', new Vec2(0, 0));
    if (!nucleotide) throw new Error('Unable to create nucleotide fixture');
    const manager = editor.drawingEntitiesManager;
    const renderers = editor.renderersContainer;
    renderers.update(nucleotide.modelChanges);
    const scans = vi.spyOn(manager.monomers, 'values');

    try {
      const originalEdge = renderers.leftmostMonomerEdge;
      expect(Number.isFinite(originalEdge)).toBe(true);
      expect(renderers.leftmostMonomerEdge).toBe(originalEdge);
      expect(scans).toHaveBeenCalledTimes(1);

      renderers.update(
        manager.createDrawingEntityMovingCommand(
          nucleotide.node.sugar,
          new Vec2(-10, 0),
        ),
      );
      scans.mockClear();

      const movedEdge = renderers.leftmostMonomerEdge;
      expect(movedEdge).toBeLessThan(originalEdge);
      expect(movedEdge).toBe(
        nucleotide.node.sugar.renderer?.scaledMonomerPosition.x,
      );
      expect(renderers.leftmostMonomerEdge).toBe(movedEdge);
      expect(scans).toHaveBeenCalledTimes(1);

      const moveBack = manager.moveMonomer(
        nucleotide.node.sugar,
        new Vec2(0, 0),
      );
      moveBack.operations[0].execute(renderers);
      expect(renderers.leftmostMonomerEdge).toBe(originalEdge);
      moveBack.operations[0].invert(renderers);
      expect(renderers.leftmostMonomerEdge).toBe(movedEdge);
    } finally {
      scans.mockRestore();
    }
  });

  it.each([false, true])(
    'staggers strands and joins facing phosphate edges when the sense base is ambiguous: %s',
    (ambiguous) => {
      const sense = Nucleotide.createOnCanvas('A', new Vec2(0, 0));
      const antisense = Nucleotide.createOnCanvas('A', new Vec2(4, 4));
      if (!sense || !antisense) {
        throw new Error('Unable to create nucleotide fixtures');
      }
      const manager = editor.drawingEntitiesManager;
      editor.renderersContainer.update(sense.modelChanges);
      editor.renderersContainer.update(antisense.modelChanges);
      if (ambiguous) {
        const guanine = getRnaPartLibraryItem(
          editor,
          'G',
          KetMonomerClass.Base,
        );
        if (!guanine) throw new Error('Unable to find guanine');
        const replacement = replaceMonomer(manager, sense.node.rnaBase, {
          id: 'A-or-G',
          label: 'R',
          isAmbiguous: true,
          subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
          options: [{ templateId: 'A' }, { templateId: 'G' }],
          monomers: [sense.node.rnaBase, new RNABase(guanine)],
        });
        editor.renderersContainer.update(replacement);
      }
      const senseBase = getRnaBaseFromSugar(sense.node.sugar);
      if (!senseBase) throw new Error('Unable to find the sense base');
      const baseConnection = manager.createPolymerBond(
        senseBase,
        antisense.node.rnaBase,
        AttachmentPointName.R1,
        AttachmentPointName.R1,
        MACROMOLECULES_BOND_TYPES.HYDROGEN,
      );
      const phosphateConnection = manager.createPolymerBond(
        sense.node.phosphate,
        antisense.node.phosphate,
        AttachmentPointName.R1,
        AttachmentPointName.R1,
        MACROMOLECULES_BOND_TYPES.HYDROGEN,
      );
      editor.renderersContainer.update(baseConnection);
      editor.renderersContainer.update(phosphateConnection);
      editor.setMode(new SnakeMode());
      const command = manager.applySnakeLayout(true);
      editor.renderersContainer.update(command);

      const sensePosition = Coordinates.modelToCanvas(
        sense.node.phosphate.position,
      );
      const antisensePosition = Coordinates.modelToCanvas(
        antisense.node.phosphate.position,
      );
      expect(antisensePosition.x - sensePosition.x).toBeCloseTo(
        SnakeLayoutCellWidth * 0.7,
      );
      const phosphateBond = [...manager.polymerBonds.values()].find(
        (bond) =>
          bond instanceof HydrogenBond &&
          bond.firstMonomer === sense.node.phosphate,
      );
      const renderer = phosphateBond?.renderer;
      if (!(renderer instanceof SnakeModePolymerBondRenderer)) {
        throw new Error('Missing Snake phosphate bond renderer');
      }
      const path = renderer.bodyElement?.attr('d');
      expect(path).toBeDefined();
      const senseRenderer = sense.node.phosphate.renderer;
      const antisenseRenderer = antisense.node.phosphate.renderer;
      if (!senseRenderer || !antisenseRenderer)
        throw new Error('Missing phosphate renderer');
      const startX =
        senseRenderer.scaledMonomerPosition.x + senseRenderer.monomerSize.width;
      const endX = antisenseRenderer.scaledMonomerPosition.x;
      const startY = senseRenderer.center.y;
      const endY = antisenseRenderer.center.y;
      const turnX = (startX + endX) / 2;
      expect(path).toBe(
        `M ${startX},${startY} L ${turnX - 5},${startY} q 5,0 5,5 L ${turnX},${endY - 5} q 0,5 5,5 L ${endX},${endY}`,
      );
      expect(manager.monomers.size).toBe(6);
      expect(manager.polymerBonds.size).toBe(6);

      const matrix = manager.canvasMatrix;
      if (!matrix) throw new Error('Missing Snake canvas matrix');
      const chainMapGetter = vi.spyOn(
        matrix.chainsCollection,
        'monomerToChain',
        'get',
      );
      try {
        renderer.getSideConnectionEndpointAngle(sense.node.phosphate);
        renderer.getSideConnectionEndpointAngle(antisense.node.phosphate);
        renderer.show();
        expect(renderer.bodyElement?.attr('d')).toBe(path);
        expect(chainMapGetter).not.toHaveBeenCalled();
      } finally {
        chainMapGetter.mockRestore();
      }
    },
  );
});
