export const createPolymerEditorCanvas = (): SVGSVGElement => {
  const canvas: SVGSVGElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );

  canvas.setAttribute('id', 'polymer-editor-canvas');
  canvas.setAttribute('width', '500');
  canvas.setAttribute('height', '500');
  document.body.appendChild(canvas);

  canvas.appendChild(
    document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
  );

  return canvas;
};
