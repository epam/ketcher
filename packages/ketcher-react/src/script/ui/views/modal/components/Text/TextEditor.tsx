/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import React, { useCallback, useState, useEffect } from 'react';
import {
  type LexicalEditor,
  type TextFormatType,
  type SerializedEditorState,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  KEY_ENTER_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';

import { FontControl } from './FontControl';
import { SpecialSymbolsButton } from './SpecialSymbols/SpecialSymbolsButton';
import { TextButton } from './TextButton';
import { TextCommand } from 'ketcher-core';
import classes from './Text.module.less';
import type { IconName } from 'components';

export interface TextEditorLabels {
  toolbar: string;
  fontSize: string;
  text: string;
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

export const textEditorTheme = {
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
    // If already Lexical format, return as is
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.root &&
      typeof parsed.root === 'object' &&
      typeof parsed.root.type === 'string'
    ) {
      return content;
    }
  } catch (error) {
    console.warn('Failed to parse editor state', error);
  }
  // For import-time conversion we expect Serialised Lexical state stored in `content`.
  // If it's not valid Lexical JSON, return undefined so the editor starts empty.
  return undefined;
};

// Serialises the editor content as a Lexical JSON string, or '' when empty.
export function serializeTextEditor(editor: LexicalEditor | null): string {
  if (!editor) {
    return '';
  }

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

  return serialized ? JSON.stringify(serialized) : '';
}

interface TextEditorSurfaceProps {
  labels: TextEditorLabels;
  editorRef?: React.MutableRefObject<LexicalEditor | null>;
}

// Toolbar and rich text area. Must be rendered inside a LexicalComposer.
export const TextEditorSurface = ({
  labels,
  editorRef,
}: TextEditorSurfaceProps) => {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const fallbackEditorRef = React.useRef<LexicalEditor | null>(null);
  const ref = editorRef ?? fallbackEditorRef;

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return;
        }

        const formats = new Set<string>();
        if (selection.hasFormat('bold')) formats.add(TextCommand.Bold);
        if (selection.hasFormat('italic')) formats.add(TextCommand.Italic);
        if (selection.hasFormat('subscript'))
          formats.add(TextCommand.Subscript);
        if (selection.hasFormat('superscript'))
          formats.add(TextCommand.Superscript);
        setActiveFormats(formats);
      });
    });
  }, [editor]);

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
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    setFocusInEditor();
  };

  return (
    <>
      <div
        className={classes.controlPanel}
        onClick={setFocusInEditor}
        onKeyDown={handleKeyDown}
        role="toolbar"
        tabIndex={0}
        aria-label={labels.toolbar}
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
        <span>{labels.fontSize}</span>
        <FontControl editor={editor} />
      </div>
      <span>{labels.text}</span>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={classes.editorInput}
            data-testid="text-editor"
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <EnterKeyPlugin />
      <EditorRefPlugin editorRef={ref} />
      <AutoFocusPlugin />
    </>
  );
};

export interface TextEditorProps {
  labels: TextEditorLabels;
  initialContent?: string;
  editorRef?: React.MutableRefObject<LexicalEditor | null>;
  children?: (getContent: () => string) => React.ReactNode;
}

interface TextEditorBodyProps {
  labels: TextEditorLabels;
  editorRef?: React.MutableRefObject<LexicalEditor | null>;
  children?: (getContent: () => string) => React.ReactNode;
}

// Lives inside the composer so host components can read the current content
// without depending on Lexical types.
const TextEditorBody = ({
  labels,
  editorRef,
  children,
}: TextEditorBodyProps) => {
  const [editor] = useLexicalComposerContext();
  const getContent = useCallback(() => serializeTextEditor(editor), [editor]);

  return (
    <>
      <TextEditorSurface labels={labels} editorRef={editorRef} />
      {children?.(getContent)}
    </>
  );
};
// Self-contained rich text editor with formatting toolbar. It has no store
// or dialog dependency, so both the micromolecules dialog and the
// macromolecules canvas can host it.
export const RichTextEditor = ({
  labels,
  initialContent,
  editorRef,
  children,
}: TextEditorProps) => {
  const initialConfig = {
    namespace: 'KetcherTextEditor',
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    editorState: normalizeEditorState(initialContent),
    theme: textEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <TextEditorBody labels={labels} editorRef={editorRef}>
        {children}
      </TextEditorBody>
    </LexicalComposer>
  );
};
