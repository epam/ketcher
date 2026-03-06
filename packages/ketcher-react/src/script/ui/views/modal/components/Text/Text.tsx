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

type DraftInlineStyleRange = {
  offset: number;
  length: number;
  style: string;
};

type DraftBlock = {
  key: string;
  text: string;
  type: 'unstyled';
  depth: number;
  inlineStyleRanges: DraftInlineStyleRange[];
  entityRanges: Array<never>;
  data: Record<string, never>;
};

type DraftEditorState = {
  blocks: DraftBlock[];
  entityMap: Record<string, never>;
};

interface SerializedTextNode {
  format: number;
  style?: string;
  text: string;
  type: string;
}

const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

function extractFontSizeFromStyle(style?: string): string | null {
  if (!style) return null;

  const fontSizeMatch = style.match(/font-size:\s*(\d+(?:\.\d+)?)px/);
  if (!fontSizeMatch) return null;

  const fontSize = Math.round(Number(fontSizeMatch[1]));
  return Number.isFinite(fontSize) ? `CUSTOM_FONT_SIZE_${fontSize}px` : null;
}

function addStyleRange(
  style: string,
  offset: number,
  length: number,
  inlineStyleRanges: DraftInlineStyleRange[],
) {
  if (length <= 0) return;

  inlineStyleRanges.push({
    style,
    offset,
    length,
  });
}

function lexicalParagraphToDraftBlock(
  paragraph: any,
  index: number,
): DraftBlock {
  const children = Array.isArray(paragraph?.children) ? paragraph.children : [];
  const textNodes = children.filter(
    (child: any): child is SerializedTextNode => child?.type === 'text',
  );

  const text = textNodes.map((node) => node.text ?? '').join('');
  const inlineStyleRanges: DraftInlineStyleRange[] = [];

  let offset = 0;
  textNodes.forEach((node) => {
    const nodeText = node.text ?? '';
    const length = nodeText.length;
    const format = node.format || 0;

    if (format & IS_BOLD) {
      addStyleRange('BOLD', offset, length, inlineStyleRanges);
    }

    if (format & IS_ITALIC) {
      addStyleRange('ITALIC', offset, length, inlineStyleRanges);
    }

    if (format & IS_SUBSCRIPT) {
      addStyleRange('SUBSCRIPT', offset, length, inlineStyleRanges);
    }

    if (format & IS_SUPERSCRIPT) {
      addStyleRange('SUPERSCRIPT', offset, length, inlineStyleRanges);
    }

    const customFontSizeStyle = extractFontSizeFromStyle(node.style);
    if (customFontSizeStyle) {
      addStyleRange(customFontSizeStyle, offset, length, inlineStyleRanges);
    }

    offset += length;
  });

  return {
    key: `${index}`,
    text,
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges,
    entityRanges: [],
    data: {},
  };
}

function lexicalToDraftEditorState(
  editorState: SerializedEditorState,
): DraftEditorState {
  const rootChildren = Array.isArray((editorState as any)?.root?.children)
    ? (editorState as any).root.children
    : [];

  const paragraphs = rootChildren.filter(
    (child: any) => child?.type === 'paragraph',
  );

  const blocks = paragraphs.map((paragraph, index) =>
    lexicalParagraphToDraftBlock(paragraph, index),
  );

  return {
    blocks,
    entityMap: {},
  };
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

    const serializedDraft = serialized
      ? JSON.stringify(lexicalToDraftEditorState(serialized))
      : '';

    return {
      content: serializedDraft,
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

// Constants for Draft.js to Lexical format conversion
const LEXICAL_FORMAT_BOLD = 1;
const LEXICAL_FORMAT_ITALIC = 2;
const LEXICAL_FORMAT_SUBSCRIPT = 32;
const LEXICAL_FORMAT_SUPERSCRIPT = 64;

// Helper function to convert Draft.js inline style to Lexical format bitmask
function draftStyleToLexicalFormat(styleString: string): number {
  let format = 0;
  if (styleString === 'BOLD') format |= LEXICAL_FORMAT_BOLD;
  if (styleString === 'ITALIC') format |= LEXICAL_FORMAT_ITALIC;
  if (styleString === 'SUBSCRIPT') format |= LEXICAL_FORMAT_SUBSCRIPT;
  if (styleString === 'SUPERSCRIPT') format |= LEXICAL_FORMAT_SUPERSCRIPT;
  return format;
}

// Helper function to extract font size style from Draft.js custom style
function extractFontSizeStyle(styleString: string): string {
  const match = /^CUSTOM_FONT_SIZE_(\d+)px$/.exec(styleString);
  if (match) {
    return `font-size:${match[1]}px;`;
  }
  return '';
}

// Convert Draft.js block with inline styles to Lexical text nodes with proper formatting
function convertDraftBlockToLexical(
  block: any,
): Array<{ type: string; text: string; format?: number; style?: string }> {
  const textChildren: Array<{
    type: string;
    text: string;
    format?: number;
    style?: string;
  }> = [];

  if (!block.text || block.text.length === 0) {
    return [{ type: 'br' } as any];
  }

  // Build character style information from inline style ranges
  const charFormats: number[] = new Array(block.text.length).fill(0);
  const charStyles: string[] = new Array(block.text.length).fill('');

  if (block.inlineStyleRanges && Array.isArray(block.inlineStyleRanges)) {
    block.inlineStyleRanges.forEach(
      (range: { offset: number; length: number; style: string }) => {
        const startIdx = range.offset;
        const endIdx = Math.min(range.offset + range.length, block.text.length);

        for (let i = startIdx; i < endIdx; i++) {
          charFormats[i] |= draftStyleToLexicalFormat(range.style);
          charStyles[i] += extractFontSizeStyle(range.style);
        }
      },
    );
  }

  // Group consecutive characters with identical styles into segments
  let i = 0;
  while (i < block.text.length) {
    const currentFormat = charFormats[i];
    const currentStyle = charStyles[i];
    let j = i;

    // Find the end of this style segment
    while (
      j < block.text.length &&
      charFormats[j] === currentFormat &&
      charStyles[j] === currentStyle
    ) {
      j++;
    }

    // Create text node for this segment
    const textNode: any = {
      type: 'text',
      text: block.text.substring(i, j),
    };

    if (currentFormat > 0) {
      textNode.format = currentFormat;
    }
    if (currentStyle) {
      textNode.style = currentStyle;
    }

    textChildren.push(textNode);
    i = j;
  }

  return textChildren;
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

    // draft-js style? convert to lexical state with proper inline styles
    if (parsed && parsed.blocks && Array.isArray(parsed.blocks)) {
      const root: any = { type: 'root', version: 1, children: [] };
      parsed.blocks.forEach((block: any) => {
        const paragraph: any = { type: 'paragraph', children: [] };
        if (typeof block.text === 'string') {
          const textNodes = convertDraftBlockToLexical(block);
          paragraph.children.push(...textNodes);
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
