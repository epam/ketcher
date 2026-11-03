import { CoreEditor, FlexMode } from 'application/editor';
import { provideEditorSettings } from 'application/editor/editorSettings';
import ZoomTool from 'application/editor/tools/Zoom';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import {
  type IKetTemplateConnection,
  KetConnectionType,
} from 'application/formatters/types/ket';
import { ZoomTransform } from 'd3';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { KetMonomerClass } from 'domain/constants/monomers';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { AttachmentPointName } from 'domain/types';
import {
  addPeptide,
  bondPeptides,
  createEditor,
  deserializeKet,
  ETHANE_KET,
} from './drawingEntitiesManager.editorReads.helpers';

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest.fn().mockReturnValue({
  x: 0,
  y: 0,
  width: 12,
  height: 12,
});

const DEFAULT_SCALE = 40;
const NON_DEFAULT_SCALE = 20;

// Template ids of the library monomers the presets below are made of.
const RIBOSE = 'monomerTemplate-R___Ribose';
const ADENINE = 'monomerTemplate-A___Adenine';
const PHOSPHATE = 'monomerTemplate-P___Phosphate';

const baseToSugar: IKetTemplateConnection = {
  connectionType: KetConnectionType.SINGLE,
  endpoint1: { templateId: ADENINE, attachmentPointId: AttachmentPointName.R1 },
  endpoint2: { templateId: RIBOSE, attachmentPointId: AttachmentPointName.R3 },
};

const sugarToPhosphate = (
  sugarPoint: AttachmentPointName,
  phosphatePoint: AttachmentPointName,
): IKetTemplateConnection => ({
  connectionType: KetConnectionType.SINGLE,
  endpoint1: { templateId: RIBOSE, attachmentPointId: sugarPoint },
  endpoint2: { templateId: PHOSPHATE, attachmentPointId: phosphatePoint },
});

const partnerOf = (monomer: BaseMonomer, point: AttachmentPointName) => {
  const bond = monomer.attachmentPointsToBonds[point];

  return bond instanceof PolymerBond
    ? bond.getAnotherMonomer(monomer)
    : undefined;
};

