const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const FORBIDDEN_ELEMENTS = new Set(['script', 'foreignobject']);
const PREDEFINED_OR_NUMERIC_REFERENCE =
  /(?:amp|lt|gt|quot|apos|#\d{1,7}|#x[\da-fA-F]{1,6});/y;
const NUMERIC_REFERENCE = /&#(x[\da-fA-F]{1,6}|\d{1,7});/g;
const MAX_CODE_POINT = 0x10ffff;

function isWhitespace(code: number): boolean {
  return code === 32 || code === 9 || code === 10 || code === 13;
}

function isNameStartChar(code: number): boolean {
  return (
    code === 58 ||
    code === 95 ||
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    code > 127
  );
}

function isNameChar(code: number): boolean {
  return (
    isNameStartChar(code) ||
    code === 45 ||
    code === 46 ||
    (code >= 48 && code <= 57)
  );
}

function skipWhitespace(markup: string, position: number): number {
  let index = position;
  while (index < markup.length && isWhitespace(markup.charCodeAt(index))) {
    index++;
  }
  return index;
}

function readName(markup: string, position: number): number {
  if (
    position >= markup.length ||
    !isNameStartChar(markup.charCodeAt(position))
  ) {
    return position;
  }

  let index = position + 1;
  while (index < markup.length && isNameChar(markup.charCodeAt(index))) {
    index++;
  }
  return index;
}

function isBlank(text: string): boolean {
  for (let index = 0; index < text.length; index++) {
    if (!isWhitespace(text.charCodeAt(index))) {
      return false;
    }
  }
  return true;
}

// Only predefined and numeric references are allowed, so nothing can expand.
function hasOnlyValidReferences(text: string): boolean {
  let index = text.indexOf('&');
  while (index !== -1) {
    PREDEFINED_OR_NUMERIC_REFERENCE.lastIndex = index + 1;
    if (!PREDEFINED_OR_NUMERIC_REFERENCE.test(text)) {
      return false;
    }
    index = text.indexOf('&', index + 1);
  }
  return true;
}

function decodeNumericReferences(value: string): string {
  return value.replace(NUMERIC_REFERENCE, (_match, code: string) => {
    const codePoint =
      code[0] === 'x' ? parseInt(code.slice(1), 16) : parseInt(code, 10);
    return codePoint <= MAX_CODE_POINT ? String.fromCodePoint(codePoint) : '';
  });
}

function getLocalName(name: string): string {
  return name.slice(name.indexOf(':') + 1);
}

// Returns the position after the DOCTYPE, or -1. An internal subset ('[') is
// rejected because it is the only place where entities can be declared.
function skipDoctype(markup: string, position: number): number {
  let quote: string | null = null;

  for (let index = position; index < markup.length; index++) {
    const char = markup[index];
    if (quote) {
      if (char === quote) {
        quote = null;
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '[') {
      return -1;
    } else if (char === '>') {
      return index + 1;
    }
  }

  return -1;
}

interface StartTag {
  attributes: Map<string, string>;
  end: number;
  selfClosing: boolean;
}

function readStartTag(markup: string, nameEnd: number): StartTag | null {
  const attributes = new Map<string, string>();
  let position = nameEnd;

  for (;;) {
    const attributeStart = skipWhitespace(markup, position);
    const char = markup[attributeStart];

    if (char === '>') {
      return { attributes, end: attributeStart + 1, selfClosing: false };
    }
    if (char === '/') {
      return markup[attributeStart + 1] === '>'
        ? { attributes, end: attributeStart + 2, selfClosing: true }
        : null;
    }
    if (attributeStart === position) {
      return null;
    }

    const attributeNameEnd = readName(markup, attributeStart);
    if (attributeNameEnd === attributeStart) {
      return null;
    }
    const attributeName = markup.slice(attributeStart, attributeNameEnd);

    const equalsPosition = skipWhitespace(markup, attributeNameEnd);
    if (markup[equalsPosition] !== '=') {
      return null;
    }

    const valueStart = skipWhitespace(markup, equalsPosition + 1);
    const quote = markup[valueStart];
    if (quote !== '"' && quote !== "'") {
      return null;
    }
    const valueEnd = markup.indexOf(quote, valueStart + 1);
    if (valueEnd === -1) {
      return null;
    }

    const value = markup.slice(valueStart + 1, valueEnd);
    if (
      attributes.has(attributeName) ||
      value.includes('<') ||
      !hasOnlyValidReferences(value)
    ) {
      return null;
    }

    attributes.set(attributeName, value);
    position = valueEnd + 1;
  }
}

function isStartTagAllowed(
  name: string,
  attributes: Map<string, string>,
  isRoot: boolean,
): boolean {
  const localName = getLocalName(name);
  if (FORBIDDEN_ELEMENTS.has(localName.toLowerCase())) {
    return false;
  }

  if (isRoot) {
    const prefixLength = name.length - localName.length;
    const namespaceAttribute =
      prefixLength > 0 ? `xmlns:${name.slice(0, prefixLength - 1)}` : 'xmlns';
    if (
      localName !== 'svg' ||
      attributes.get(namespaceAttribute) !== SVG_NAMESPACE
    ) {
      return false;
    }
  }

  for (const [attributeName, value] of attributes) {
    const normalizedValue = decodeNumericReferences(value)
      .replace(/\s+/g, '')
      .toLowerCase();

    if (
      getLocalName(attributeName).toLowerCase().startsWith('on') ||
      normalizedValue.includes('javascript:')
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Checks that the markup is a well-formed SVG document without active content.
 * The markup is scanned in linear time and is never handed to an XML parser,
 * so entity expansion and other parser-level DoS vectors are not possible.
 */
export function isSvgMarkupValid(markup: string): boolean {
  const openElements: string[] = [];
  let position = markup.charCodeAt(0) === 0xfeff ? 1 : 0;
  let rootSeen = false;

  while (position < markup.length) {
    if (markup[position] !== '<') {
      const nextTag = markup.indexOf('<', position);
      const end = nextTag === -1 ? markup.length : nextTag;
      const text = markup.slice(position, end);
      const isTextValid =
        openElements.length === 0
          ? isBlank(text)
          : hasOnlyValidReferences(text);
      if (!isTextValid) {
        return false;
      }
      position = end;
    } else if (markup.startsWith('<!--', position)) {
      const end = markup.indexOf('-->', position + 4);
      if (end === -1) {
        return false;
      }
      const comment = markup.slice(position + 4, end);
      if (comment.includes('--') || comment.endsWith('-')) {
        return false;
      }
      position = end + 3;
    } else if (markup.startsWith('<?', position)) {
      const end = markup.indexOf('?>', position + 2);
      if (end === -1) {
        return false;
      }
      position = end + 2;
    } else if (markup.startsWith('<![CDATA[', position)) {
      const end = markup.indexOf(']]>', position + 9);
      if (openElements.length === 0 || end === -1) {
        return false;
      }
      position = end + 3;
    } else if (markup.startsWith('<!DOCTYPE', position)) {
      if (rootSeen) {
        return false;
      }
      position = skipDoctype(markup, position + 9);
      if (position === -1) {
        return false;
      }
    } else if (markup.startsWith('</', position)) {
      const nameEnd = readName(markup, position + 2);
      const closeEnd = skipWhitespace(markup, nameEnd);
      if (
        nameEnd === position + 2 ||
        markup[closeEnd] !== '>' ||
        openElements.pop() !== markup.slice(position + 2, nameEnd)
      ) {
        return false;
      }
      position = closeEnd + 1;
    } else {
      const nameEnd = readName(markup, position + 1);
      if (nameEnd === position + 1 || (rootSeen && openElements.length === 0)) {
        return false;
      }
      const name = markup.slice(position + 1, nameEnd);
      const startTag = readStartTag(markup, nameEnd);
      if (
        !startTag ||
        !isStartTagAllowed(name, startTag.attributes, !rootSeen)
      ) {
        return false;
      }
      rootSeen = true;
      if (!startTag.selfClosing) {
        openElements.push(name);
      }
      position = startTag.end;
    }
  }

  return rootSeen && openElements.length === 0;
}
