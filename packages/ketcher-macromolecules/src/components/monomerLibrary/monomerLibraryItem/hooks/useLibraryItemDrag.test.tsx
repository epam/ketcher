import { renderHook } from '@testing-library/react';
import { useLibraryItemDrag } from './useLibraryItemDrag';
import { useSelector } from 'react-redux';
import { selectEditor } from 'state/common';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('state/common', () => ({
  selectEditor: jest.fn(),
}));

jest.mock('d3', () => ({
  select: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
    call: jest.fn().mockReturnThis(),
  }),
  drag: jest.fn().mockReturnValue({
    filter: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
  }),
}));

describe('useLibraryItemDrag Sonar Fix', () => {
  const mockEditor = {
    mode: { modeName: 'macro-mode' },
    events: {
      setLibraryItemDragState: { dispatch: jest.fn() },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSelector as unknown as jest.Mock).mockImplementation((callback) =>
      callback(),
    );
    (selectEditor as unknown as jest.Mock).mockReturnValue(mockEditor);
    document.body.innerHTML = '';
  });

  it('should pass Sonar coverage for handleMouseDown', () => {
    const item = { id: 'test-item' } as unknown as Parameters<
      typeof useLibraryItemDrag
    >[0];

    const container = document.createElement('div');
    container.setAttribute('data-testid', 'monomer-library');
    const element = document.createElement('div');
    container.appendChild(element);
    document.body.appendChild(container);

    const itemRef = { current: element };

    renderHook(() => useLibraryItemDrag(item, itemRef));

    const event = new MouseEvent('mousedown', { bubbles: true });

    element.dispatchEvent(event);

    expect(document.body.style.cursor).toBe('grabbing');
    expect(element.getAttribute('data-dragging')).toBe('true');
  });
});
