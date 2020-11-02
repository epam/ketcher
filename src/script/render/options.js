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

import utils from '../editor/shared/utils';
import Vec2 from '../util/vec2';

function defaultOptions(opt) {
	const scaleFactor = opt.scale || 100;

	if (opt.rotationStep)
		utils.setFracAngle(opt.rotationStep);

	const labelFontSize = Math.ceil(1.9 * (scaleFactor / 6));
	const subFontSize = Math.ceil(0.7 * labelFontSize);

	const defaultOptions = {
		// flags for debugging
		showAtomIds: false,
		showBondIds: false,
		showHalfBondIds: false,
		showLoopIds: false,
		// rendering customization flags
		hideChiralFlag: false,
		showValenceWarnings: true,
		autoScale: false, // scale structure to fit into the given view box, used in view mode
		autoScaleMargin: 0,
		maxBondLength: 0, // 0 stands for "not specified"
		atomColoring: true,
		hideImplicitHydrogen: false,
		hideTerminalLabels: false,
		// atoms
		carbonExplicitly: false,
		showCharge: true,
		showHydrogenLabels: 'on',
		showValence: true,
		// bonds
		aromaticCircle: true,

		scale: scaleFactor,
		zoom: 1.0,
		offset: new Vec2(),

		lineWidth: scaleFactor / 20,
		bondSpace: opt.doubleBondWidth || scaleFactor / 7,
		stereoBond: opt.stereoBondWidth || scaleFactor / 7,
		subFontSize,
		font: '30px Arial',
		fontsz: labelFontSize,
		fontszsub: subFontSize,
		fontRLabel: labelFontSize * 1.2,
		fontRLogic: labelFontSize * 0.7,

		/* styles */
		lineattr: {
			stroke: '#000',
			'stroke-width': opt.bondThickness || scaleFactor / 20,
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round'
		},
		/* eslint-enable quote-props */
		selectionStyle: {
			fill: '#7f7',
			stroke: 'none'
		},
		highlightStyle: {
			stroke: '#0c0',
			'stroke-width': 0.6 * scaleFactor / 20
		},
		sgroupBracketStyle: {
			stroke: 'darkgray',
			'stroke-width': 0.5 * scaleFactor / 20
		},
		lassoStyle: {
			stroke: 'gray',
			'stroke-width': '1px'
		},
		atomSelectionPlateRadius: labelFontSize * 1.2
	};

	return Object.assign({}, defaultOptions, opt);
}

export default defaultOptions;
