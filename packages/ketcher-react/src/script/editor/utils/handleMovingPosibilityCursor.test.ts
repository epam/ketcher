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
      expect(mockRemoveAttribute).toBeCalled();
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
      expect(mockSetAttribute).toBeCalled();
    });
  });
});
