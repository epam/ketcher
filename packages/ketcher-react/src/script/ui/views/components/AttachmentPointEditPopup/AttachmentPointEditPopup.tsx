import { useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  assert,
  type AtomLabel,
  type AttachmentPointClickData,
  type AttachmentPointId,
  type AttachmentPointName,
} from 'ketcher-core';
import AttachmentPointControls from '../MonomerCreationWizard/components/AttachmentPointControls/AttachmentPointControls';
import { useAttachmentPointSelectsData } from '../MonomerCreationWizard/hooks/useAttachmentPointSelectsData';

import { getPopupPosition } from './getPopupPosition';
import styles from './AttachmentPointEditPopup.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import type { Editor } from '../../../../editor';

type Props = {
  data: AttachmentPointClickData;
  onNameChange: (
    attachmentPointId: AttachmentPointId,
    newName: AttachmentPointName,
  ) => void;
  onLeavingAtomChange: (
    attachmentPointId: AttachmentPointId,
    newLeavingAtomLabel: AtomLabel,
  ) => void;
  onClose: VoidFunction;
  editor: Editor;
};

const AttachmentPointEditPopup = ({
  data,
  onNameChange,
  onLeavingAtomChange,
  onClose,
  editor,
}: Props) => {
  const { t } = useTranslation('components');
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const popup = popupRef.current;
      const target = event.target as Node;

      if (!popup || popup.contains(target)) {
        return;
      }

      // Check if the click is on a MUI Select dropdown or its options
      // MUI Select typically uses classes like 'MuiPaper-root', 'MuiList-root', 'MuiMenuItem-root'
      const clickedElement = event.target as Element;

      // Check if click is on MUI Select dropdown elements
      if (
        clickedElement.closest &&
        (clickedElement.closest('[role="listbox"]') ||
          clickedElement.closest('[role="option"]') ||
          clickedElement.closest('.MuiPaper-root') ||
          clickedElement.closest('.MuiList-root') ||
          clickedElement.closest('.MuiMenuItem-root') ||
          clickedElement.closest('.MuiSelect-root') ||
          clickedElement.closest('[data-testid*="select"]'))
      ) {
        return;
      }

      onClose();
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const { attachmentPointId, attachmentPointName } = data;

  useLayoutEffect(() => {
    const popup = popupRef.current;
    const canvas = editor.render.paper.canvas as SVGSVGElement;
    if (!popup) return;

    const updatePosition = () => {
      const atomPair =
        editor.monomerCreationState?.assignedAttachmentPoints.get(
          attachmentPointId,
        );
      const parent = popup.offsetParent;
      if (!atomPair || !(parent instanceof HTMLElement)) return;

      // Include both atoms and the R-label, including its interaction target.
      // DOM bounds already account for the micro canvas viewBox and zoom.
      const selector = [
        `[data-atom-id="${atomPair.attachmentAtomId}"]`,
        `[data-atom-id="${atomPair.leavingAtomId}"]`,
        `[data-attachment-point-id="${attachmentPointId}"]`,
      ].join(',');
      const bounds = Array.from(canvas.querySelectorAll(selector)).map(
        (element) => element.getBoundingClientRect(),
      );
      if (!bounds.length) return;

      const parentBounds = parent.getBoundingClientRect();
      const canvasBounds = canvas.getBoundingClientRect();
      const position = getPopupPosition(
        bounds,
        { width: popup.offsetWidth, height: popup.offsetHeight },
        {
          left: Math.max(0, canvasBounds.left),
          top: Math.max(0, canvasBounds.top),
          right: Math.min(window.innerWidth, canvasBounds.right),
          bottom: Math.min(window.innerHeight, canvasBounds.bottom),
        },
      );
      popup.style.left = `${position.left - parentBounds.left + parent.scrollLeft - parent.clientLeft}px`;
      popup.style.top = `${position.top - parentBounds.top + parent.scrollTop - parent.clientTop}px`;
    };

    updatePosition();
    let frame: number | undefined;
    const schedulePositionUpdate = () => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        updatePosition();
      });
    };
    // Observe geometry and redraws, but ignore hover colors and other styling.
    const observer = new MutationObserver(schedulePositionUpdate);
    observer.observe(canvas, {
      attributes: true,
      attributeFilter: [
        'viewBox',
        'transform',
        'x',
        'y',
        'cx',
        'cy',
        'r',
        'rx',
        'ry',
        'width',
        'height',
        'd',
        'font-size',
        'data-atom-id',
        'data-attachment-point-alias',
      ],
      childList: true,
      characterData: true,
      subtree: true,
    });
    const resizeObserver = new ResizeObserver(schedulePositionUpdate);
    resizeObserver.observe(canvas);
    resizeObserver.observe(popup);
    window.addEventListener('scroll', schedulePositionUpdate, true);
    window.addEventListener('resize', schedulePositionUpdate);
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedulePositionUpdate, true);
      window.removeEventListener('resize', schedulePositionUpdate);
    };
  }, [editor, attachmentPointId]);

  assert(editor.monomerCreationState);

  const { assignedAttachmentPoints } = editor.monomerCreationState;

  const selectsData = useAttachmentPointSelectsData(editor, attachmentPointId);

  if (!selectsData) {
    return null;
  }

  const handleNameChange = (newName: AttachmentPointName) => {
    if (newName !== attachmentPointName) {
      onNameChange(attachmentPointId, newName);
    }
    onClose();
  };

  const handleLeavingAtomChange = (newLeavingAtomLabel: AtomLabel) => {
    const currentAtomPair = assignedAttachmentPoints.get(attachmentPointId);

    assert(currentAtomPair);

    const { leavingAtomId } = currentAtomPair;
    const leavingAtom = editor.struct().atoms.get(leavingAtomId);
    assert(leavingAtom);

    const currentLeavingAtomLabel = leavingAtom.label;

    if (newLeavingAtomLabel !== currentLeavingAtomLabel) {
      onLeavingAtomChange(attachmentPointId, newLeavingAtomLabel);
    }
    onClose();
  };

  return (
    <div
      className={clsx(selectStyles.selectContainer, styles.popup)}
      ref={popupRef}
      data-testid="attachment-point-edit-popup"
    >
      <p className={styles.title}>{t('attachmentPointEditPopup.title')}</p>
      <AttachmentPointControls
        data={selectsData}
        onNameChange={handleNameChange}
        onLeavingAtomChange={handleLeavingAtomChange}
        className={styles.selectsWrapper}
        isPopup
      />
    </div>
  );
};

export default AttachmentPointEditPopup;
