// Conversion helpers for Draft.js to Lexical format
// Copyright 2021 EPAM Systems

export {
  convertDraftToLexical,
  parseTextContentAsLexical,
  normalizeTextContentToLexical,
} from 'domain/helpers';

export type {
  DraftInlineStyleRange,
  DraftBlock,
  DraftEditorState,
  SerializedTextNode,
  SerializedParagraphNode,
  SerializedRootNode,
  SerializedEditorState,
} from 'domain/helpers';
