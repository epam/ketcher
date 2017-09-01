/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

var resemble = require('resemblejs');

function diff(el1, el2, opts) {
	console.info("diff", el1, el2);
	let s = new XMLSerializer();
	let renderEl = document.body;
	let can1 = document.createElement('canvas');
	let can2 = document.createElement('canvas');
	renderEl.appendChild(can1);
	renderEl.appendChild(can2);

	let svg1 = el1;
	setCanvasSizeFromSVG(can1, svg1);
	let strSvg1 = s.serializeToString(svg1);

	let svg2 = el2;
	setCanvasSizeFromSVG(can2, svg2);
	let strSvg2 = s.serializeToString(svg2);

	return Promise.all([
		drawSVGonCanvas(strSvg1, can1),
		drawSVGonCanvas(strSvg2, can2)
	]).then(() => compareCanvas(can1, can2, opts));
}

function setCanvasSizeFromSVG(canvas, svgEl) {
	svgEl.removeAttribute('style');
	canvas.width = svgEl.attributes.width.value;
	canvas.height = svgEl.attributes.height.value;
}

function drawSVGonCanvas(strSVG, canvas) {
	return new Promise((res, rej) => {
		let img = new Image();
		img.onload = () => {
			canvas.getContext('2d').drawImage(img, 0, 0);
			res();
		};
		img.onerror = () => rej();
		img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(strSVG);
	});
}

/** opts: {
		errorColor: {red: int, green: int, blue: int},
		errorType: 'flat' || 'movement' || 'flatDifferenceIntensity' || 'movementDifferenceIntensity',
		transparency: 0<= x <=1,
		largeImageThreshold: !== undefined,
		useCrossOrigin: !== undefined
	}
 	opts.methods: [
 		'ignoreColors' || 'ignoreNothing' || 'ignoreAntialiasing' || 'scaleToSameSize'
 		'scaleToSameSize' || 'useOriginalSize'
 	]
 */
function compareCanvas(c1, c2, opts) {
	let cmp = resemble(c1.toDataURL('image/png'))
	    .compareTo(c2.toDataURL('image/png'));

	resemble.outputSettings(opts || {});

	if (opts.methods)
		for (let method of opts.methods) cmp = cmp[method]();

	c1.remove(); c2.remove();
	return Promise.resolve(cmp.onComplete(opts.onComplete));
}

function changeOutputOpts(opts) {
	resemble.outputSettings(opts);
}

module.exports = {
	diff,
	changeOutputOpts
};
