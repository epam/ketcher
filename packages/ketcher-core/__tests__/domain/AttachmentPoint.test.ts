import { resetEditorEvents } from 'application/editor/editorEvents';
import { resetEditorInstance } from 'application/editor/editorSingleton';
import { Vec2 } from 'domain/entities/vec2';
import { AttachmentPointName } from 'domain/types';
import {
  BODY_HEIGHT,
  BODY_WIDTH,
  buildAttachmentPoint,
  expectDirection,
  installMonomerHitTest,
  readGeometry,
  uninstallMonomerHitTest,
} from './helpers/buildAttachmentPoint';

const { R1, R2, R3 } = AttachmentPointName;

// The attachment point sticks out of the monomer border by the diagonal of a 6x6 square.
const ATTACHMENT_POINT_LENGTH = Math.hypot(6, 6);
// The monomer box in the coordinates of the monomer: x 0..BODY_WIDTH, y 0..BODY_HEIGHT.
const BORDER_TOLERANCE = 1.5;

function getText(rootElement: SVGElement) {
  const text = rootElement.querySelector('text');
  if (!text) {
    throw new Error('Attachment point has no text');
  }
  return text;
}

describe('AttachmentPoint', () => {
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

  describe('without a bond', () => {
    it('draws a line from the left border of the monomer for angle 0', () => {
      const { rootElement } = buildAttachmentPoint({ angle: 0 });
      const geometry = readGeometry(rootElement.node() as SVGElement);

      expect(Math.abs(geometry.x1)).toBeLessThan(BORDER_TOLERANCE);
      expect(geometry.y1).toBeCloseTo(BODY_HEIGHT / 2, 5);
      expect(geometry.x2).toBeCloseTo(geometry.x1 - ATTACHMENT_POINT_LENGTH, 5);
      expect(geometry.y2).toBeCloseTo(BODY_HEIGHT / 2, 5);
      expectDirection(geometry.directionDegrees, 180);
    });

    it('draws the line towards the top for angle 90 (angle - 180 is the drawing direction)', () => {
      const { rootElement } = buildAttachmentPoint({ angle: 90 });
      const geometry = readGeometry(rootElement.node() as SVGElement);

      expect(Math.abs(geometry.y1)).toBeLessThan(BORDER_TOLERANCE);
      expect(geometry.x1).toBeCloseTo(BODY_WIDTH / 2, 5);
      expectDirection(geometry.directionDegrees, -90);
    });

    it('draws a free attachment point in white with the free colors', () => {
      const { rootElement } = buildAttachmentPoint({ angle: 0 });
      const root = rootElement.node() as SVGElement;
      const geometry = readGeometry(root);
      const circle = root.querySelector('circle');
      const text = getText(root);

      expect(root.querySelector('line')?.getAttribute('stroke')).toBe(
        '#167782',
      );
      expect(circle?.getAttribute('fill')).toBe('white');
      expect(circle?.getAttribute('stroke')).toBe('#0097A8');
      expect(circle?.getAttribute('r')).toBe('3');
      expect(circle?.getAttribute('data-attachment-point-alias')).toBe('R1');
      expect(geometry.cx).toBeCloseTo(geometry.x2, 5);
      expect(geometry.cy).toBeCloseTo(geometry.y2, 5);
      expect(text.textContent).toBe('R1');
      expect(text.style.fill).toBe('#585858');
      // label sits 8 beyond the end of the line, shifted by the label size (3.5, 2.5)
      expect(Number(text.getAttribute('x'))).toBeCloseTo(geometry.x2 - 8 - 3.5);
      expect(Number(text.getAttribute('y'))).toBeCloseTo(geometry.y2 + 2.5);
    });

    it('shifts the label of a used attachment point by 5 to the side', () => {
      const { rootElement } = buildAttachmentPoint({ angle: 0, isUsed: true });
      const root = rootElement.node() as SVGElement;
      const geometry = readGeometry(root);
      const text = getText(root);

      expect(Number(text.getAttribute('x'))).toBeCloseTo(geometry.x2 - 8 - 3.5);
      expect(Number(text.getAttribute('y'))).toBeCloseTo(geometry.y2 - 5 + 2.5);
    });

    it('draws a bigger circle for a hovered drag circle and the drag target colors', () => {
      const { rootElement } = buildAttachmentPoint({
        isDragTarget: true,
        isDragCircleHover: true,
      });
      const root = rootElement.node() as SVGElement;
      const circle = root.querySelector('circle');

      expect(circle?.getAttribute('r')).toBe('5');
      expect(circle?.getAttribute('fill')).toBe('white');
      expect(circle?.getAttribute('stroke')).toBe('#167782');
      expect(root.querySelector('line')?.getAttribute('stroke')).toBe(
        '#167782',
      );
    });
  });

  describe('with a bond (rotateToAngle path)', () => {
    it('points to the other monomer when the monomer is the first one of the bond', () => {
      const { rootElement } = buildAttachmentPoint({
        attachmentPointName: R2,
        bond: {
          isFirstMonomer: true,
          otherAttachmentPointName: R1,
          otherPosition: new Vec2(4, 0),
        },
      });
      const root = rootElement.node() as SVGElement;
      const geometry = readGeometry(root);

      expectDirection(geometry.directionDegrees, 0);
      expect(Math.abs(geometry.x1 - BODY_WIDTH)).toBeLessThan(BORDER_TOLERANCE);
      expect(geometry.y1).toBeCloseTo(BODY_HEIGHT / 2, 5);
      // a used attachment point is drawn filled
      expect(root.querySelector('circle')?.getAttribute('fill')).toBe(
        '#0097A8',
      );
      expect(root.querySelector('circle')?.getAttribute('stroke')).toBe(
        'white',
      );
      expect(root.querySelector('line')?.getAttribute('stroke')).toBe(
        '#0097A8',
      );
    });

    it('points to the other monomer when the monomer is the second one of the bond', () => {
      const { rootElement } = buildAttachmentPoint({
        attachmentPointName: R2,
        bond: {
          isFirstMonomer: false,
          otherAttachmentPointName: R1,
          otherPosition: new Vec2(-4, 0),
        },
      });
      const geometry = readGeometry(rootElement.node() as SVGElement);

      expectDirection(geometry.directionDegrees, 180);
      expect(Math.abs(geometry.x1)).toBeLessThan(BORDER_TOLERANCE);
    });

    it('does not use the snake angle in flex mode, even for a bond that is not horizontal', () => {
      const { rootElement } = buildAttachmentPoint({
        attachmentPointName: R1,
        modeName: 'flex-mode',
        bond: {
          isFirstMonomer: true,
          otherAttachmentPointName: R2,
          otherPosition: new Vec2(4, 2),
          sideConnectionEndpointAngle: Math.PI / 2,
        },
      });
      const geometry = readGeometry(rootElement.node() as SVGElement);

      expectDirection(
        geometry.directionDegrees,
        Vec2.radiansToDegrees(Math.atan2(2, 4)),
      );
    });
  });

  describe('with isSnake and a bond that is not horizontal', () => {
    const otherPosition = new Vec2(4, 2);

    it('points left for R1', () => {
      const { rootElement } = buildAttachmentPoint({
        attachmentPointName: R1,
        isSnake: true,
        bond: {
          isFirstMonomer: true,
          otherAttachmentPointName: R2,
          otherPosition,
        },
      });

      expectDirection(
        readGeometry(rootElement.node() as SVGElement).directionDegrees,
        180,
      );
    });

    it('points right for R2', () => {
      const { rootElement } = buildAttachmentPoint({
        attachmentPointName: R2,
        isSnake: true,
        bond: {
          isFirstMonomer: true,
          otherAttachmentPointName: R1,
          otherPosition,
        },
      });

      expectDirection(
        readGeometry(rootElement.node() as SVGElement).directionDegrees,
        0,
      );
    });

    it('uses the side connection angle of the bond renderer for another name', () => {
      const { rootElement } = buildAttachmentPoint({
        attachmentPointName: R3,
        isSnake: true,
        bond: {
          isFirstMonomer: true,
          otherAttachmentPointName: R1,
          otherPosition,
          sideConnectionEndpointAngle: Math.PI / 2,
        },
      });

      // angle 90 degrees: the line is drawn in the opposite direction
      expectDirection(
        readGeometry(rootElement.node() as SVGElement).directionDegrees,
        -90,
      );
    });

    it('falls back to the bond angle when the renderer has no side connection angle', () => {
      const { rootElement } = buildAttachmentPoint({
        attachmentPointName: R3,
        isSnake: true,
        bond: {
          isFirstMonomer: true,
          otherAttachmentPointName: R1,
          otherPosition,
        },
      });

      expectDirection(
        readGeometry(rootElement.node() as SVGElement).directionDegrees,
        Vec2.radiansToDegrees(Math.atan2(2, 4)),
      );
    });
  });

  describe('in snake layout mode', () => {
    it('uses the side connection angle for a side chain connection', () => {
      const { rootElement } = buildAttachmentPoint({
        attachmentPointName: R3,
        modeName: 'snake-layout-mode',
        bond: {
          isFirstMonomer: true,
          otherAttachmentPointName: R1,
          otherPosition: new Vec2(4, 0),
          sideConnectionEndpointAngle: Math.PI / 2,
        },
      });

      expectDirection(
        readGeometry(rootElement.node() as SVGElement).directionDegrees,
        -90,
      );
    });

    it('uses the plain bond angle for a backbone connection', () => {
      const { rootElement } = buildAttachmentPoint({
        attachmentPointName: R2,
        modeName: 'snake-layout-mode',
        bond: {
          isFirstMonomer: true,
          otherAttachmentPointName: R1,
          otherPosition: new Vec2(-4, 0),
          sideConnectionEndpointAngle: Math.PI / 2,
        },
      });

      expectDirection(
        readGeometry(rootElement.node() as SVGElement).directionDegrees,
        180,
      );
    });

    it('uses the plain bond angle for a side chain connection in another mode', () => {
      const { rootElement } = buildAttachmentPoint({
        attachmentPointName: R3,
        modeName: 'sequence-layout-mode',
        bond: {
          isFirstMonomer: true,
          otherAttachmentPointName: R1,
          otherPosition: new Vec2(4, 0),
          sideConnectionEndpointAngle: Math.PI / 2,
        },
      });

      expectDirection(
        readGeometry(rootElement.node() as SVGElement).directionDegrees,
        0,
      );
    });
  });
});
