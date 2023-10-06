import { type ElementLabel, type AtomColor, Vec2 } from 'ketcher-core';
import Editor from './Editor';

const HOVER_ICON_OPACITY = 0.7;

export class HoverIcon {
  element: any;
  _fill: AtomColor | '';
  _label: ElementLabel | '';
  isShown: boolean;
  /**
   Is required for the case, when mouse moved outside the canvas, then loading of structure
   happens and icon needs to be shown above loader.
  */
  shouldBeShownWhenMouseBack: boolean;
  editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;

    const icon = this.initialize();
    this.element = icon.element;
    this._fill = icon.fill;
    this._label = icon.label;
    this.isShown = true;
    this.shouldBeShownWhenMouseBack = false;
    this.updatePosition();

    const clientArea = this.editor.render.clientArea;
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    document.addEventListener('mousemove', this.onMouseMove);
    clientArea.addEventListener('mouseover', this.onMouseMove);
    clientArea.addEventListener('mouseleave', this.onMouseLeave);
  }

  set fill(fillColor: AtomColor | '') {
    this._fill = fillColor;
    this.element.attr('fill', fillColor);
  }

  get fill() {
    return this._fill;
  }

  set label(label: ElementLabel | '') {
    this._label = label;
    this.element.attr('text', label);
  }

  get label() {
    return this._label;
  }

  isOverLoader(event: MouseEvent) {
    const target = <HTMLDivElement>event?.relatedTarget || event.target;
    return target?.classList.contains('loading-spinner');
  }

  onMouseMove(event: MouseEvent) {
    if (
      this.isShown ||
      (this.isOverLoader(event) && this.shouldBeShownWhenMouseBack)
    ) {
      this.show();
      this.updatePosition();
    }
  }

  onMouseLeave(event: MouseEvent) {
    if (!this.isOverLoader(event) && this.isShown) {
      this.shouldBeShownWhenMouseBack = true;
      this.hide();
    }
  }

  updatePosition() {
    const render = this.editor.render;
    const { x, y } = this.editor.lastCursorPosition;
    const currentPosition = new Vec2(x, y);
    const scrollPosition = render.scrollPos();
    const zoom = render.options.zoom;
    const newPosition = currentPosition.add(scrollPosition).scaled(1 / zoom);
    this.element.attr({
      x: newPosition.x,
      y: newPosition.y,
    });
  }

  show() {
    this.element.show();
    this.isShown = true;
    this.shouldBeShownWhenMouseBack = false;
  }

  hide(restShouldBeShownWhenMouseBack?: boolean) {
    this.element.hide();
    this.isShown = false;

    if (restShouldBeShownWhenMouseBack) {
      this.shouldBeShownWhenMouseBack = false;
    }
  }

  initialize(): {
    element: any;
    fill: AtomColor | '';
    label: ElementLabel | '';
  } {
    const render = this.editor.render;
    const fillColor = this.fill ?? '#000000';
    const element = render.paper.text(0, 0, this.label || '');
    element.attr('fill', fillColor);
    element.attr('font-size', this.editor.options().fontsz);
    element.attr('opacity', HOVER_ICON_OPACITY);

    return {
      element,
      fill: fillColor,
      label: this?.label || '',
    };
  }

  create() {
    const icon = this.initialize();
    this.element = icon.element;
    this._fill = icon.fill;
    this._label = icon.label;
    this.shouldBeShownWhenMouseBack = false;
    this.hide();
  }
}
