import { CoreEditor, FlexMode } from 'application/editor';
import { PolymerBond } from 'application/editor/tools/Bond';
import { ToolName } from 'application/editor/tools/types';
import {
  coreEditorTheme,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
  createSvgElement,
} from '../../helpers/dom';

describe('Editor tool events during library item drag', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: coreEditorTheme,
      canvas,
      renderersContainer: createRenderersManager(polymerEditorTheme),
      mode: new FlexMode(),
    });
  });

  afterEach(() => {
    editor.destroy();
    jest.restoreAllMocks();
  });

  it('does not forward canvas hover events to the Bond tool while a library item is dragged', () => {
    const mouseOverMonomer = jest.spyOn(
      PolymerBond.prototype,
      'mouseOverMonomer',
    );
    editor.selectTool(ToolName.bondSingle, {
      toolName: ToolName.bondSingle,
    });

    const target = createSvgElement('g');
    canvas.appendChild(target);
    const event = { target } as unknown as MouseEvent;

    editor.events.setLibraryItemDragState.dispatch({
      item: peptideMonomerItem,
      position: { x: 0, y: 0 },
    });
    editor.events.mouseOverMonomer.dispatch(event);

    expect(mouseOverMonomer).not.toHaveBeenCalled();

    editor.events.setLibraryItemDragState.dispatch(null);
    editor.events.mouseOverMonomer.dispatch(event);

    expect(mouseOverMonomer).toHaveBeenCalledTimes(1);
  });

  it('does not forward canvas DOM mousemove to the Bond tool while a library item is dragged', () => {
    const mousemove = jest.spyOn(PolymerBond.prototype, 'mousemove');
    editor.selectTool(ToolName.bondSingle, {
      toolName: ToolName.bondSingle,
    });

    const target = createSvgElement('g');
    canvas.appendChild(target);
    const moveOverCanvas = () =>
      target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));

    editor.events.setLibraryItemDragState.dispatch({
      item: peptideMonomerItem,
      position: { x: 0, y: 0 },
    });
    moveOverCanvas();

    expect(mousemove).not.toHaveBeenCalled();

    editor.events.setLibraryItemDragState.dispatch(null);
    moveOverCanvas();

    expect(mousemove).toHaveBeenCalledTimes(1);
  });
});
