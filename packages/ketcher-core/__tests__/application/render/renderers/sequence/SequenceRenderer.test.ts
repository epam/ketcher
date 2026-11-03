import {
  CoreEditor,
  MACROMOLECULES_BOND_TYPES,
  SequenceMode,
} from 'application/editor';
import { ClearTool } from 'application/editor/tools/Clear';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { getSvgFromDrawnStructures } from '../../../../../src/utilities/getSvgFromDrawnStructures';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { AttachmentPointName } from 'domain/types';
import {
  coreEditorTheme,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

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

describe('SequenceRenderer', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  const getSequenceBondPaths = () =>
    Array.from(
      canvas.querySelectorAll<SVGPathElement>(
        '.drawn-structures > g > path[stroke="black"][fill="none"]',
      ),
    );

  const showCurrentMonomersInSequenceLayout = () => {
    editor.drawingEntitiesManager.clearCanvas();
    const chainsCollection = ChainsCollection.fromMonomers([
      ...editor.drawingEntitiesManager.monomers.values(),
    ]);

    chainsCollection.rearrange();
    SequenceRenderer.show(chainsCollection);
  };

  // Adds two peptide monomers connected by two R2->R1 polymer bonds (forming a
  // cycle) and renders them in sequence layout. This reproduces the minimal
  // structural shape from the original bug report (a cyclic chain that draws
  // a single sequence-level bond path above the row).
  const setupCyclicTwoPeptideStructure = () => {
    const addFirstMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(0, 0),
    );
    const addSecondMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(10, 0),
    );
    editor.renderersContainer.update(addFirstMonomerCommand);
    editor.renderersContainer.update(addSecondMonomerCommand);

    const [firstMonomer, secondMonomer] = [
      ...editor.drawingEntitiesManager.monomers.values(),
    ];

    editor.renderersContainer.update(
      editor.drawingEntitiesManager.createPolymerBond(
        firstMonomer,
        secondMonomer,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
        MACROMOLECULES_BOND_TYPES.SINGLE,
      ),
    );
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.createPolymerBond(
        // The argument order is intentionally swapped relative to the call
        // above: this second bond closes the cycle (second -> first).
        secondMonomer, // NOSONAR
        firstMonomer,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
        MACROMOLECULES_BOND_TYPES.SINGLE,
      ),
    );

    showCurrentMonomersInSequenceLayout();
  };

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: coreEditorTheme,
      canvas,
      renderersContainer: createRenderersManager(polymerEditorTheme),
      mode: new SequenceMode(),
    });
  });

  afterEach(() => {
    SequenceRenderer.clear();
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('does not duplicate sequence bond paths when re-rendering via startNewSequence', () => {
    setupCyclicTwoPeptideStructure();

    expect(getSequenceBondPaths()).toHaveLength(1);

    SequenceRenderer.startNewSequence(0);

    expect(getSequenceBondPaths()).toHaveLength(1);
  });

  it.each([9, 10, 11])(
    'hides upper counters for a %i-symbol duplex independently of the sync caret (#8960)',
    (length) => {
      for (const dimension of ['width', 'height']) {
        Object.defineProperty(canvas, dimension, {
          configurable: true,
          value: { baseVal: { value: 500 } },
        });
      }
      const nucleotides = Array.from({ length }, (_, index) => {
        const created = Nucleotide.createOnCanvas(
          'A',
          new Vec2(index * 1.6, 0),
        );
        if (!created) throw new Error('Failed to create nucleotide');
        return created.node;
      });
      nucleotides.slice(1).forEach((node, index) => {
        editor.drawingEntitiesManager.createPolymerBond(
          nucleotides[index].phosphate,
          node.sugar,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        );
      });
      editor.drawingEntitiesManager.selectDrawingEntities([
        ...editor.drawingEntitiesManager.monomers.values(),
      ]);
      editor.drawingEntitiesManager.createAntisenseChain(false);
      editor.drawingEntitiesManager.unselectAllDrawingEntities();
      const mode = editor.mode as SequenceMode;
      mode.turnOnEditMode();

      const renderer = nucleotides[length - 1].rnaBase
        .renderer as unknown as BaseSequenceItemRenderer;
      const firstRenderer = nucleotides[0].rnaBase
        .renderer as unknown as BaseSequenceItemRenderer;
      for (const position of [0, length - 1, length, 0]) {
        SequenceRenderer.setCaretPosition(position);
        expect(renderer.counterElement?.text()).toBe(
          length > 9 ? undefined : String(length),
        );
        expect(
          firstRenderer.antisenseNodeRenderer?.counterElement?.text(),
        ).toBe(String(length));
      }

      const terminalRenderer = () =>
        nucleotides[length - 1].rnaBase
          .renderer as unknown as BaseSequenceItemRenderer;
      mode.turnOffSyncEditMode();
      expect(terminalRenderer().counterElement?.text()).toBe(String(length));
      mode.turnOnSyncEditMode();
      expect(terminalRenderer().counterElement?.text()).toBe(
        length > 9 ? undefined : String(length),
      );
      mode.turnOffEditMode();
      expect(terminalRenderer().counterElement?.text()).toBe(String(length));
      const viewFirstRenderer = nucleotides[0].rnaBase
        .renderer as unknown as BaseSequenceItemRenderer;
      expect(
        viewFirstRenderer.antisenseNodeRenderer?.counterElement?.text(),
      ).toBe(String(length));

      if (length === 10) {
        // A terminal symbol without a partner belongs to the same duplex.
        const terminalBase = nucleotides[length - 1].rnaBase;
        editor.drawingEntitiesManager.deletePolymerBond(
          terminalBase.hydrogenBonds[0],
        );
        mode.turnOnEditMode();
        expect(terminalRenderer().counterElement).toBeUndefined();
      }

      if (length === 9) {
        mode.turnOnEditMode();
        const added = Nucleotide.createOnCanvas('A', new Vec2(length * 1.6, 0));
        if (!added) throw new Error('Failed to create nucleotide');
        editor.drawingEntitiesManager.createPolymerBond(
          nucleotides[length - 1].phosphate,
          added.node.sugar,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        );
        showCurrentMonomersInSequenceLayout();
        const addedRenderer = added.node.rnaBase
          .renderer as unknown as BaseSequenceItemRenderer;
        expect(addedRenderer.counterElement).toBeUndefined();

        for (const monomer of added.node.monomers) {
          editor.drawingEntitiesManager.deleteMonomer(monomer);
        }
        showCurrentMonomersInSequenceLayout();
        expect(terminalRenderer().counterElement?.text()).toBe('9');
      }
    },
  );

  it('removes sequence bond paths created across multiple renders when ClearTool runs', () => {
    setupCyclicTwoPeptideStructure();
    SequenceRenderer.startNewSequence(0);

    expect(getSequenceBondPaths()).toHaveLength(1);

    // ClearTool performs all of its work in the constructor as a side effect.
    // Instantiating it is how the tool is "run",
    // so the constructed instance is intentionally discarded.

    // @ts-expect-error TS6133.
    const _ = new ClearTool(editor);

    expect(editor.drawingEntitiesManager.hasDrawingEntities).toBe(false);
    expect(getSequenceBondPaths()).toHaveLength(0);
  });

  it('keeps the caret and the chain start arrow out of the exported SVG (#4669)', () => {
    setupCyclicTwoPeptideStructure();
    // In text-editing mode the first symbol of a chain carries the start arrow
    (editor.mode as SequenceMode).isEditMode = true;
    showCurrentMonomersInSequenceLayout();
    const [monomer] = [...editor.drawingEntitiesManager.monomers.values()];
    (monomer.renderer as BaseSequenceItemRenderer).showCaret();

    const caret = canvas.querySelector('.blinking');
    const arrow = canvas.querySelector('[data-testid="sequence-start-arrow"]');
    expect(caret).not.toBeNull();
    expect(arrow).not.toBeNull();

    const svg = getSvgFromDrawnStructures(canvas, 'file');

    expect(svg).not.toContain('blinking');
    expect(svg).not.toContain('sequence-start-arrow');
  });
});
