ui.initDialogs = function () {
    // Dialog events
    $$('.dialogWindow').each(function (el)
    {
        el.observe('keypress', ui.onKeyPress_Dialog);
        el.observe('keyup', ui.onKeyPress_Dialog);
    });
    // Atom properties dialog events
    $('atom_label').observe('change', ui.onChange_AtomLabel);
    $('atom_charge').observe('change', ui.onChange_AtomCharge);
    $('atom_isotope').observe('change', ui.onChange_AtomIsotope);
    $('atom_valence').observe('change', ui.onChange_AtomValence);
    $('atom_prop_cancel').observe('click', function ()
    {
        ui.hideDialog('atom_properties');
    });
    $('atom_prop_ok').observe('click', function ()
    {
        ui.applyAtomProperties();
    });
    $('bond_prop_cancel').observe('click', function ()
    {
        ui.hideDialog('bond_properties');
    });
    $('bond_prop_ok').observe('click', function ()
    {
        ui.applyBondProperties();
    });

    // S-group properties dialog events
    $('sgroup_type').observe('change', ui.onChange_SGroupType);
    $('sgroup_label').observe('change', ui.onChange_SGroupLabel);

    // Label input events
    $('input_label').observe('blur', function ()
    {
        this.hide();
    });
    $('input_label').observe('keypress', ui.onKeyPress_InputLabel);
    $('input_label').observe('keyup', ui.onKeyUp_InputLabel);

    // Load dialog events
    $('radio_open_from_input').observe('click', ui.onSelect_OpenFromInput);
    $('radio_open_from_file').observe('click', ui.onSelect_OpenFromFile);
    $('input_mol').observe('keyup', ui.onChange_Input);
    $('input_mol').observe('click', ui.onChange_Input);
    $('read_cancel').observe('click', function ()
    {
        ui.hideDialog('open_file');
    });
    $('read_ok').observe('click', function ()
    {
        ui.loadMoleculeFromInput();
    });
    $('upload_mol').observe('submit', function ()
    {
        ui.hideDialog('open_file');
    });
    $('upload_cancel').observe('click', function ()
    {
        ui.hideDialog('open_file');
    });

    // Save dialog events
    $('file_format').observe('change', ui.onChange_FileFormat);
    $('save_ok').observe('click', function ()
    {
        ui.hideDialog('save_file');
    });

    if (!ui.standalone) {
        $('upload_mol').action = ui.api_path + 'open';
        $('download_mol').action = ui.api_path + 'save';
    }
};

//
// Atom attachment points dialog
//
ui.showAtomAttachmentPoints = function(params)
{
    $('atom_ap1').checked = ((params.selection || 0) & 1) > 0;
    $('atom_ap2').checked = ((params.selection || 0) & 2) > 0;
    ui.showDialog('atom_attpoints');
    var _onOk = new Event.Handler('atom_attpoints_ok', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        ui.hideDialog('atom_attpoints');
        if ('onOk' in params) params['onOk'](($('atom_ap1').checked ? 1 : 0) + ($('atom_ap2').checked ? 2 : 0));
    }).start();
    var _onCancel = new Event.Handler('atom_attpoints_cancel', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        ui.hideDialog('atom_attpoints');
        if ('onCancel' in params) params['onCancel']();
    }).start();
    $('atom_attpoints_ok').focus();
};

