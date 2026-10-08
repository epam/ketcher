import { isSvgMarkupValid } from 'domain/serializers/ket/ketSvgValidation';

const NS = 'xmlns="http://www.w3.org/2000/svg"';
const svg = (body: string) => `<svg ${NS}>${body}</svg>`;

describe('isSvgMarkupValid', () => {
  it.each([
    ['plain svg', svg('<rect width="1" height="1"/>')],
    [
      'xml declaration and comment',
      `<?xml version="1.0"?><!-- a -->${svg('')}`,
    ],
    ['byte order mark', `﻿${svg('')}`],
    [
      'doctype with external id',
      `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">${svg('')}`,
    ],
    ['prefixed root', '<s:svg xmlns:s="http://www.w3.org/2000/svg"></s:svg>'],
    [
      'cdata and predefined references',
      svg('<style><![CDATA[a>b]]></style>&amp;&#65;&#x41;'),
    ],
    ['">" inside attribute value', svg('<text title="a>b">x</text>')],
    ['trailing whitespace and comment', `${svg('')}\n<!-- end -->\n`],
  ])('accepts %s', (_name, markup) => {
    expect(isSvgMarkupValid(markup)).toBe(true);
  });

  it.each([
    ['empty input', ''],
    ['no root', '<!-- only a comment -->'],
    ['non-svg root', '<html xmlns="http://www.w3.org/2000/svg"></html>'],
    ['missing namespace', '<svg></svg>'],
    ['wrong namespace', '<svg xmlns="http://example.com"></svg>'],
    ['truncated', `<svg ${NS}><g>`],
    ['mismatched tags', svg('<g></h>')],
    ['unclosed nested element', `<svg ${NS}><g></svg>`],
    ['second root element', `${svg('')}<svg ${NS}></svg>`],
    ['text after root', `${svg('')}text`],
    ['unquoted attribute', svg('<rect width=1/>')],
    ['unterminated attribute value', svg('<rect width="1/>')],
    ['duplicate attribute', svg('<rect a="1" a="2"/>')],
    ['attributes without separator', svg('<rect a="1"b="2"/>')],
    ['"<" in attribute value', svg('<rect a="<"/>')],
    ['unterminated comment', `${svg('')}<!-- x`],
    ['double dash in comment', svg('<!-- a -- b -->')],
    ['undefined entity reference', svg('&nbsp;')],
    ['bare ampersand', svg('a & b')],
    ['cdata outside root', `<![CDATA[x]]>${svg('')}`],
    ['doctype after root', `${svg('')}<!DOCTYPE svg>`],
    ['entity declaration', `<!DOCTYPE svg [<!ENTITY a "b">]>${svg('&a;')}`],
    ['internal subset', `<!DOCTYPE svg [ ]>${svg('')}`],
    ['script element', svg('<script>alert(1)</script>')],
    ['prefixed script element', svg('<x:script/>')],
    ['foreignObject element', svg('<foreignObject/>')],
    ['event handler attribute', svg('<g onload="x()"/>')],
    ['javascript: url', svg('<a href="javascript:alert(1)"/>')],
    [
      'obfuscated javascript: url',
      svg('<a href="java&#115;cript&#x3a;alert(1)"/>'),
    ],
    ['whitespace in javascript: url', svg('<a href="java\nscript:alert(1)"/>')],
  ])('rejects %s', (_name, markup) => {
    expect(isSvgMarkupValid(markup)).toBe(false);
  });

  it('rejects an entity expansion bomb without expanding it', () => {
    const lol = '<!ENTITY lol "lol">';
    const lol2 = `<!ENTITY lol2 "${'&lol;'.repeat(10)}">`;
    const bomb = `<!DOCTYPE svg [${lol}${lol2}]>${svg('&lol2;')}`;

    expect(isSvgMarkupValid(bomb)).toBe(false);
  });

  it('handles very deep nesting and large inputs in linear time', () => {
    const depth = 100_000;
    const deepSvg = `<svg ${NS}>${'<g>'.repeat(depth)}${'</g>'.repeat(depth)}</svg>`;
    const largeAttribute = svg(`<path d="${'M0 0 '.repeat(500_000)}"/>`);
    const manyAmpersands = svg('&amp;'.repeat(500_000));

    const start = Date.now();
    expect(isSvgMarkupValid(deepSvg)).toBe(true);
    expect(isSvgMarkupValid(largeAttribute)).toBe(true);
    expect(isSvgMarkupValid(manyAmpersands)).toBe(true);
    expect(isSvgMarkupValid(svg('<!--'.repeat(100_000)))).toBe(false);
    expect(Date.now() - start).toBeLessThan(5000);
  });
});
