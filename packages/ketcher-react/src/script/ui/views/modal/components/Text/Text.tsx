/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import React, { useCallback, useState, useEffect } from 'react';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  KEY_ENTER_COMMAND,
  COMMAND_PRIORITY_HIGH,
  LexicalEditor,
  TextFormatType,
  SerializedEditorState,
} from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';

import { Dialog } from '../../../components';
import { DialogParams } from '../../../../../../components/Dialog/Dialog';
import { FontControl } from './FontControl';
import { SpecialSymbolsButton } from './SpecialSymbols/SpecialSymbolsButton';
import { TextButton } from './TextButton';
import { TextCommand } from 'ketcher-core';
import classes from './Text.module.less';
import { connect } from 'react-redux';
import { IconName } from 'components';

interface TextProps extends DialogParams {
  formState: any;
  id?: any;
  content: string;
  position?: string;
}

const buttons: Array<{ command: TextCommand; name: IconName }> = [
  {
    command: TextCommand.Bold,
    name: 'text-bold',
  },
  {
    command: TextCommand.Italic,
    name: 'text-italic',
  },
  {
    command: TextCommand.Superscript,
    name: 'text-superscript',
  },
  {
    command: TextCommand.Subscript,
    name: 'text-subscript',
  },
];

const textCommandToFormat: Record<string, TextFormatType> = {
  [TextCommand.Bold]: 'bold',
  [TextCommand.Italic]: 'italic',
  [TextCommand.Subscript]: 'subscript',
  [TextCommand.Superscript]: 'superscript',
};

const editorTheme = {
  text: {
    bold: classes.textBold,
    italic: classes.textItalic,
    subscript: classes.textSubscript,
    superscript: classes.textSuperscript,
  },
};

function EnterKeyPlugin(): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        if (event) {
          event.stopPropagation();
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);
  return null;
}

function EditorRefPlugin({
  editorRef,
}: {
  editorRef: React.MutableRefObject<LexicalEditor | null>;
}): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editorRef.current = editor;
  }, [editor, editorRef]);
  return null;
}

const TextEditorInner = (props: {
  formState: any;
  position?: string;
  id?: any;
  params: TextProps;
}) => {
  const { formState, position, id, params } = props;
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const editorRef = React.useRef<LexicalEditor | null>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const formats = new Set<string>();
          if (selection.hasFormat('bold')) formats.add(TextCommand.Bold);
          if (selection.hasFormat('italic')) formats.add(TextCommand.Italic);
          if (selection.hasFormat('subscript'))
            formats.add(TextCommand.Subscript);
          if (selection.hasFormat('superscript'))
            formats.add(TextCommand.Superscript);
          setActiveFormats(formats);
        }
      });
    });
  }, [editor]);

  const result = useCallback(() => {
    let hasText = false;
    let serialized: SerializedEditorState | null = null;
    const editorState = editor.getEditorState();
    editorState.read(() => {
      const root = $getRoot();
      hasText = root.getTextContent().trim().length > 0;
    });
    if (hasText) {
      serialized = editorState.toJSON();
    }
    return {
      content: serialized ? JSON.stringify(serialized) : '',
      position,
      id,
    };
  }, [editor, position, id]);

  const toggleStyle = useCallback(
    (command: TextCommand): void => {
      const format = textCommandToFormat[command];
      if (format) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
      }
    },
    [editor],
  );

  const setFocusInEditor = useCallback(() => {
    editor.focus();
  }, [editor]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setFocusInEditor();
    }
  };

  return (
    <Dialog
      className={classes.textEditor}
      title="Text Editor"
      params={params}
      result={result}
      valid={() => formState.form.valid}
      buttonsNameMap={{ OK: 'Apply' }}
      buttons={['Cancel', 'OK']}
      withDivider
    >
      <div
        className={classes.controlPanel}
        onClick={setFocusInEditor}
        onKeyDown={handleKeyDown}
        role="toolbar"
        tabIndex={0}
        aria-label="Text formatting toolbar"
      >
        {buttons.map((button) => {
          return (
            <TextButton
              button={button}
              key={button.name}
              active={activeFormats.has(button.command)}
              toggleStyle={toggleStyle}
            />
          );
        })}
        <SpecialSymbolsButton editor={editor} />
        <span>Font Size</span>
        <FontControl editor={editor} />
      </div>
      <span>Text:</span>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={classes.editorInput}
            data-testid="text-editor"
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <EnterKeyPlugin />
      <EditorRefPlugin editorRef={editorRef} />
      <AutoFocusPlugin />
    </Dialog>
  );
};

// helper to make sure the incoming JSON is a Lexical editor state.
// Lexical serializes into an object with a "root" node and every node
// has a `type` property. Draft.js (used elsewhere in the codebase) uses a
// completely different shape (`blocks`/`entityMap`), which will blow up in
// Lexical (the error reported on line 243 is the missing `type`).
//
// We perform a quick sanity check and, if necessary, convert the minimal
// Draft shape into something Lexical understands.  Failing all else we
// fall back to undefined so Lexical starts with an empty document.
export const normalizeEditorState = (
  content: string | undefined,
): string | undefined => {
  if (!content) return undefined;
  try {
    const parsed = JSON.parse(content);

    // already Lexical?
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.root &&
      typeof parsed.root === 'object' &&
      typeof parsed.root.type === 'string'
    ) {
      return content;
    }

    // draft-js style? convert to basic lexical state (paragraphs + text)
    if (parsed && parsed.blocks && Array.isArray(parsed.blocks)) {
      const root: any = { type: 'root', version: 1, children: [] };
      parsed.blocks.forEach((block: any) => {
        const paragraph: any = { type: 'paragraph', children: [] };
        if (typeof block.text === 'string') {
          paragraph.children.push({ type: 'text', text: block.text });
        }
        root.children.push(paragraph);
      });
      return JSON.stringify({ root });
    }

    console.warn('Unsupported editor state format, falling back to empty');
  } catch (e) {
    console.warn('Failed to parse editor state', e);
  }
  return undefined;
};

const Text = (props: TextProps) => {
  const { formState, position, id } = props;

  const initialEditorState = normalizeEditorState(props.content);

  const initialConfig = {
    namespace: 'KetcherTextEditor',
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    editorState: initialEditorState,
    theme: editorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <TextEditorInner
        formState={formState}
        position={position}
        id={id}
        params={props}
      />
    </LexicalComposer>
  );
};

export default connect((store: any) => ({ formState: store.modal }))(Text);