//
// Atom properties dialog
//
ui.showAtomProperties = function (id)
{
    $('atom_properties').atom_id = id;
    $('atom_label').value = ui.render.atomGetAttr(id, 'label');
    ui.onChange_AtomLabel.call($('atom_label'));
    var value = ui.render.atomGetAttr(id, 'charge') - 0;
    $('atom_charge').value = (value == 0 ? '' : value);
    value = ui.render.atomGetAttr(id, 'isotope') - 0;
    $('atom_isotope').value = (value == 0 ? '' : value);
    value = ui.render.atomGetAttr(id, 'explicitValence') - 0;
    $('atom_valence').value =  value < 0 ? '' : value;
    $('atom_radical').value = ui.render.atomGetAttr(id, 'radical');

    $('atom_inversion').value = ui.render.atomGetAttr(id, 'invRet');
    $('atom_exactchange').value = ui.render.atomGetAttr(id, 'exactChangeFlag') ? 1 : 0;
    $('atom_ringcount').value = ui.render.atomGetAttr(id, 'ringBondCount');
    $('atom_substitution').value = ui.render.atomGetAttr(id, 'substitutionCount');
    $('atom_unsaturation').value = ui.render.atomGetAttr(id, 'unsaturatedAtom');
    $('atom_hcount').value = ui.render.atomGetAttr(id, 'hCount');

    ui.showDialog('atom_properties');
    $('atom_label').activate();
};

ui.applyAtomProperties = function ()
{
    ui.hideDialog('atom_properties');

    var id = $('atom_properties').atom_id;

    ui.addUndoAction(ui.Action.fromAtomsAttrs(id,
    {
        label: $('atom_label').value,
        charge: $('atom_charge').value == '' ? 0 : parseInt($('atom_charge').value),
        isotope: $('atom_isotope').value == '' ? 0 : parseInt($('atom_isotope').value),
        explicitValence: $('atom_valence').value == '' ? -1 : parseInt($('atom_valence').value),
        radical: parseInt($('atom_radical').value),
        // reaction flags
        invRet: parseInt($('atom_inversion').value),
        exactChangeFlag: parseInt($('atom_exactchange').value) ? true : false,
        // query flags
        ringBondCount: parseInt($('atom_ringcount').value),
        substitutionCount: parseInt($('atom_substitution').value),
        unsaturatedAtom: parseInt($('atom_unsaturation').value),
        hCount: parseInt($('atom_hcount').value)
    }), true);

    ui.render.update();
};

ui.onChange_AtomLabel = function ()
{
    this.value = this.value.strip().capitalize();

    var element = chem.Element.getElementByLabel(this.value);

    if (element == null && this.value != 'A' && this.value != '*' && this.value != 'Q' && this.value != 'X' && this.value != 'R') {
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'label');

        if (this.value != 'A' && this.value != '*')
            element = chem.Element.getElementByLabel(this.value);
    }

    if (this.value == 'A' || this.value == '*')
        $('atom_number').value = "any";
    else if (!element)
        $('atom_number').value = "";
    else
        $('atom_number').value = element.toString();
};

ui.onChange_AtomCharge = function ()
{
    if (this.value.strip() == '' || this.value == '0')
        this.value = '';
    else if (this.value.match(/^[1-9][0-9]{0,1}[-+]$/))
        this.value = (this.value.endsWith('-') ? '-' : '') + this.value.substr(0, this.value.length - 1);
    else if (!this.value.match(/^[+-]?[1-9][0-9]{0,1}$/))
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'charge');
};

ui.onChange_AtomIsotope = function ()
{
    if (this.value == util.getElementTextContent($('atom_number')) || this.value.strip() == '' || this.value == '0')
        this.value = '';
    else if (!this.value.match(/^[1-9][0-9]{0,2}$/))
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'isotope');
};

ui.onChange_AtomValence = function ()
{
    /*
    if (this.value.strip() == '')
        this.value = '';
    else if (!this.value.match(/^[0-9]$/))
        this.value = ui.render.atomGetAttr($('atom_properties').atom_id, 'valence');
    */
};

//
// Bond properties dialog
//
ui.showBondProperties = function (id)
{
    $('bond_properties').bond_id = id;

    var type = ui.render.bondGetAttr(id, 'type');
    var stereo = ui.render.bondGetAttr(id, 'stereo');

    for (var bond in ui.bondTypeMap) {
        if (ui.bondTypeMap[bond].type == type && ui.bondTypeMap[bond].stereo == stereo)
            break;
    }

    $('bond_type').value = bond;
    $('bond_topology').value = ui.render.bondGetAttr(id, 'topology') || 0;
    $('bond_center').value = ui.render.bondGetAttr(id, 'reactingCenterStatus') || 0;

    ui.showDialog('bond_properties');
    $('bond_type').activate();
};

