import {
  CoreEditor,
  MACROMOLECULES_BOND_TYPES,
  SequenceMode,
} from 'application/editor';
import { ClearTool } from 'application/editor/tools/Clear';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceViewModel } from 'application/render/renderers/sequence/SequenceViewModel/SequenceViewModel';
import { getSvgFromDrawnStructures } from '../../../../../src/utilities/getSvgFromDrawnStructures';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { AmbiguousMonomerSequenceNode } from 'domain/entities/AmbiguousMonomerSequenceNode';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import { Chem } from 'domain/entities/Chem';
import { Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import type { AmbiguousMonomerType } from 'domain/types';
import {
  KetAmbiguousMonomerTemplateSubType,
  KetMonomerClass,
} from 'application/formatters/types/ket';
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

  it('avoids rescanning subchain nodes for each rendered sequence item', () => {
    setupCyclicTwoPeptideStructure();
    const chainsCollection = ChainsCollection.fromMonomers([
      ...editor.drawingEntitiesManager.monomers.values(),
    ]);
    chainsCollection.rearrange();

    const nodeCount = chainsCollection.chains.reduce(
      (count, chain) => count + chain.length,
      0,
    );
    const scanSpies = chainsCollection.chains.flatMap((chain) =>
      chain.subChains.flatMap(({ nodes }) => [
        jest.spyOn(nodes, 'indexOf'),
        jest.spyOn(nodes, 'includes'),
        jest.spyOn(nodes, 'slice'),
      ]),
    );
    try {
      SequenceRenderer.show(chainsCollection);

      const scanCount = scanSpies.reduce(
        (count, spy) => count + spy.mock.calls.length,
        0,
      );
      expect(scanCount).toBeLessThan(nodeCount);
    } finally {
      scanSpies.forEach((spy) => spy.mockRestore());
    }
  });

  it('does not compute sequence length for a non-empty sequence item', () => {
    setupCyclicTwoPeptideStructure();
    const [monomer] = [...editor.drawingEntitiesManager.monomers.values()];
    const renderer = monomer.renderer as BaseSequenceItemRenderer;
    const lengthSpy = jest.spyOn(SequenceViewModel.prototype, 'length', 'get');

    try {
      renderer.show();

      expect(lengthSpy).not.toHaveBeenCalled();
    } finally {
      lengthSpy.mockRestore();
    }
  });

  it('does not display a counter after a non-peptide ambiguous node at chain start', () => {
    const chemMonomerItem = {
      ...peptideMonomerItem,
      label: 'Chem',
      props: {
        ...peptideMonomerItem.props,
        MonomerType: 'CHEM',
        MonomerClass: KetMonomerClass.CHEM,
      },
    };
    const chemMonomer = new Chem(chemMonomerItem);
    const ambiguousMonomerItem: AmbiguousMonomerType = {
      ...chemMonomerItem,
      id: 'ambiguous-chem',
      isAmbiguous: true,
      subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
      options: [{ templateId: chemMonomerItem.label }],
      monomers: [chemMonomer],
    };
    const ambiguousMonomer = new AmbiguousMonomer(ambiguousMonomerItem);
    const chain = new Chain(ambiguousMonomer).addNode(
      new MonomerSequenceNode(new Chem(chemMonomerItem)),
    );
    expect(ambiguousMonomer.monomerClass).toBe(KetMonomerClass.CHEM);
    expect(chain.subChains).toHaveLength(1);
    expect(chain.firstNode).toBeInstanceOf(AmbiguousMonomerSequenceNode);

    SequenceRenderer.show(new ChainsCollection().add(chain));

    expect(
      canvas.querySelectorAll('.sequence-item > text[font-size="12px"]'),
    ).toHaveLength(0);
  });

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