describe('DrawingEntitiesManager reads of helpers, coordinates and the sequence view', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  const open = () => {
    ({ canvas, editor } = createEditor(new FlexMode()));

    return editor.drawingEntitiesManager;
  };

  const libraryItem = (label: string, monomerClass: KetMonomerClass) => {
    const item = getRnaPartLibraryItem(editor, label, monomerClass);

    if (!item) {
      throw new Error(`Fixture setup failed: ${label} not found`);
    }

    return item;
  };

  afterEach(() => {
    jest.restoreAllMocks();
    provideEditorSettings().macroModeScale = DEFAULT_SCALE;
    ZoomTool.instance.setZoomTransform(new ZoomTransform(1, 0, 0));
    editor.destroy();
    canvas.remove();
  });

  describe('sequence view', () => {
    // Three peptides in one chain, and one molecule of 2 atoms (a fourth
    // monomer to the manager).
    const buildChainAndMolecule = () => {
      const dem = open();
      deserializeKet(ETHANE_KET).mergeInto(dem);
      const a = addPeptide(editor, 'A', 0, 5);
      const b = addPeptide(editor, 'A', 3, 5);
      const c = addPeptide(editor, 'A', 6, 5);
      bondPeptides(editor, a, b);
      bondPeptides(editor, b, c);

      return dem;
    };

    it('shows the returned chains once, after the molecules are redrawn', () => {
      const dem = buildChainAndMolecule();
      // The real view needs a sequence-mode canvas; only the call is pinned.
      const show = jest
        .spyOn(SequenceRenderer, 'show')
        .mockImplementation(() => undefined);
      const addAtom = jest.spyOn(editor.renderersContainer, 'addAtom');

      const chains = dem.applyMonomersSequenceLayout();

      expect(chains.chains).toHaveLength(1);
      expect(show).toHaveBeenCalledTimes(1);
      expect(show.mock.calls[0][0]).toBe(chains);
      expect(addAtom).toHaveBeenCalledTimes(2);
      expect(show.mock.invocationCallOrder[0]).toBeGreaterThan(
        addAtom.mock.invocationCallOrder[1],
      );
    });

    it('clears the sequence view only after every drawn entity is deleted', () => {
      const dem = buildChainAndMolecule();
      const container = editor.renderersContainer;
      const deletes = [
        jest.spyOn(container, 'deleteMonomer'),
        jest.spyOn(container, 'deletePolymerBond'),
        jest.spyOn(container, 'deleteAtom'),
        jest.spyOn(container, 'deleteBond'),
      ];
      const clear = jest.spyOn(SequenceRenderer, 'clear');

      dem.clearCanvas();

      expect(clear).toHaveBeenCalledTimes(1);
      const lastDelete = Math.max(
        ...deletes.flatMap((spy) => spy.mock.invocationCallOrder),
      );
      expect(deletes.map((spy) => spy.mock.calls.length)).toEqual([4, 2, 2, 1]);
      expect(clear.mock.invocationCallOrder[0]).toBeGreaterThan(lastDelete);
    });

    it.each([
      ['applyMonomersSequenceLayout', 'show'],
      ['clearCanvas', 'clear'],
    ] as const)(
      'throws from %s without touching the sequence view once the editor is destroyed',
      (method, rendererMember) => {
        const dem = buildChainAndMolecule();
        editor.destroy();
        const rendererCall = jest
          .spyOn(SequenceRenderer, rendererMember)
          .mockImplementation(() => undefined);

        expect(() => dem[method]()).toThrow();
        expect(rendererCall).not.toHaveBeenCalled();
      },
    );
  });

  describe('canvas center under zoom and scale', () => {
    beforeEach(() => {
      open();
      editor.canvasOffset = { width: 800, height: 600 } as DOMRect;
      provideEditorSettings().macroModeScale = NON_DEFAULT_SCALE;
      ZoomTool.instance.setZoomTransform(new ZoomTransform(2, 40, 20));
    });

    it('undoes the zoom of the viewport center', () => {
      // (400 - 40) / 2 and (300 - 20) / 2
      const center =
        editor.drawingEntitiesManager.getCurrentCenterPointOfCanvas();

      expect([center.x, center.y]).toEqual([180, 140]);
    });

    it('moves a detached structure to the zoomed center divided by the scale', () => {
      const detached = deserializeKet(ETHANE_KET);

      detached.centerMacroStructure(editor.canvasOffset);

      expect(
        detached.monomersArray.map((monomer) => [
          monomer.position.x,
          monomer.position.y,
        ]),
      ).toEqual([[9, 7]]);
    });
  });

  describe('replacing a monomer', () => {
    // a - b - c, bonded R2 to R1.
    const buildChain = () => {
      const dem = open();
      const a = addPeptide(editor, 'A', 0, 0);
      const b = addPeptide(editor, 'A', 3, 0);
      const c = addPeptide(editor, 'A', 6, 0);
      bondPeptides(editor, a, b);
      bondPeptides(editor, b, c);

      return { dem, a, b, c };
    };

    it('re-establishes both bonds on a monomer with the same attachment points', () => {
      const { dem, a, b, c } = buildChain();

      const { command, newMonomer } = dem.replaceMonomer(
        b,
        libraryItem('G', KetMonomerClass.AminoAcid),
      );
      editor.renderersContainer.update(command);

      expect([...dem.monomers.values()]).not.toContain(b);
      expect(dem.monomers.size).toBe(3);
      expect(dem.polymerBonds.size).toBe(2);
      expect(newMonomer.label).toBe('G');
      expect(partnerOf(newMonomer, AttachmentPointName.R1)).toBe(a);
      expect(partnerOf(newMonomer, AttachmentPointName.R2)).toBe(c);
    });

    it('loses the bond on an attachment point the new monomer lacks', () => {
      const { dem, a, b, c } = buildChain();

      // The C-terminal amino cap has R1 only.
      const { command, newMonomer } = dem.replaceMonomer(
        b,
        libraryItem('-Am', KetMonomerClass.AminoAcid),
      );
      editor.renderersContainer.update(command);

      expect(dem.polymerBonds.size).toBe(1);
      expect(partnerOf(newMonomer, AttachmentPointName.R1)).toBe(a);
      expect(newMonomer.attachmentPointsToBonds.R2).toBeUndefined();
      expect(c.isAttachmentPointExistAndFree(AttachmentPointName.R1)).toBe(
        true,
      );
    });
  });

  describe('replacing a preset', () => {
    const rnaPreset = (phosphateOnTheLeft: boolean) => ({
      sugar: libraryItem('R', KetMonomerClass.Sugar),
      base: libraryItem('A', KetMonomerClass.Base),
      phosphate: libraryItem('P', KetMonomerClass.Phosphate),
      connections: [
        baseToSugar,
        phosphateOnTheLeft
          ? sugarToPhosphate(AttachmentPointName.R1, AttachmentPointName.R2)
          : sugarToPhosphate(AttachmentPointName.R2, AttachmentPointName.R1),
      ],
    });

    const placeOf = (monomer: BaseMonomer | undefined) =>
      monomer ? [monomer.position.x, monomer.position.y] : undefined;

    // Two nucleotides, the first one's phosphate bonded to the second's sugar.
    const buildTwoNucleotides = () => {
      const dem = open();
      const first = Nucleotide.createOnCanvas(editor, 'A', new Vec2(0, 0));
      const second = Nucleotide.createOnCanvas(editor, 'C', new Vec2(6, 0));

      if (!first || !second) {
        throw new Error('Fixture setup failed: nucleotides not created');
      }

      dem.createPolymerBond(
        first.node.phosphate,
        second.node.sugar,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
      provideEditorSettings().macroModeScale = NON_DEFAULT_SCALE;

      return { dem, first, second };
    };

    const newMonomersOf = (
      dem: DrawingEntitiesManager,
      ...replacedAndKept: Array<{ node: { monomers: BaseMonomer[] } }>
    ) =>
      [...dem.monomers.values()].filter(
        (monomer) =>
          !replacedAndKept.some(({ node }) => node.monomers.includes(monomer)),
      );

    // At scale 20 the base sits 3 below the sugar and the phosphate 3 beside it.
    it('puts a right phosphate to the right of the sugar and the base below it', () => {
      const { dem, first, second } = buildTwoNucleotides();

      const { command, newSugar } = dem.replacePreset(
        first.node.sugar,
        rnaPreset(false),
        new Vec2(10, 10),
        first.node.monomers,
      );
      editor.renderersContainer.update(command);
      const byLabel = (label: string) =>
        placeOf(
          newMonomersOf(dem, first, second).find((m) => m.label === label),
        );

      expect(placeOf(newSugar)).toEqual([10, 10]);
      expect(byLabel('A')).toEqual([10, 13]);
      expect(byLabel('P')).toEqual([13, 10]);
    });

    it('puts a left phosphate to the left of the sugar, which stays at the drop point', () => {
      const { dem, first, second } = buildTwoNucleotides();

      const { command, newSugar } = dem.replacePreset(
        first.node.sugar,
        rnaPreset(true),
        new Vec2(10, 10),
        first.node.monomers,
      );
      editor.renderersContainer.update(command);
      const byLabel = (label: string) =>
        placeOf(
          newMonomersOf(dem, first, second).find((m) => m.label === label),
        );

      expect(placeOf(newSugar)).toEqual([10, 10]);
      expect(byLabel('A')).toEqual([10, 13]);
      expect(byLabel('P')).toEqual([7, 10]);
    });

    it('re-establishes the outer bond on the new right phosphate', () => {
      const { dem, first, second } = buildTwoNucleotides();

      const { command } = dem.replacePreset(
        first.node.sugar,
        rnaPreset(false),
        new Vec2(10, 10),
        first.node.monomers,
      );
      editor.renderersContainer.update(command);

      const newPhosphate = newMonomersOf(dem, first, second).find(
        (monomer) => monomer.label === 'P',
      );

      expect(dem.polymerBonds.size).toBe(5);
      expect(
        newPhosphate && partnerOf(newPhosphate, AttachmentPointName.R2),
      ).toBe(second.node.sugar);
    });

    it('loses the outer bond when the new phosphate is on the left', () => {
      const { dem, first, second } = buildTwoNucleotides();

      const { command } = dem.replacePreset(
        first.node.sugar,
        rnaPreset(true),
        new Vec2(10, 10),
        first.node.monomers,
      );
      editor.renderersContainer.update(command);

      expect(dem.polymerBonds.size).toBe(4);
      expect(
        second.node.sugar.isAttachmentPointExistAndFree(AttachmentPointName.R1),
      ).toBe(true);
    });
  });
});