ui.applyBondProperties = function ()
{
    ui.hideDialog('bond_properties');

    var id = $('bond_properties').bond_id;
    var bond = Object.clone(ui.bondTypeMap[$('bond_type').value]);

    bond.topology = parseInt($('bond_topology').value);
    bond.reactingCenterStatus = parseInt($('bond_center').value);

    ui.addUndoAction(ui.Action.fromBondAttrs(id, bond), true);

    ui.render.update();
};

//
// S-Group properties
//
ui.showSGroupProperties = function (id, tool, selection, onOk, onCancel)
{
    if (!tool) {
        throw new Error("Tool not specified. Note: this method should only be invoked by rnd.Editor.SGroupTool.SGroupHelper, all other usages are obsolete.");
    }
    if ($('sgroup_properties').visible())
        return;

    var type = (id == null) ? 'GEN' : ui.render.sGroupGetType(id);

    $('sgroup_properties').sgroup_id = id;
    $('sgroup_type').value = type;
    ui.onChange_SGroupType.call($('sgroup_type'));

    switch (type)
    {
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
    };

    $('sgroup_prop_cancel').observe('click', onClickCancel);
    $('sgroup_prop_ok').observe('click', onClickOk);

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
        $$('.generalSGroup').each(function (el) {el.hide()});
        $$('.dataSGroup').each(function (el) {el.show()});

        return;
    }

    $$('.generalSGroup').each(function (el) {el.show()});
    $$('.dataSGroup').each(function (el) {el.hide()});

    $('sgroup_label').disabled = (type != 'SRU') && (type != 'MUL') && (type != 'SUP');
    $('sgroup_connection').disabled = (type != 'SRU');

    if (type == 'MUL' && !$('sgroup_label').value.match(/^[1-9][0-9]{0,2}$/))
        $('sgroup_label').value = '1';
    else if (type == 'SRU')
        $('sgroup_label').value = 'n';
    else if (type == 'GEN' || type == 'SUP')
        $('sgroup_label').value = '';
};

//
// Reaction auto-mapping
//

ui.showAutomapProperties = function(params)
{
    ui.showDialog('automap_properties');

    var _onOk = new Event.Handler('automap_ok', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        if (params && 'onOk' in params) params['onOk']($('automap_mode').value);
        ui.hideDialog('automap_properties');
    }).start();
    var _onCancel = new Event.Handler('automap_cancel', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        ui.hideDialog('automap_properties');
        if (params && 'onCancel' in params) params['onCancel']();
    }).start();

    $('automap_mode').activate();
};

//
// Element table
//

ui.showElemTable = function(params)
{
    if (!$('elem_table').visible()) {
        params = params || {};
        ui.showDialog('elem_table');
        if (typeof(ui.elem_table_obj) == 'undefined') {
            ui.elem_table_obj = new rnd.ElementTable('elem_table_area', {
                'fillColor':'#DADADA',
                'fillColorSelected':'#FFFFFF',
                'frameColor':'#E8E8E8',
                'fontSize':23,
                'buttonHalfSize':18
            }, true);
            ui.elem_table_area = ui.elem_table_obj.renderTable();
            $('elem_table_single').checked = true;
        }
        ui.elem_table_obj.store();
        ui.elem_table_obj.setSelection(params.selection);
        var _onOk = new Event.Handler('elem_table_ok', 'click', undefined, function() {
            if (!params || !('onOk' in params) || params['onOk'](ui.elem_table_obj.getAtomProps())) {
                _onOk.stop(); _onCancel.stop();
                ui.hideDialog('elem_table');
            }
        }).start();
        var _onCancel = new Event.Handler('elem_table_cancel', 'click', undefined, function() {
            _onOk.stop(); _onCancel.stop();
            ui.hideDialog('elem_table');
            if (params && 'onCancel' in params) params['onCancel']();
        }).start();
        $('elem_table_ok').focus();
    }
};


