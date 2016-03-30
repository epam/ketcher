var keymage = require('keymage');
var element = require('../chem/element');

var ui = global.ui;

function labelEdit (params)
{
	var el = $('input_label');
	var handlers = [];

	keymage.setScope('context');
	el.show();

	function stop(event) {
		var res = deserialize(this.value);
		var key = event.keyCode;
		if (!key || key == 27 || res && key == 13) {
			handlers.forEach(function (h) { h.stop(); });
			el.hide();
			keymage.setScope('editor');
			var cb = key && params[key == 13 ? 'onOk' : 'onCancel'];
			if (cb)
				cb(res);
		}
	}
	handlers[0] = el.on('blur', stop);
	handlers[1] = el.on('keydown', stop);

	// TODO: some other way to handle pos
	//var clientOffset = ui.client_area.cumulativeOffset();
	var clientOffset = {left: 0, top: 0};
	var parentOffset = Element.cumulativeOffset(el.offsetParent);
	var d = 0; // TODO: fix/Math.ceil(4 * ui.abl() / 100);
	var offset = Math.min(7 * ui.render.zoom, 16);

	el.style.left = (params.pos.x + clientOffset.left - parentOffset.left - offset - d) + 'px';
	el.style.top = (params.pos.y + clientOffset.top - parentOffset.top - offset - d) + 'px';
	el.style.fontSize = offset * 2 + 'px';
	el.value = serialize(params);

	el.activate();
};

function serialize(lc) {
	if (!lc.charge)
		return lc.label;
	var sign = lc.charge < 0 ? '-' : '+';
	var charge = Math.abs(lc.charge);
	return lc.label + (charge > 1 ? charge: '') + sign;
}

function deserialize(value) {
	var match = value.match(/^([a-z*]{1,3})(\d[-+]|[-+]\d|[-+])?$/i);
	if (match) {
		var label = match[1] == '*' ? 'A' : match[1].capitalize();
		var charge = 0;
		if (match[2]) {
			charge = parseInt(match[2]);
			if (isNaN(charge)) // NaN => [-+]
				charge = 1;
			if (match[2].endsWith('-'))
				charge = -charge;
		}
		// Not consistant
		if (label == 'A' || label == 'Q' || label == 'X' || element.getElementByLabel(label) != null)
			return { label: label, charge: charge };
	}
	return null;
}

module.exports = labelEdit;
