ui.showElemTable = function(params) {
	params.required = true;
	ui.selectDialog('elem-table', params);
};

ui.showRGroupTable = function(params) {
	ui.selectDialog('rgroup-table', params);
};

ui.selectDialog = function(name, params) {
	var dialog = ui.showDialog(name),
	    okButton = dialog.select('input[value=OK]')[0],
	    mode = params.mode || 'single',
	    handlers = [];

	function setSelected(values) {
		dialog.select('.selected').each(function (button) {
			button.removeClassName('selected');
		});
		if (values)
			dialog.select('button').each(function (button) {
				if (values.indexOf(button.value) >= 0)
					button.addClassName('selected');
			});
		else if (params.required)
			okButton.disabled = true;
	}

	function getSelected() {
		var values = [];
		dialog.select('.selected').each(function (el) {
			values.push(el.getAttribute('value'));
		});
		return values;
	}

	handlers[0] = dialog.on('click', 'input[type=button]', function(_, button) {
		handlers.forEach(function (h) { h.stop(); });
		ui.hideDialog(name);

		var key = 'on' + button.value.capitalize();
		console.assert(key != 'onOk' || !params.required ||
		               getSelected().length != 0,
		               'No elements selected');
		if (params && key in params)
			params[key]({
				mode: mode,
				values: getSelected()
			});
	});

	handlers[1] = dialog.on('click', 'button', function(event, button) {
		if (mode == 'single') {
			if (!button.hasClassName('selected'))
				setSelected(null);
			else if (params.required)
				okButton.click();

		}
		button.toggleClassName('selected');
		if (params.required)
			okButton.disabled = dialog.select('.selected').length == 0;
		event.stop();
	});

	handlers[2] = dialog.on('click', 'input[name=mode]', function(_, radio) {
		if (radio.value != mode) {
			if (radio.value == 'single') {
				setSelected(null);
			}
			mode = radio.value;
		}
	});

	setSelected(params.values);
	dialog.select('input[name=mode]').each(function (radio) {
		if (radio.value == mode)
			radio.checked = true;
	});
};