ui.showRGroupTable = function(params)
{
    if (!$('rgroup_table').visible()) {
        params = params || {};
        ui.showDialog('rgroup_table');
        if (typeof(ui.rgroup_table_obj) == 'undefined') {
            ui.rgroup_table_obj = new rnd.RGroupTable('rgroup_table_area', {
                'fillColor':'#DADADA',
                'fillColorSelected':'#FFFFFF',
                'frameColor':'#E8E8E8',
                'fontSize':18,
                'buttonHalfSize':18
            }, true);
        }
        ui.rgroup_table_obj.setMode(params.mode || 'multiple');
        ui.rgroup_table_obj.setSelection(params.selection || 0);
        var _onOk = new Event.Handler('rgroup_table_ok', 'click', undefined, function() {
            _onOk.stop();
            _onCancel.stop();
            ui.hideDialog('rgroup_table');
            if ('onOk' in params) params['onOk'](ui.rgroup_table_obj.selection);
        }).start();
        var _onCancel = new Event.Handler('rgroup_table_cancel', 'click', undefined, function() {
            _onOk.stop();
            _onCancel.stop();
            ui.hideDialog('rgroup_table');
            if ('onCancel' in params) params['onCancel']();
        }).start();
        $('rgroup_table_ok').focus();
    }
};

ui.showRLogicTable = function(params)
{
    params = params || {};
    params.rlogic = params.rlogic || {};
    $('rlogic_occurrence').value = params.rlogic.occurrence || '>0';
    $('rlogic_resth').value = params.rlogic.resth ? '1' : '0';
    var ifOptHtml = '<option value="0">Always</option>';
    for (var r = 1; r <= 32; r++) if (r != params.rgid && 0 != (params.rgmask & (1 << (r - 1)))) {
        ifOptHtml += '<option value="' + r + '">IF R' + params.rgid + ' THEN R' + r + '</option>';
    }
    $('rlogic_if').outerHTML = '<select id="rlogic_if">' + ifOptHtml + '</select>'; // [RB] thats tricky because IE8 fails to set innerHTML
    $('rlogic_if').value = params.rlogic.ifthen;
    ui.showDialog('rlogic_table');

    var _onOk = new Event.Handler('rlogic_ok', 'click', undefined, function() {
        var result = {
            'occurrence' : $('rlogic_occurrence').value
                .replace(/\s*/g, '').replace(/,+/g, ',').replace(/^,/, '').replace(/,$/, ''),
            'resth' : $('rlogic_resth').value == '1',
            'ifthen' : parseInt($('rlogic_if').value)
        };
        if (!params || !('onOk' in params) || params['onOk'](result)) {
            _onOk.stop();
            _onCancel.stop();
            ui.hideDialog('rlogic_table');
        }
    }).start();
    var _onCancel = new Event.Handler('rlogic_cancel', 'click', undefined, function() {
        _onOk.stop();
        _onCancel.stop();
        ui.hideDialog('rlogic_table');
        if (params && 'onCancel' in params) params['onCancel']();
    }).start();

    $('rlogic_occurrence').activate();
};

ui.onSelect_ElemTableNotList = function ()
{
    try {
        ui.elem_table_obj.updateAtomProps();
    } catch(e) {
        if (ui.forwardExceptions)
            throw e;
        ErrorHandler.handleError(e);
    }
};

ui.onKeyPress_Dialog = function (event)
{
    util.stopEventPropagation(event);
    if (event.keyCode === 27) {
        ui.hideDialog(this.id);
        return util.preventDefault(event);
    }
};

