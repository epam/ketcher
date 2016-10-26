function defaultSettingsAndStyles(scale, opt, ctab) {
	var defaultSettingsAndStyles = {};

	var scaleFactor = scale;
	var labelFontSize = Math.ceil(1.9 * (scaleFactor / 6));
	var subFontSize = Math.ceil(0.7 * labelFontSize);
	var defaultSettings = {
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
		atomColoring: false,
		hideImplicitHydrogen: false,
		hideTerminalLabels: false,

		delta: ctab.molecule.getCoordBoundingBox(),
		margin: 0.1,
		scaleFactor: scaleFactor,
		lineWidth: scaleFactor / 20,
		bondShift: scaleFactor / 6,
		bondSpace: scaleFactor / 7,
		labelFontSize: labelFontSize,
		subFontSize: subFontSize,
		font: '30px "Arial"',
		fontsz: labelFontSize,
		fontszsub: subFontSize,
		fontRLabel: labelFontSize * 1.2,
		fontRLogic: labelFontSize * 0.7
	};
	defaultSettingsAndStyles['settings'] = Object.assign({}, defaultSettings, opt);

	var defaultStyles = {
		/* eslint-disable quote-props */
		lineattr: {
			stroke: '#000',
			'stroke-width': defaultSettings.lineWidth,
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round'
		},
		/* eslint-enable quote-props */
		selectionStyle: {
			fill: '#7f7',
			stroke: 'none'
		},
		selectionZoneStyle: {
			fill: '#000',
			stroke: 'none',
			opacity: 0.0
		},
		highlightStyle: {
			'stroke': '#0c0',
			'stroke-width': 0.6 * defaultSettings.lineWidth
		},
		sGroupHighlightStyle: {
			'stroke': '#9900ff',
			'stroke-width': 0.6 * defaultSettings.lineWidth
		},
		sgroupBracketStyle: {
			'stroke': 'darkgray',
			'stroke-width': 0.5 * defaultSettings.lineWidth
		},
		lassoStyle: {
			'stroke': 'gray',
			'stroke-width': '1px'
		},
		atomSelectionPlateRadius: defaultSettings.labelFontSize * 1.2
	};
	defaultSettingsAndStyles['styles'] = Object.assign({}, defaultStyles);

	return defaultSettingsAndStyles;
}

module.exports = defaultSettingsAndStyles;
