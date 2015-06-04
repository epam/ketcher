// TODO: exclude from no-groups build
/*global require, global*/

/* eslint-disable */

require('../ui');

var ui = global.ui = global.ui || function () {};

ui.showSGroupProperties = function (id, tool, selection, onOk, onCancel) {
    if (!tool) {
        throw new Error('Tool not specified. Note: this method should only be invoked by rnd.Editor.SGroupTool.SGroupHelper, all other usages are obsolete.');
    }
    if ($('sgroup_properties').visible()) {
        return;
    }

    var type = (id == null) ? 'GEN' : ui.render.sGroupGetType(id);

    $('sgroup_properties').sgroup_id = id;
    $('sgroup_type').value = type;
    ui.onChange_SGroupType.call($('sgroup_type'));

    switch (type) {
        case 'SRU':
            $('sgroup_connection').value = ui.render.sGroupGetAttr(id, 'connectivity');
            $('sgroup_label').value = ui.render.sGroupGetAttr(id, 'subscript');
            break;
        case 'MUL':
            $('sgroup_label').value = ui.render.sGroupGetAttr(id, 'mul');
            break;
        case 'SUP':
            $('sgroup_label').value = ui.render.sGroupGetAttr(id, 'name');
            break;
        case 'DAT':
            $('sgroup_field_name').value = ui.render.sGroupGetAttr(id, 'fieldName');
            $('sgroup_field_value').value = ui.render.sGroupGetAttr(id, 'fieldValue');
            var isAttached = ui.render.sGroupGetAttr(id, 'attached');
            var isAbsolute = ui.render.sGroupGetAttr(id, 'absolute');
            (isAttached ? $('sgroup_pos_attached') : (isAbsolute ? $('sgroup_pos_absolute') : $('sgroup_pos_relative'))).checked = true;
            break;
        default:
            break;
    }

    if (type != 'DAT')
    {
        $('sgroup_field_name').value = '';
        $('sgroup_field_value').value = '';
    }

    var onClickCancel = function ()
    {
        ui.hideDialog('sgroup_properties');
        resetListeners();
        onCancel.call(tool);
    };

    var onClickOk = function ()
    {
        ui.hideDialog('sgroup_properties');
        var id = $('sgroup_properties').sgroup_id;

        var type = $('sgroup_type').value;
        var attrs =
        {
            mul: null,
            connectivity: '',
            name: '',
            subscript: '',
            fieldName: '',
            fieldValue: ''
        };

        switch (type)
        {
        case 'SRU':
            attrs.connectivity = $('sgroup_connection').value.strip();
            attrs.subscript = $('sgroup_label').value.strip();
            if (attrs.subscript.length != 1 || !attrs.subscript.match(/^[a-zA-Z]$/)) {
                alert(attrs.subscript.length ? "SRU subscript should consist of a single letter." : "Please provide an SRU subscript.");
                ui.showDialog('sgroup_properties');
                return;
            }
            break;
        case 'MUL':
            attrs.mul = parseInt($('sgroup_label').value);
            break;
        case 'SUP':
            attrs.name = $('sgroup_label').value.strip();
            if (!attrs.name) {
                alert("Please provide a name for the superatom.");
                ui.showDialog('sgroup_properties');
                return;
            }
            break;
        case 'DAT':
            attrs.fieldName = $('sgroup_field_name').value.strip();
            attrs.fieldValue = $('sgroup_field_value').value.strip();
            attrs.absolute = $('sgroup_pos_absolute').checked;
            attrs.attached = $('sgroup_pos_attached').checked;

            if (attrs.fieldName == '' || attrs.fieldValue == '') {
                alert("Please, specify data field name and value.");
                ui.showDialog('sgroup_properties');
                return;
            }
            break;
        }

        resetListeners();
        onOk.call(tool, id, type, attrs);
    };

    var resetListeners = function () {
        $('sgroup_prop_cancel').stopObserving('click', onClickCancel);
	    $('sgroup_prop_ok').stopObserving('click', onClickOk);
	    $('sgroup_type').observe('change');
	    $('sgroup_label').observe('change');
    };

    $('sgroup_prop_cancel').observe('click', onClickCancel);
    $('sgroup_prop_ok').observe('click', onClickOk);
    $('sgroup_type').observe('change', ui.onChange_SGroupType);
    $('sgroup_label').observe('change', ui.onChange_SGroupLabel);

    ui.showDialog('sgroup_properties');
    ui.sGroupDlgSelection = selection;
    $('sgroup_type').activate();
};

ui.onChange_SGroupLabel = function ()
{
    if ($('sgroup_type').value == 'MUL' && !this.value.match(/^[1-9][0-9]{0,2}$/))
        this.value = '1';
};

ui.onChange_SGroupType = function ()
{
    var type = $('sgroup_type').value;

	if (type == 'DAT') {
		$$('#sgroup_properties .base')[0].hide();
		$$('#sgroup_properties .data')[0].show();
        return;
    }

	$$('#sgroup_properties .base')[0].show();
	$$('#sgroup_properties .data')[0].hide();

    $('sgroup_label').disabled = (type != 'SRU') && (type != 'MUL') && (type != 'SUP');
    $('sgroup_connection').disabled = (type != 'SRU');

    if (type == 'MUL' && !$('sgroup_label').value.match(/^[1-9][0-9]{0,2}$/))
        $('sgroup_label').value = '1';
    else if (type == 'SRU')
        $('sgroup_label').value = 'n';
    else if (type == 'GEN' || type == 'SUP')
        $('sgroup_label').value = '';
};