ui.onKeyPress_InputLabel = function (event)
{
    util.stopEventPropagation(event);
    if (event.keyCode == 13) {
        this.hide();

        var label = '';
        var charge = 0;
        var value_arr = this.value.toArray();

        if (this.value == '*') {
            label = 'A';
        }
        else if (this.value.match(/^[*][1-9]?[+-]$/i)) {
            label = 'A';

            if (this.value.length == 2)
                charge = 1;
            else
                charge = parseInt(value_arr[1]);

            if (value_arr[2] == '-')
                charge *= -1;
        }
        else if (this.value.match(/^[A-Z]{1,2}$/i)) {
            label = this.value.capitalize();
        }
        else if (this.value.match(/^[A-Z]{1,2}[0][+-]?$/i)) {
            if (this.value.match(/^[A-Z]{2}/i))
                label = this.value.substr(0, 2).capitalize();
            else
                label = value_arr[0].capitalize();
        }
        else if (this.value.match(/^[A-Z]{1,2}[1-9]?[+-]$/i)) {
            if (this.value.match(/^[A-Z]{2}/i))
                label = this.value.substr(0, 2).capitalize();
            else
                label = value_arr[0].capitalize();

            var match = this.value.match(/[0-9]/i);

            if (match != null)
                charge = parseInt(match[0]);
            else
                charge = 1;

            if (value_arr[this.value.length - 1] == '-')
                charge *= -1;
        }

        if (label == 'A' || label == 'Q' || label == 'X' || label == 'R' || chem.Element.getElementByLabel(label) != null) {
            ui.addUndoAction(ui.Action.fromAtomsAttrs(this.atom_id, {label: label, charge: charge}), true);
            ui.render.update();
        }
        return util.preventDefault(event);
    }
    if (event.keyCode == 27) {
        this.hide();
        return util.preventDefault(event);
    }
};

ui.onKeyUp_InputLabel = function (event)
{
    util.stopEventPropagation(event);
    if (event.keyCode == 27) {
        this.hide();
        return util.preventDefault(event);
    }
};

ui.showLabelEditor = function(aid)
{
    // TODO: RB: to be refactored later, need to attach/detach listeners here as anon-functions, not on global scope (ui.onKeyPress_InputLabel, onBlur, etc)
    var input_el = $('input_label');

    var offset = Math.min(6 * ui.zoom, 16);

    input_el.atom_id = aid;
    input_el.value = ui.render.atomGetAttr(aid, 'label');
    input_el.style.fontSize = (offset * 2).toString() + 'px';

    input_el.show();

    var atom_pos = ui.render.obj2view(ui.render.atomGetPos(aid));
    var offset_client = ui.client_area.cumulativeOffset();
    var offset_parent = Element.cumulativeOffset(input_el.offsetParent);
    var d = 0; // TODO: fix/Math.ceil(4 * ui.abl() / 100);
    input_el.style.left = (atom_pos.x + offset_client.left - offset_parent.left - offset - d).toString() + 'px';
    input_el.style.top = (atom_pos.y + offset_client.top - offset_parent.top - offset - d).toString() + 'px';

    input_el.activate();
};

ui.onChange_Input = function ()
{
    var el = this;
    setTimeout(function() {
        if (el.value.strip().startsWith('InChI=') && ui.standalone) {
            alert('InChI are not supported in the standalone mode');
        } else if (el.value.strip().indexOf('\n') != -1) {
            if (el.style.wordWrap != 'normal')
                el.style.wordWrap = 'normal';
        } else {
            if (el.style.wordWrap != 'break-word')
                el.style.wordWrap = 'break-word';
        }
    }, 200);
};

