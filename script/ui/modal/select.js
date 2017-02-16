var keyName = require('w3c-keyname');

var ui = global.ui;

function dialog (name, params) {
	var dlg = ui.showDialog(name);
	var okButton = dlg.select('input[value=OK]')[0];
	var type = params.type || 'single';
	var handlers = [];

	function setSelected(values) {
		dlg.select('.selected').each(function (button) {
			button.removeClassName('selected');
		});
		if (values) {
			dlg.select('button').each(function (button) {
				var value = button.value || button.textContent || button.innerText;
				if (values.indexOf(value) >= 0) {
					button.addClassName('selected');
				}
			});
		} else if (params.required) {
			okButton.disabled = true;
		}
	}

	function getSelected() {
		var values = [];
		dlg.select('.selected').each(function (button) {
			var value = button.value || button.textContent || button.innerText;
			values.push(value);
		});
		return values;
	}

	handlers[0] = dlg.on('click', 'input[type=button]', function (_, button) {
		exit(button.value);
	});

	handlers[1] = dlg.on('click', 'button', function (event, button) {
		if (type === 'single') {
			if (!button.hasClassName('selected')) {
				setSelected(null);
			} else if (params.required) {
				okButton.click();
			}
		}

		button.toggleClassName('selected');
		if (params.required) {
			okButton.disabled = dlg.select('.selected').length === 0;
		}
		event.stop();
	});

	handlers[2] = dlg.on('click', 'input[name=type]', function (_, radio) {
		if (radio.value != type) {
			if (radio.value == 'single') {
				setSelected(null);
			}
			type = radio.value;
		}
	});
	handlers[3] = dlg.on('keydown', function (ev) {
		var key = keyName(ev);
		if (key.startsWith('Esc') || key == 'Enter' && !okButton.disabled) {
			exit(key == 'Enter' ? 'OK': 'Cancel');
			ev.preventDefault();
		}
		ev.stopPropagation();
	});

	function exit(mod) {
		var key = mod == 'OK' ? 'onOk' : 'onCancel';
		handlers.forEach(function (h) { h.stop(); });
		ui.hideDialog(name);

		console.assert(key != 'onOk' || !params.required ||
					   getSelected().length != 0,
					   'No elements selected');
		if (params && key in params) {
			params[key]({
				type: type,
				values: getSelected()
			});
		}
	}

	setSelected(params.values);
	dlg.select('input[name=type]').each(function (radio) {
		if (radio.value == type) {
			radio.checked = true;
		}
	});
	dlg.select('button, input')[0].activate();
}

module.exports = dialog;
