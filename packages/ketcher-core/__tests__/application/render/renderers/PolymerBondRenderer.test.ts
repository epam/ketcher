import type { CoreEditor } from 'application/editor';
import {
  resetEditorInstance,
  setEditorInstance,
} from 'application/editor/editorSingleton';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { Connection } from 'domain/entities/canvas-matrix/Connection';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import { select } from 'd3';
import type { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { getFinishedPolymerBond } from '../../../mock-data';

type FlexModeOrSnakeModePolymerBondRenderer =
  FlexModePolymerBondRenderer | SnakeModePolymerBondRenderer;

// TODO: Split to two test files.
describe('Polymer Bond Renderer', () => {
  afterEach(() => resetEditorInstance());

  it('should render bond', () => {
    const canvas = createPolymerEditorCanvas();
    const polymerBond = getFinishedPolymerBond(10, 10, 90, 100);
    polymerBond.moveToLinkedEntities();
    const polymerBondRenderer =
      polymerBond.renderer as FlexModeOrSnakeModePolymerBondRenderer;
    globalThis.SVGElement.prototype.getBBox = jest.fn();
    jest
      .spyOn(globalThis.SVGElement.prototype, 'getBBox')
      .mockImplementation(() => ({ width: 30, height: 20 }) as DOMRect);
    polymerBondRenderer.show();

    expect(canvas).toMatchSnapshot();
  });

  it('follows local cell rows when routing side-connection corners', () => {
    const canvas = createPolymerEditorCanvas();
    const polymerBondToCells = new Map<PolymerBond, Cell[]>();
    setEditorInstance({
      mode: { modeName: 'snake-layout-mode' },
      drawingEntitiesManager: { canvasMatrix: { polymerBondToCells } },
    } as unknown as CoreEditor);

    const polymerBond = getFinishedPolymerBond(22.25, 1.25, 35.65, 2.525);
    const firstMonomer = polymerBond.firstMonomer;
    const secondMonomer = polymerBond.secondMonomer;
    if (!secondMonomer) {
      throw new Error('Expected a finished polymer bond');
    }
    firstMonomer.setBond(AttachmentPointName.R3, polymerBond);
    secondMonomer.setBond(AttachmentPointName.R4, polymerBond);
    polymerBond.moveToLinkedEntities();

    const firstNode = new MonomerSequenceNode(firstMonomer);
    const lastNode = new MonomerSequenceNode(secondMonomer);
    const cells = [
      new Cell(
        firstNode,
        [new Connection(lastNode, 0, false, polymerBond, 1, 1)],
        0,
        0,
        firstMonomer,
      ),
      new Cell(
        lastNode,
        [new Connection(lastNode, 90, false, polymerBond, 0, 1)],
        1,
        1,
        secondMonomer,
      ),
      new Cell(
        lastNode,
        [
          new Connection(
            firstNode,
            { x: 0, y: 90 },
            false,
            polymerBond,
            1 / 3,
            1,
          ),
        ],
        2,
        2,
        secondMonomer,
      ),
    ];
    polymerBondToCells.set(polymerBond, cells);

    const renderer = new SnakeModePolymerBondRenderer(polymerBond);
    const path = renderer.appendBond(select(canvas).append('g'));
    const pathD = path?.attr('d');

    expect(pathD).toContain('q 5,0 5,-5');
    expect(pathD).toContain('q 0,-5 5,-5');
    expect(pathD).toContain('V 63 q 0,-5 5,-5');
  });
});
