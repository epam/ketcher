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

const renderDiff = require('./render-diff').diff;
const Render = require('../../src/script/render').default;

const ketcher = {
	molfile: require('../../src/script/chem/molfile').default,
	render: function render(el, struct, opts) {
		var render = new Render(el, opts);
		render.setMolecule(struct);
		render.update();
	}
};

var defaultOpts = {
	width: 600,
	height: 400,
	render: {
		bondLength: 75,
		showSelectionRegions: false,
		showBondIds: false,
		showHalfBondIds: false,
		showLoopIds: false,
		showAtomIds: false,
		autoScale: true,
		autoScaleMargin: 5,
		hideImplicitHydrogen: false,
		hideChiralFlag: true
	}
};

function createStyle(style) {
	return Object.keys(style).reduce((str, prop) => {
		var value = style[prop];
		if (typeof value == 'object')
			return str;
		if (typeof value == 'number' || typeof value == 'string')
			value += 'px';
		return str += `${prop}: ${value};`;
	}, '');
}

function createEl(name, opts, parent) {
	var [tag, id] = name.split('#');
	var el = document.createElement(tag || 'div');
	if (id)
		el.id = id;
	el.style = createStyle(opts);
	(parent || document.body).appendChild(el);
	return el;
}

function ketcherRender(structStr, options) {
	let opts = Object.assign({}, defaultOpts, options);
	var target = createEl('#canvas-ketcher', opts);
	var struct = ketcher.molfile.parse(structStr);
	ketcher.render(target, struct, opts.render);
	return target.firstElementChild;
}

function symbolRender(symbolStr) {
	const symbol = new DOMParser().parseFromString(symbolStr, "application/xml").firstElementChild;

	let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	for (let attr of symbol.attributes)
		svg.setAttribute(attr.name, attr.value);
	svg.innerHTML = symbol.innerHTML;

	return svg;
}

function renderTest(structStr, opts) {
	document.body.innerHTML = '';
	return ketcherRender(structStr, opts);
}

function compareTest(structStr, symbolStr, opts) {
	console.info('sample', opts.sample);

	document.body.innerHTML = '';

	var renderOpts = {
		onComplete: function (diff) {
			document.body.innerHTML = '';
			var diffImage = new Image();
			diffImage.src = diff.getImageDataUrl();

			document.body.appendChild(diffImage);
			createEl('output#cmp', {
				color: 'green'
			}).innerHTML = `Mismatch: ${diff.misMatchPercentage}`;
		},
		methods: ['ignoreAntialiasing', 'useOriginalSize']
	};

	var cmp = renderDiff(
		ketcherRender(structStr, opts),
		symbolRender(symbolStr),
		renderOpts);

	cmp.then(function () {
		console.info('Cmp complete');
	});
}

window.renderTest = renderTest;
window.compareTest = compareTest;
