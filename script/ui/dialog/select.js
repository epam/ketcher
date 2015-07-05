/*global module, global*/

var ui = global.ui;

function dialog (name, params) {
	var dlg = ui.showDialog(name);
	var okButton = dlg.select('input[value=OK]')[0];
	var mode = params.mode || 'single';
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
		handlers.forEach(function (h) { h.stop(); });
		ui.hideDialog(name);

		var key = 'on' + button.value.capitalize();

		console.assert(key != 'onOk' || !params.required ||
		               getSelected().length != 0,
		               'No elements selected');
		if (params && key in params) {
			params[key]({
				mode: mode,
				values: getSelected()
			});
		}
	});

	handlers[1] = dlg.on('click', 'button', function (event, button) {
		if (mode === 'single') {
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

	handlers[2] = dlg.on('click', 'input[name=mode]', function (_, radio) {
		if (radio.value != mode) {
			if (radio.value == 'single') {
				setSelected(null);
			}
			mode = radio.value;
		}
	});

	setSelected(params.values);
	dlg.select('input[name=mode]').each(function (radio) {
		if (radio.value == mode) {
			radio.checked = true;
		}
	});
}

module.exports = dialog;
