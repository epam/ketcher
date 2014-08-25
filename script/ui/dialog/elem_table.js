//
// Element table
//

// th.ref ~ td { margin: ** }

ui.showElemTable = function(params) {
	var dialog = ui.showDialog('elem-table'),
	    singleRadio = dialog.select('input[value=single]')[0],
	    okButton = dialog.select('input[value=OK]')[0],
	    mode = 'single',
	    handlers = [];

	function removeSelected() {
		dialog.select('.selected').each(function (el) {
			el.removeClassName('selected');
		});
	}

	function getSelected() {
		var nums = [];
		dialog.select('.selected').each(function (el) {
			nums.push(el.getAttribute('data-number'));
		});
		return nums;
	}

	handlers[0] = dialog.on('click', 'input[type=button]', function(_, button) {
		handlers.forEach(function (h) { h.stop(); });
		ui.hideDialog('elem-table');

		var key = 'on' + button.value.capitalize();
		console.assert(key != 'onOk' || getSelected().length != 0, 'No elements selected');
		if (params && key in params)
			params[key]({
				mode: mode,
				ids: getSelected()
			});
	});

	handlers[1] = dialog.on('click', 'input[type=radio]', function(_, radio) {
		if (radio.value != mode) {
			if (radio.value == 'single') {
				removeSelected();
				okButton.disabled = true;
			}
			mode = radio.value;
		}
	});
	handlers[2] = dialog.on('click', 'div', function(event, button) {
		if (mode == 'single')
			removeSelected();
		button.toggleClassName('selected');
		okButton.disabled = dialog.select('.selected').length == 0;
		event.stop();
	});

	removeSelected();
	okButton.disabled = true;
	singleRadio.checked = true;
};
