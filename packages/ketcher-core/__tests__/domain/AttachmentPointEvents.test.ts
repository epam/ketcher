import {
  editorEvents,
  resetEditorEvents,
} from 'application/editor/editorEvents';
import { resetEditorInstance } from 'application/editor/editorSingleton';
import type { IEditorEvents } from 'application/editor/editorEvents';
import { Vec2 } from 'domain/entities/vec2';
import { AttachmentPointName } from 'domain/types';
import {
  buildAttachmentPoint,
  expectDirection,
  installMonomerHitTest,
  readGeometry,
  uninstallMonomerHitTest,
} from './helpers/buildAttachmentPoint';

const { R1, R2 } = AttachmentPointName;

describe('AttachmentPoint events and updates', () => {
  beforeEach(() => {
    installMonomerHitTest();
  });

  afterEach(() => {
    uninstallMonomerHitTest();
    resetEditorInstance();
    resetEditorEvents();
    document.body.replaceChildren();
    jest.restoreAllMocks();
  });

  describe('mouse events on the hoverable area', () => {
    const cases: Array<{
      domEvent: string;
      eventName: keyof IEditorEvents;
      setsName: boolean;
    }> = [
      {
        domEvent: 'mouseover',
        eventName: 'mouseOverAttachmentPoint',
        setsName: true,
      },
      {
        domEvent: 'mouseleave',
        eventName: 'mouseLeaveAttachmentPoint',
        setsName: false,
      },
      {
        domEvent: 'mousemove',
        eventName: 'mouseMoveAttachmentPoint',
        setsName: false,
      },
      {
        domEvent: 'mousedown',
        eventName: 'mouseDownAttachmentPoint',
        setsName: true,
      },
      {
        domEvent: 'mouseup',
        eventName: 'mouseUpAttachmentPoint',
        setsName: true,
      },
    ];

    it.each(cases)(
      'dispatches $eventName once on $domEvent',
      ({ domEvent, eventName, setsName }) => {
        const dispatch = jest.spyOn(editorEvents[eventName], 'dispatch');
        const { attachmentPoint } = buildAttachmentPoint({
          attachmentPointName: R2,
        });
        const event = new MouseEvent(domEvent);

        attachmentPoint.getHoverableArea()?.node()?.dispatchEvent(event);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(event);
        expect(
          (event as { attachmentPointName?: string }).attachmentPointName,
        ).toBe(setsName ? 'R2' : undefined);
      },
    );

    it('reaches the new subscription after resetEditorEvents', () => {
      const { attachmentPoint } = buildAttachmentPoint();
      const staleHandler = jest.fn();
      const freshHandler = jest.fn();
      editorEvents.mouseOverAttachmentPoint.add(staleHandler);

      resetEditorEvents();
      editorEvents.mouseOverAttachmentPoint.add(freshHandler);
      const event = new MouseEvent('mouseover');
      attachmentPoint.getHoverableArea()?.node()?.dispatchEvent(event);

      expect(freshHandler).toHaveBeenCalledTimes(1);
      expect(freshHandler).toHaveBeenCalledWith(event);
      expect(staleHandler).not.toHaveBeenCalled();
    });
  });

  describe('getAngle and updateCoords', () => {
    it('returns the angle as it is for a free attachment point', () => {
      const { attachmentPoint } = buildAttachmentPoint({ angle: -90 });

      // the drawing direction is stored as the angle of the last search
      expect(attachmentPoint.getAngle()).toBe(-90);
    });

    it('adds 360 to a negative angle of a used attachment point', () => {
      const { attachmentPoint } = buildAttachmentPoint({
        angle: -90,
        isUsed: true,
      });

      expect(attachmentPoint.getAngle()).toBe(270);
    });

    it('keeps a positive angle of a used attachment point', () => {
      const { attachmentPoint } = buildAttachmentPoint({
        angle: 90,
        isUsed: true,
      });

      expect(attachmentPoint.getAngle()).toBe(90);
    });

    it('does not move a free attachment point', () => {
      const { attachmentPoint, rootElement } = buildAttachmentPoint({
        angle: 0,
      });
      const before = readGeometry(rootElement.node() as SVGElement);

      attachmentPoint.updateCoords();

      expect(readGeometry(rootElement.node() as SVGElement)).toEqual(before);
    });

    it('redraws a used attachment point towards the moved other monomer', () => {
      const { attachmentPoint, rootElement, monomer } = buildAttachmentPoint({
        attachmentPointName: R2,
        bond: {
          isFirstMonomer: true,
          otherAttachmentPointName: R1,
          otherPosition: new Vec2(4, 0),
        },
      });
      const root = rootElement.node() as SVGElement;
      expectDirection(readGeometry(root).directionDegrees, 0);

      const bond = monomer.attachmentPointsToBonds[R2];
      bond?.moveBondEndAbsolute(0, 4);
      attachmentPoint.updateCoords();

      // the other monomer is now below: the line points down (svg y grows down)
      expectDirection(readGeometry(root).directionDegrees, 90);
      const circle = root.querySelector('circle');
      expect(circle?.getAttribute('fill')).toBe('#167782');
      expect(circle?.getAttribute('stroke')).toBe('white');
      expect(Number(circle?.getAttribute('cx'))).toBeCloseTo(
        readGeometry(root).x2,
        5,
      );
    });
  });
});
