import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { AttachmentPointName, Vec2 } from 'ketcher-core';
import type { Editor } from '../../../../editor';
import AttachmentPointEditPopup from './AttachmentPointEditPopup';

jest.mock(
  '../MonomerCreationWizard/hooks/useAttachmentPointSelectsData',
  () => ({ useAttachmentPointSelectsData: () => ({}) }),
);
jest.mock(
  '../MonomerCreationWizard/components/AttachmentPointControls/AttachmentPointControls',
  () => () => null,
);

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
  document.body.innerHTML = '';
  document.body.scrollLeft = 0;
  document.body.scrollTop = 0;
});

it('keeps the popup above both atoms and the R-label as the canvas moves', async () => {
  const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(canvas);
  canvas.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 800, bottom: 600 }) as DOMRect;
  let scrollY = 0;
  let zoom = 1;
  const positions = [
    { attribute: 'data-atom-id', value: '0', left: 100, top: 180 },
    { attribute: 'data-atom-id', value: '1', left: 140, top: 150 },
    {
      attribute: 'data-attachment-point-alias',
      value: 'R1',
      left: 160,
      top: 170,
    },
  ];
  positions.forEach(({ attribute, value, left, top }) => {
    const element = document.createElementNS(canvas.namespaceURI, 'text');
    element.setAttribute(attribute, value);
    element.getBoundingClientRect = () =>
      ({
        left: left * zoom,
        top: top * zoom + scrollY,
        right: (left + 20) * zoom,
        bottom: (top + 20) * zoom + scrollY,
      }) as DOMRect;
    canvas.appendChild(element);
  });
  const offsetParent = jest
    .spyOn(HTMLElement.prototype, 'offsetParent', 'get')
    .mockReturnValue(document.body);
  let height = 60;
  jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(132);
  const popupHeight = jest
    .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
    .mockImplementation(() => height);
  const editor = {
    render: { paper: { canvas } },
    monomerCreationState: {
      assignedAttachmentPoints: new Map([['R1', [0, 1]]]),
    },
  } as unknown as Editor;

  const { unmount } = render(
    <AttachmentPointEditPopup
      data={{
        attachmentPointName: AttachmentPointName.R1,
        position: new Vec2(),
      }}
      editor={editor}
      onNameChange={jest.fn()}
      onLeavingAtomChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  const popup = screen.getByTestId('attachment-point-edit-popup');
  expect(popup.style.left).toBe('100px');
  expect(popup.style.top).toBe('82px');

  scrollY = -50;
  canvas.setAttribute('viewBox', '0 50 800 600');
  await waitFor(() => expect(popup.style.top).toBe('32px'));

  zoom = 2;
  canvas.setAttribute('viewBox', '0 50 400 300');
  await waitFor(() => {
    expect(popup.style.left).toBe('200px');
    expect(popup.style.top).toBe('182px');
  });

  height = 90;
  window.dispatchEvent(new Event('resize'));
  await waitFor(() => expect(popup.style.top).toBe('152px'));

  // The portal's positioned parent can be offset, bordered, and scrolled.
  jest.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({
    left: 30,
    top: 40,
  } as DOMRect);
  jest.spyOn(document.body, 'clientLeft', 'get').mockReturnValue(2);
  jest.spyOn(document.body, 'clientTop', 'get').mockReturnValue(3);
  document.body.scrollLeft = 10;
  document.body.scrollTop = 20;
  window.dispatchEvent(new Event('resize'));
  await waitFor(() => {
    expect(popup.style.left).toBe('178px');
    expect(popup.style.top).toBe('129px');
  });

  const measure = jest.spyOn(canvas, 'querySelectorAll');
  canvas.firstElementChild?.setAttribute('fill', 'red');
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  expect(measure).not.toHaveBeenCalled();

  unmount();
  offsetParent.mockRestore();
  popupHeight.mockRestore();
  canvas.remove();
});
