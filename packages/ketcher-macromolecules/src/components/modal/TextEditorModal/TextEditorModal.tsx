import styled from '@emotion/styled';
import { TextEditorDialog } from 'ketcher-react';
import type { TextEditorModalProps } from 'components/modal/modalContainer';

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.1);
`;

export const TextEditorModal = ({
  isModalOpen,
  onClose,
  initialContent,
  onApply,
}: TextEditorModalProps) => {
  if (!isModalOpen) {
    return null;
  }

  return (
    <Overlay data-testid="text-editor-modal">
      <TextEditorDialog
        initialContent={initialContent ?? ''}
        onApply={(content) => {
          onApply?.(content);
          onClose();
        }}
        onCancel={onClose}
      />
    </Overlay>
  );
};
