import { D3SvgElementSelection } from 'application/render/types';
import { editorEvents } from 'application/editor/editorEvents';
import { BaseSequenceItemRenderer } from './BaseSequenceItemRenderer';
import { select } from 'd3';

type ElementType = 'text' | 'background' | 'spacer';

/**
 * This class handles all mouse events for sequence
 * so we don't have to add handlers to each sequence item individually.
 */
export class SequenceEventDelegationManager {
  // eslint-disable-next-line no-use-before-define
  static _instance: SequenceEventDelegationManager | null = null;
  private canvas: D3SvgElementSelection<SVGGElement, void> | null = null;
  private boundHandlers: Map<string, (event: MouseEvent) => void> = new Map();

  public static get instance() {
    if (!SequenceEventDelegationManager._instance) {
      SequenceEventDelegationManager._instance =
        new SequenceEventDelegationManager();
    }
    return SequenceEventDelegationManager._instance;
  }

  public attachDelegatedEvents(
    canvas: D3SvgElementSelection<SVGGElement, void>,
  ): void {
    if (this.canvas) {
      this.removeDelegatedEvents();
    }

    this.canvas = canvas;

    this.attachHandler('mouseover', this.handleMouseOver.bind(this));
    this.attachHandler('mousemove', this.handleMouseMove.bind(this));
    this.attachHandler('mouseout', this.handleMouseOut.bind(this));
    this.attachHandler('mousedown', this.handleMouseDown.bind(this));
    this.attachHandler('click', this.handleClick.bind(this));
    this.attachHandler('dblclick', this.handleDblClick.bind(this));
  }

  public removeDelegatedEvents(): void {
    if (!this.canvas) return;

    this.boundHandlers.forEach((_, eventType) => {
      this.canvas?.on(eventType, null);
    });

    this.boundHandlers.clear();
    this.canvas = null;
  }

  private attachHandler(
    eventType: string,
    handler: (event: MouseEvent) => void,
  ): void {
    this.boundHandlers.set(eventType, handler);
    this.canvas?.on(eventType, handler);
  }

  private findSequenceItemRenderer(
    target: EventTarget | null,
  ): { renderer: BaseSequenceItemRenderer; elementType: ElementType } | null {
    if (!target || !(target instanceof SVGElement)) return null;

    const sequenceItemElement = target.closest('.sequence-item') as SVGGElement;

    if (!sequenceItemElement) return null;

    const renderer = select<SVGGElement, BaseSequenceItemRenderer>(
      sequenceItemElement,
    ).datum();

    if (!renderer) return null;

    const elementType = this.getElementType(target);
    if (!elementType) return null;

    return { renderer, elementType };
  }

  private getElementType(target: SVGElement): ElementType | null {
    const dataType = target.getAttribute('data-element-type');
    if (
      dataType === 'text' ||
      dataType === 'background' ||
      dataType === 'spacer'
    ) {
      return dataType;
    }

    const tagName = target.tagName.toLowerCase();
    if (tagName === 'text') return 'text';
    if (tagName === 'rect') {
      const parentGroup = target.closest('g[data-element-type="spacer"]');
      if (parentGroup) return 'spacer';
      return 'background';
    }
    if (tagName === 'g' && target.hasAttribute('data-element-type')) {
      return target.getAttribute('data-element-type') as ElementType;
    }

    return null;
  }

  private handleMouseOver(event: MouseEvent): void {
    const result = this.findSequenceItemRenderer(event.target);
    if (!result) return;

    const { renderer, elementType } = result;

    if (elementType === 'text' || elementType === 'background') {
      renderer.drawBackgroundElementHover();
      if (elementType === 'text') {
        editorEvents.mouseOverSequenceItem.dispatch(event);
      }
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    const result = this.findSequenceItemRenderer(event.target);
    if (!result) return;

    const { elementType } = result;

    if (elementType === 'text') {
      editorEvents.mouseOnMoveSequenceItem.dispatch(event);
    }
  }

  private handleMouseOut(event: MouseEvent): void {
    const result = this.findSequenceItemRenderer(event.target);
    if (!result) {
      return;
    }

    const { renderer, elementType } = result;

    renderer.removeBackgroundElementHover();
    if (elementType === 'text') {
      editorEvents.mouseLeaveSequenceItem.dispatch(event);
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    const result = this.findSequenceItemRenderer(event.target);
    if (!result) return;

    const { elementType } = result;

    if (elementType === 'spacer') {
      editorEvents.mousedownBetweenSequenceItems.dispatch(event);
    } else if (elementType === 'background') {
      editorEvents.mouseDownOnSequenceItem.dispatch(event);
    }
  }

  private handleClick(event: MouseEvent): void {
    const result = this.findSequenceItemRenderer(event.target);
    if (!result) return;

    const { elementType } = result;

    if (elementType === 'background') {
      editorEvents.clickOnSequenceItem.dispatch(event);
    }
  }

  private handleDblClick(event: MouseEvent): void {
    const result = this.findSequenceItemRenderer(event.target);
    if (!result) return;

    const { elementType } = result;

    if (elementType === 'text' || elementType === 'background') {
      editorEvents.doubleClickOnSequenceItem.dispatch(event);
    }
  }
}
