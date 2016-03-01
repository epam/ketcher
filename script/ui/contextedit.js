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
	return lc.label + Math.abs(lc.charge) + sign;
}

// TODO: rewrite me to single regexp
function deserialize(value) {
	var label = '';
	var charge = 0;
	var value_arr = value.toArray();

	if (value == '*') {
		label = 'A';
	}
	else if (value.match(/^[*][1-9]?[+-]$/i)) {
		label = 'A';

		if (value.length == 2)
			charge = 1;
		else
			charge = parseInt(value_arr[1]);

		if (value_arr[2] == '-')
			charge *= -1;
	}
	else if (value.match(/^[A-Z]{1,2}$/i)) {
		label = value.capitalize();
	}
	else if (value.match(/^[A-Z]{1,2}[0][+-]?$/i)) {
		if (value.match(/^[A-Z]{2}/i))
			label = value.substr(0, 2).capitalize();
		else
			label = value_arr[0].capitalize();
	}
	else if (value.match(/^[A-Z]{1,2}[1-9]?[+-]$/i)) {
		if (value.match(/^[A-Z]{2}/i))
			label = value.substr(0, 2).capitalize();
		else
			label = value_arr[0].capitalize();

		var match = value.match(/[0-9]/i);

		if (match != null)
			charge = parseInt(match[0]);
		else
			charge = 1;

		if (value_arr[value.length - 1] == '-')
			charge *= -1;
	}
	// Not consistant
	if (label == 'A' || label == 'Q' || label == 'X' || label == 'R' || element.getElementByLabel(label) != null)
		return { label: label, charge: charge };

	return null;
}

module.exports = labelEdit;
