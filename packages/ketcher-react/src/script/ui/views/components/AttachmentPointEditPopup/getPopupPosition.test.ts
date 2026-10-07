import { getPopupPosition } from './getPopupPosition';

const viewport = { left: 0, top: 0, right: 800, bottom: 600 };
const size = { width: 132, height: 60 };

it.each([
  [
    'above',
    { left: 100, top: 150, right: 180, bottom: 200 },
    { left: 100, top: 82 },
  ],
  [
    'below at the top edge',
    { left: 100, top: 10, right: 180, bottom: 50 },
    { left: 100, top: 58 },
  ],
  [
    'inside the left edge',
    { left: -10, top: 150, right: 40, bottom: 200 },
    { left: 8, top: 82 },
  ],
  [
    'inside the right edge',
    { left: 770, top: 150, right: 810, bottom: 200 },
    { left: 660, top: 82 },
  ],
  [
    'above at the bottom edge',
    { left: 100, top: 570, right: 180, bottom: 600 },
    { left: 100, top: 502 },
  ],
  [
    'to the right of a tall anchor',
    { left: 100, top: 10, right: 180, bottom: 590 },
    { left: 188, top: 10 },
  ],
  [
    'to the left when the right side is full',
    { left: 700, top: 10, right: 780, bottom: 590 },
    { left: 560, top: 10 },
  ],
])('places the popup %s', (_, anchor, expected) => {
  expect(getPopupPosition([anchor], size, viewport)).toEqual(expected);
});

it('avoids the complete group, including a label above the atoms', () => {
  expect(
    getPopupPosition(
      [
        { left: 100, top: 150, right: 140, bottom: 180 },
        { left: 160, top: 100, right: 180, bottom: 120 },
      ],
      size,
      viewport,
    ),
  ).toEqual({ left: 100, top: 32 });
});

it('keeps controls inside an offset canvas when no non-overlapping placement fits', () => {
  const bounds = { left: 100, top: 100, right: 300, bottom: 250 };
  expect(getPopupPosition([bounds], size, bounds)).toEqual({
    left: 108,
    top: 108,
  });
});