ui.convertMolecule = function (molecule, format) {
	return new Promise(function (resolve, reject) {
		var moldata = new chem.MolfileSaver().saveMolecule(molecule);
		if (format == 'mol') {
			resolve(moldata);
		}
		else if (format == 'smi') {
			resolve(!ui.standalone ? ui.server.smiles({ moldata: moldata }):
			                         new chem.SmilesSaver().saveMolecule(molecule));
		}
		else if (format == 'inchi') {
			if (ui.standalone)
				throw Error('InChI is not supported in the standalone mode');

			if (molecule.rgroups.count() !== 0)
				ui.echo('R-group fragments are not supported and will be discarded');
			molecule = molecule.getScaffold();
			if (molecule.atoms.count() === 0)
				resolve('');
			else {
				molecule = molecule.clone();
				molecule.sgroups.each(function(sgid, sg) {
					if (sg.type !== 'MUL')
						throw Error('InChi data format doesn\'t support s-groups');
				}, this);

				resolve(ui.server.inchi({ moldata: moldata }));
			}
		}
	});
};

ui.onChange_FileFormat = function (event)
{
	var format = $('file_format').value,
	    output = $('output_mol');

	// TODO: disable form controls; spinner?
	ui.convertMolecule(ui.ctab, format).then(function (res) {
		output.value = res;
		output.style.wordWrap = (format == 'mol') ? 'normal' : 'break-word';
		$('mol_data').value = format + '\n' + output.value;
		output.activate();
	}, function (err) {
        output.value = '';		// we really need this?
        ui.hideDialog('save_file');
		ui.echo('ERROR: ' + err.message);
		//if (ui.forwardExceptions)
        //    throw er;
	});
};

ui.onSelect_OpenFromInput = function ()
{
    $('open_from_input').show();
    $('open_from_file').hide();
    ui.onChange_Input.call($('input_mol'));
    $('input_mol').activate();
};

ui.onSelect_OpenFromFile = function ()
{
    $('open_from_file').show();
    $('open_from_input').hide();
    $('molfile_path').focus();
};

ui.getFile = function ()
{
    var frame_body;

    if ('contentDocument' in $('buffer_frame'))
        frame_body = $('buffer_frame').contentDocument.body;
    else // IE7
        frame_body = document.frames['buffer_frame'].document.body;

    return Base64.decode(frame_body.title);
};

// TODO: refactor me
ui.loadMolecule = function (mol_string, force_layout, check_empty_line, paste, discardRxnArrow, selective_layout)
{
    var updateFunc = function(struct) {
        if (discardRxnArrow)
            struct.rxnArrows.clear();
        if (paste) {
            (function(struct) {
                struct.rescale();
                if (!ui.copy(struct)) {
                    alert("Not a valid structure to paste");
                    return;
                }
                ui.editor.deselectAll();
                ui.selectAction('paste');
            }).call(this, struct);
        } else {
            ui.updateMolecule.call(this, struct);
        }
    }

	var smiles = mol_string.strip();
    if (smiles.indexOf('\n') == -1) {
        if (ui.standalone) {
            if (smiles != '') {
                ui.echo('SMILES is not supported in a standalone mode.');
            }
            return;
        }
	    var request = ui.server.layout_smiles(null, {smiles: smiles});
	    request.then(function (res) {
		    updateFunc.call(ui, ui.parseCTFile(res));
	    });
    } else if (!ui.standalone && force_layout) {
	    var req = ui.server.layout({moldata: mol_string},
	                               selective_layout ? {'selective': 1} : null);
	    req.then(function (res) {
		    updateFunc.call(ui, ui.parseCTFile(res));
	    });
    } else {
        updateFunc.call(ui, ui.parseCTFile(mol_string, check_empty_line));
    }
};

// Called from iframe's 'onload'
ui.loadMoleculeFromFile = function ()
{
    var file = ui.getFile();
    if (file.startsWith('Ok.'))
        ui.loadMolecule(file.substr(file.indexOf('\n') + 1), false, false, $('checkbox_open_copy').checked);
};

