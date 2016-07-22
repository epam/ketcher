var ui = global.ui;

function dialog (name, params) {
	var dlg = ui.showDialog(name);
	var handlers = [];
	handlers[0] = dlg.on('click', 'input[type=button]', function (_, button) {
		handlers.forEach(function (h) { h.stop(); });
		ui.hideDialog(name);

		var key = 'on' + button.value.capitalize();
		if (params && key in params) {
			var res = {};
			eachNamedInput(dlg, function (field) {
				res[field.name] = field.type == 'checkbox' ?
					field.checked : field.value;
			});
			params[key](res);
		}
	});

	eachNamedInput(dlg, function (field) {
		if (params.hasOwnProperty(field.name))
			field[field.type == 'checkbox' ? 'checked' : 'value'] = params[field.name];
	});
	dlg.select('input, select')[0].activate();
	return dlg;
}

function eachNamedInput(el, func) {
	$(el).descendants().each(function (field) {
		// adapted from zepto/src/form.js
		var type = field.type, name = field.name;
		if (name && field.nodeName.toLowerCase() != 'fieldset' &&
		    !field.disabled && type != 'submit' && type != 'reset' && type != 'button')
			func(field);
	});
}

module.exports = dialog;
