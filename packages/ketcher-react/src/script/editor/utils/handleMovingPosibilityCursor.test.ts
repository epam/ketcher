import type { Render } from 'ketcher-core';
import { getItemCursor } from './getItemCursor';
import { handleMovingPosibilityCursor } from './handleMovingPosibilityCursor';

const mockRemoveAttribute = jest.fn();
const mockSetAttribute = jest.fn();

describe('handleMovingPosibilityCursor', () => {
  describe('When cursor is shown and not present hover item', () => {
    it('Should remove cursor attribute', () => {
      const mockItem = false;
      const mockIsCursorShown = 'all-scroll';
      const mockCanvas = {
        getAttribute: () => mockIsCursorShown,
        removeAttribute: mockRemoveAttribute,
        setAttribute: mockSetAttribute,
      } as unknown as SVGElement;
      handleMovingPosibilityCursor(mockItem, mockCanvas, mockIsCursorShown);
      expect(mockRemoveAttribute).toHaveBeenCalled();
    });
  });
  describe('When cursor isnt shown and hover item is present', () => {
    it('Should add cursor attribute', () => {
      const mockItem = true;
      const mockIsCursorShown = '';
      const mockCanvas = {
        getAttribute: () => mockIsCursorShown,
        removeAttribute: mockRemoveAttribute,
        setAttribute: mockSetAttribute,
      } as unknown as SVGElement;
      handleMovingPosibilityCursor(mockItem, mockCanvas, mockIsCursorShown);
      expect(mockSetAttribute).toHaveBeenCalled();
    });
  });

  it('shows the default cursor for an Attachment Group', () => {
    const attachmentGroupId = 1;
    const item = {
      map: 'attachmentGroups',
      id: attachmentGroupId,
      dist: 0,
    } as const;
    const render = {
      options: { movingStyle: { cursor: 'move' } },
    } as unknown as Render;
    const canvas = {
      getAttribute: () => '',
      removeAttribute: mockRemoveAttribute,
      setAttribute: mockSetAttribute,
    } as unknown as SVGElement;

    handleMovingPosibilityCursor(item, canvas, getItemCursor(render, item));

    expect(mockSetAttribute).toHaveBeenCalledWith('cursor', 'default');
  });

  it('keeps the moving cursor for a regular atom', () => {
    const atomId = 1;
    const item = { map: 'atoms', id: atomId, dist: 0 } as const;
    const render = {
      options: { movingStyle: { cursor: 'move' } },
    } as unknown as Render;

    expect(getItemCursor(render, item)).toBe('move');
  });
});
