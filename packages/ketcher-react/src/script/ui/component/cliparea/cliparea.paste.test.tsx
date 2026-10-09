import { createEvent, fireEvent, render } from '@testing-library/react';
import ClipArea from './cliparea';

const createFile = (type: string, name = 'file') =>
  new File(['content'], name, { type });

const createClipboardData = (files: File[], text = '') => ({
  files,
  getData: (format: string) => (format === 'text/plain' ? text : ''),
});

describe('ClipArea paste', () => {
  const createProps = () => ({
    formats: [],
    focused: jest.fn(() => true),
    onCopy: jest.fn(),
    onCut: jest.fn(),
    onPaste: jest.fn().mockResolvedValue(undefined),
    onLegacyCopy: jest.fn(),
    onLegacyCut: jest.fn(),
    onLegacyPaste: jest.fn(),
    onPasteImage: jest.fn().mockResolvedValue(undefined),
  });

  const paste = (
    props: ReturnType<typeof createProps>,
    clipboardData: ReturnType<typeof createClipboardData>,
  ) => {
    const { container } = render(<ClipArea {...props} />);
    const event = createEvent.paste(container, { clipboardData });
    fireEvent(container, event);
    return event;
  };

  it('hands an image file over to onPasteImage', () => {
    const props = createProps();
    const png = createFile('image/png', 'image.png');

    const event = paste(props, createClipboardData([png]));

    expect(props.onPasteImage).toHaveBeenCalledWith(png);
    expect(event.defaultPrevented).toBe(true);
    expect(props.onPaste).not.toHaveBeenCalled();
    expect(props.onLegacyPaste).not.toHaveBeenCalled();
  });

  it('pastes text as a structure when the clipboard also has an image', () => {
    const props = createProps();

    paste(props, createClipboardData([createFile('image/png')], 'C1CCCCC1'));

    expect(props.onPasteImage).not.toHaveBeenCalled();
    expect(props.onLegacyPaste).toHaveBeenCalledWith(
      expect.objectContaining({ 'text/plain': 'C1CCCCC1' }),
    );
  });

  it('pastes text as before when there is no image', () => {
    const props = createProps();

    paste(props, createClipboardData([], 'C1CCCCC1'));

    expect(props.onPasteImage).not.toHaveBeenCalled();
    expect(props.onLegacyPaste).toHaveBeenCalled();
  });

  it('ignores files that are not images', () => {
    const props = createProps();

    paste(props, createClipboardData([createFile('text/plain')]));

    expect(props.onPasteImage).not.toHaveBeenCalled();
  });

  it('does nothing while the editor is not focused', () => {
    const props = createProps();
    props.focused.mockReturnValue(false);

    paste(props, createClipboardData([createFile('image/png')]));

    expect(props.onPasteImage).not.toHaveBeenCalled();
    expect(props.onLegacyPaste).not.toHaveBeenCalled();
  });

  it('falls back to the structure paste when onPasteImage is not provided', () => {
    const props = createProps();
    const { onPasteImage: _unused, ...propsWithoutImage } = props;
    const { container } = render(<ClipArea {...propsWithoutImage} />);

    fireEvent(
      container,
      createEvent.paste(container, {
        clipboardData: createClipboardData([createFile('image/png')]),
      }),
    );

    expect(props.onLegacyPaste).toHaveBeenCalled();
  });
});
