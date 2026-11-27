import { useTranslation } from 'react-i18next';
import { RichTextEditor } from 'ketcher-react';
import { EditorHistory, type CoreEditor } from 'ketcher-core';
import { TextEditorProps } from 'components/modal/modalContainer';
import { Modal } from 'components/shared/modal';
import { ActionButton } from 'components/shared/actionButton';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';

export const applyTextEdit = (
  editor: CoreEditor,
  { position, text }: Pick<TextEditorProps, 'position' | 'text'>,
  content: string,
) => {
  const manager = editor.drawingEntitiesManager;
  let command;

  if (text) {
    command = content
      ? manager.updateText(text, content)
      : manager.deleteDrawingEntity(text);
  } else if (content) {
    command = manager.addText(content, position);
  }

  if (!command) {
    return;
  }

  editor.renderersContainer.update(command);
  EditorHistory.getInstance(editor).update(command);
};

export const TextEditorModal = ({
  position,
  text,
  isModalOpen,
  onClose,
}: TextEditorProps) => {
  const { t } = useTranslation(['macromoleculesDialogs', 'common']);
  const editor = useAppSelector(selectEditor);

  return (
    <Modal
      isOpen={isModalOpen}
      title={t('macromoleculesDialogs:textEditor.title')}
      onClose={onClose}
      testId="text-editor-modal"
    >
      <Modal.Content>
        <RichTextEditor
          labels={{
            toolbar: t('macromoleculesDialogs:textEditor.toolbar'),
            fontSize: t('macromoleculesDialogs:textEditor.fontSize'),
            text: t('macromoleculesDialogs:textEditor.text'),
          }}
          initialContent={text?.content}
        >
          {(getContent) => (
            <Modal.Footer>
              <ActionButton
                label={t('common:button.cancel')}
                clickHandler={onClose}
                data-testid="text-editor-cancel"
              />
              <ActionButton
                label={t('common:button.apply')}
                styleType="secondary"
                clickHandler={() => {
                  if (editor) {
                    applyTextEdit(editor, { position, text }, getContent());
                  }
                  onClose();
                }}
                data-testid="text-editor-apply"
              />
            </Modal.Footer>
          )}
        </RichTextEditor>
      </Modal.Content>
    </Modal>
  );
};
