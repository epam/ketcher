var Vec2 = require('../util/vec2');

function defaultOptions(opt) {
	var scaleFactor = opt.scale || 100;

	var labelFontSize = Math.ceil(1.9 * (scaleFactor / 6));
	var subFontSize = Math.ceil(0.7 * labelFontSize);

	var defaultOptions = {
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

		scale: scaleFactor,
		zoom: 1.0,
		offset: new Vec2(),

		lineWidth: scaleFactor / 20,
		bondSpace: opt.doubleBondWidth || scaleFactor / 7,
		stereoBond: opt.stereoBondWidth || scaleFactor / 7,
		showHydrogenLabels: 'on',
		subFontSize: subFontSize,
		font: '30px "Arial"',
		fontsz: labelFontSize,
		fontszsub: subFontSize,
		fontRLabel: labelFontSize * 1.2,
		fontRLogic: labelFontSize * 0.7,

		/* styles */
		lineattr: {
			'stroke': '#000',
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
			'stroke': '#0c0',
			'stroke-width': 0.6 * scaleFactor / 20
		},
		sgroupBracketStyle: {
			'stroke': 'darkgray',
			'stroke-width': 0.5 * scaleFactor / 20
		},
		lassoStyle: {
			'stroke': 'gray',
			'stroke-width': '1px'
		},
		atomSelectionPlateRadius: labelFontSize * 1.2
	};

	return Object.assign({}, defaultOptions, opt);
}

module.exports = defaultOptions;
