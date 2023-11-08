export const createSvgElement = (qualifiedName: string): SVGElement => {
  return document.createElementNS('http://www.w3.org/2000/svg', qualifiedName);
};

export const createPolymerEditorCanvas = (): SVGSVGElement => {
  const canvas = createSvgElement('svg');

  canvas.setAttribute('id', 'polymer-editor-canvas');
  canvas.setAttribute('width', '500');
  canvas.setAttribute('height', '500');
  document.body.appendChild(canvas);

  const defs = createSvgElement('defs');

  canvas.appendChild(defs);

  const drawnStructuresWrapper = createSvgElement('g');
  drawnStructuresWrapper.classList.add('drawn-structures');

  canvas.appendChild(drawnStructuresWrapper);

  const peptideSymbol = createSvgElement('symbol');

  peptideSymbol.setAttribute('id', 'peptide');

  const peptideBody = createSvgElement('path');

  peptideBody.classList.add('monomer-body');

  defs.appendChild(peptideSymbol);

  peptideSymbol.appendChild(peptideBody);

  return canvas as SVGSVGElement;
};
