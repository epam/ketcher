/****************************************************************************
 * Copyright 2018 EPAM Systems
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