ui.loadMoleculeFromInput = function ()
{
    if (!util.strip($('input_mol').value)) {
        alert("The inpus field is empty. Please enter a structure in SMILES or MOLFile/RXNFile format.");
        return;
    }
    ui.hideDialog('open_file');
    ui.loadMolecule($('input_mol').value, false, true, $('checkbox_open_copy').checked);
};

/////////////////////

ui.parseTemplateCustom = function (sdf) {
	var items = sdf.split(/^[$][$][$][$]$/m);
	var parsed = [];

	items.each(function (item) {
		item = item.replace(/\r/g, '');
		item = item.strip();
		var end_idx = item.indexOf('M  END');

		if (end_idx == -1) {
			return;
		}

		var iparsed = {};

		iparsed.molfile = item.substring(0, end_idx + 6);
		iparsed.name = item.substring(0, item.indexOf('\n')).strip();
		item = item.substr(end_idx + 7).strip();

		var entries = item.split(/^$/m);

		entries.each(function (entry) {
			entry = entry.strip();
			if (!entry.startsWith('> <')) {
				return;
			}
			var lines = entry.split('\n');
			var field = lines[0].strip().substring(3, lines[0].lastIndexOf('>')).strip();

			iparsed[field] = parseInt(lines[1].strip()) || lines[1].strip();
		});
		parsed.push(iparsed);
	});

	return parsed;
};

ui.fetchTemplateCustom = function(base_url) {
	return util.ajax(base_url + 'templates.sdf').then(function (xhr) {
		//headers: {Accept: 'application/octet-stream'}
		var items = ui.parseTemplateCustom(xhr.responseText);

		rnd.customtemplates = [];
		var i = 0;
		items.each(function (item) {
			rnd.customtemplates.push({
				name: (item.name || ('customtemplate ' + (++i))).capitalize(),
				molfile: item.molfile,
				aid: (item.atomid || 1) - 1,
				bid: (item.bondid || 1) - 1
			});
		});

		return rnd.customtemplates;
	});
};

ui.initTemplateCustom = function(el, base_url) {
		return ui.fetchTemplateCustom(base_url).then(function (templates) {
			return util.eachAsync(templates, function(tmpl, _) {
				var li =  new Element('li');
				li.title = tmpl.name;
				el.insert({ bottom: li });
				var mol = chem.Molfile.parseCTFile(tmpl.molfile.split('\n')),
				    render = new rnd.Render(li, 0, {
					    'autoScale': true,
					    'autoScaleMargin': 0,
					    //'debug': true,
					    'ignoreMouseEvents': true,
					    'hideChiralFlag': true,
					    'maxBondLength': 30
				    });
				render.setMolecule(mol);
				render.update();
			}, 50);
		});
};

ui.showTemplateCustom = function(base_url, params) {
	var dialog = ui.showDialog('custom_templates'),
	    selectedLi = dialog.select('.selected')[0],
	    okButton = dialog.select('[value=OK]')[0],
	    ul = dialog.select('ul')[0];

	if (ul.children.length === 0) { // first time
		ui.showDialog('loading');
		dialog.addClassName('loading');
		var loading = ui.initTemplateCustom(ul, base_url).then(function () {
			$('loading').hide();
			dialog.removeClassName('loading');
		});

		loading.then(function () {
			okButton.disabled = true;
			dialog.on('click', 'li', function (_, li) {
				if (selectedLi == li)
					okButton.click();
				else {
					if (selectedLi)
						selectedLi.removeClassName('selected');
					else
						okButton.disabled = false;
					li.addClassName('selected');
					selectedLi = li;
				}
			});
			dialog.on('click', 'input', function(_, input) {
				console.assert(selectedLi, 'No element selected');
				var mode = input.value,
				    key = 'on' + (mode.capitalize() || 'Cancel'),
				    index = selectedLi.previousSiblings().size();

				if (params && key in params)
					params[key](rnd.customtemplates[index]);
				ui.hideDialog('custom_templates');
			});
		});
	}
};
