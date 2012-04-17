if (!window.Prototype)
	throw new Error("Prototype.js should be loaded first");
if (!window.rnd)
	throw new Error("rnd should be defined prior to loading this file");
if (!window.ui)
	throw new Error("ui should be defined prior to loading this file");

rnd.ReaGenericsTable = function (clientArea, opts) {
	opts = opts || {};
	clientArea = $(clientArea);
    clientArea.style.width = '610px';
    clientArea.style.height = '390px';
	clientArea.innerHTML = "";

	this.onClick = function(text) {
        this.setSelection(text);
	};

    this.elemHalfSz = new util.Vec2(22, 14);
    this.elemSz = this.elemHalfSz.scaled(2);

	this.spacing = new util.Vec2(3, 3);
	this.cornerRadius = 2;
	this.orig = this.elemSz.scaled(0);

	this.viewSz = new util.Vec2(clientArea['clientWidth'] || 100, clientArea['clientHeight'] || 100);

	this.paper = new Raphael(clientArea, this.viewSz.x, this.viewSz.y);
	this.bb = new util.Box2Abs(new util.Vec2(), this.viewSz);

    this.bgColor = clientArea.getStyle('background-color');
	this.fillColor = opts.fillColor || '#def';
	this.fillColorSelected = opts.fillColorSelected || '#fcb';
	this.frameColor = opts.frameColor || '#9ad';
	this.frameThickness = opts.frameThickness || '1pt';
	this.fontSize = opts.fontSize || 18;
	this.fontType = opts.fontType || "Arial";
	this.atomProps = null;

	this.frameAttrs = {
        'fill':this.fillColor,
        'stroke':this.frameColor,
        'stroke-width':this.frameThickness
    };
	this.fontAttrs = {
        'font-family': this.fontType,
        'font-size': this.fontSize
    };
    this.groupRectAttrs = {
        'stroke' : 'lightgray',
        'stroke-width' : '1px'
    };
    this.labelTextAttrs = {
        'font-family': "Arial",
        'font-size': 13,
        'fill' : 'gray'
    };
    this.labelRectAttrs = {
        fill : this.bgColor,
        stroke : this.bgColor
    };
    this.items = [];

    var drawGroup = function(x, y, w, h, text, align) {
        align = align || 'start';
        this.paper.rect(x, y, w, h, this.cornerRadius).attr(this.groupRectAttrs);
        var t = this.paper.text(
            align == 'left' ? x + 10 : align == 'right' ? x + w - 10 : x + w / 2,
            y,
            text
        ).attr(
            this.labelTextAttrs
        ).attr(
            'text-anchor',
            align == 'left' ? 'start' : align == 'right' ? 'end' : 'middle'
        );
        this.paper.rect().attr(t.getBBox()).attr(this.labelRectAttrs);
        t.toFront();
    };
    var drawLabel = function(x, y, text, align) {
        this.paper.text(x, y, text).attr(this.labelTextAttrs).attr(
            'text-anchor',
            align == 'left' ? 'start' : align == 'right' ? 'end' : 'middle'
        );
    };
    var drawButton = function(center, text) {
        var box = this.paper.rect(
            center.x - this.elemHalfSz.x, center.y - this.elemHalfSz.y, this.elemSz.x, this.elemSz.y, this.cornerRadius
        ).attr(this.frameAttrs);
        var label = this.paper.text(center.x, center.y, text).attr(this.fontAttrs);
        var self = this;
        box.node.onclick = function() {
            self.onClick(text);
        };
        label.node.onclick = function() {
            self.onClick(text);
        };
        this.items.push({ text : text, box : box, label : label });
    };

    var zx = (this.spacing.x + this.elemSz.x);

    drawGroup.apply(this, [5, 5, 600, 75, 'Atom Generics', 'left']);
    drawButton.apply(this, [new util.Vec2(57, 30), 'A']);
    drawButton.apply(this, [new util.Vec2(57 + zx, 30), 'AH']);
    drawLabel.apply(this, [81, 60, 'any atom\n\t']);
    drawButton.apply(this, [new util.Vec2(207, 30), 'Q']);
    drawButton.apply(this, [new util.Vec2(207 + zx, 30), 'QH']);
    drawLabel.apply(this, [231, 60, 'any atom except\ncarbon or hydrogen']);
    drawButton.apply(this, [new util.Vec2(357, 30), 'M']);
    drawButton.apply(this, [new util.Vec2(357 + zx, 30), 'MH']);
    drawLabel.apply(this, [381, 60, 'any metal\n\t']);
    drawButton.apply(this, [new util.Vec2(507, 30), 'X']);
    drawButton.apply(this, [new util.Vec2(507 + zx, 30), 'XH']);
    drawLabel.apply(this, [531, 60, 'any halogen\n\t']);

    drawGroup.apply(this, [5, 90, 600, 300, 'Group Generics', 'left']);
    drawLabel.apply(this, [210, 115, 'any', 'right']);
    drawButton.apply(this, [new util.Vec2(286 - zx, 115), 'G']);
    drawButton.apply(this, [new util.Vec2(286, 115), 'GH']);
    drawButton.apply(this, [new util.Vec2(286 + zx, 115), 'G*']);
    drawButton.apply(this, [new util.Vec2(286 + 2 * zx, 115), 'GH*']);

    drawGroup.apply(this, [10, 140, 235, 245, 'ACYCLIC']);
    drawLabel.apply(this, [74, 165, 'acyclic', 'right']);
    drawButton.apply(this, [new util.Vec2(104, 165), 'ACY']);
    drawButton.apply(this, [new util.Vec2(104 + zx, 165), 'ACH']);

    drawGroup.apply(this, [15, 190, 110, 190, 'CARB']);
    drawButton.apply(this, [new util.Vec2(46, 215), 'ABC']);
    drawButton.apply(this, [new util.Vec2(46 + zx, 215), 'ABH']);
    drawLabel.apply(this, [68, 235, 'carb']);
    drawButton.apply(this, [new util.Vec2(46, 260), 'AYL']);
    drawButton.apply(this, [new util.Vec2(46 + zx, 260), 'AYH']);
    drawLabel.apply(this, [68, 280, 'alkynyl']);
    drawButton.apply(this, [new util.Vec2(46, 305), 'ALK']);
    drawButton.apply(this, [new util.Vec2(46 + zx, 305), 'ALH']);
    drawLabel.apply(this, [68, 325, 'alkyl']);
    drawButton.apply(this, [new util.Vec2(46, 350), 'AEL']);
    drawButton.apply(this, [new util.Vec2(46 + zx, 350), 'AEH']);
    drawLabel.apply(this, [68, 370, 'alkenyl']);

    drawGroup.apply(this, [130, 190, 110, 190, 'HETERO']);
    drawButton.apply(this, [new util.Vec2(161, 215), 'AHC']);
    drawButton.apply(this, [new util.Vec2(161 + zx, 215), 'AHH']);
    drawLabel.apply(this, [183, 235, 'hetero']);
    drawButton.apply(this, [new util.Vec2(161, 260), 'AOX']);
    drawButton.apply(this, [new util.Vec2(161 + zx, 260), 'AOH']);
    drawLabel.apply(this, [183, 280, 'alkoxy']);

    drawGroup.apply(this, [250, 140, 350, 245, 'CYCLIC']);
    drawLabel.apply(this, [371, 165, 'cyclic', 'right']);
    drawButton.apply(this, [new util.Vec2(401, 165), 'CYC']);
    drawButton.apply(this, [new util.Vec2(401 + zx, 165), 'CYH']);

    drawGroup.apply(this, [255, 190, 110, 190, 'CARBO']);
    drawButton.apply(this, [new util.Vec2(286, 215), 'CBC']);
    drawButton.apply(this, [new util.Vec2(286 + zx, 215), 'CBH']);
    drawLabel.apply(this, [308, 235, 'carbo']);
    drawButton.apply(this, [new util.Vec2(286, 260), 'ARY']);
    drawButton.apply(this, [new util.Vec2(286 + zx, 260), 'ARH']);
    drawLabel.apply(this, [308, 280, 'aryl']);
    drawButton.apply(this, [new util.Vec2(286, 305), 'CAL']);
    drawButton.apply(this, [new util.Vec2(286 + zx, 305), 'CAH']);
    drawLabel.apply(this, [308, 325, 'cycloalkyl']);
    drawButton.apply(this, [new util.Vec2(286, 350), 'CEL']);
    drawButton.apply(this, [new util.Vec2(286 + zx, 350), 'CEH']);
    drawLabel.apply(this, [308, 370, 'cycloalkenyl']);

    drawGroup.apply(this, [370, 190, 110, 190, 'HETERO']);
    drawButton.apply(this, [new util.Vec2(401, 215), 'CHC']);
    drawButton.apply(this, [new util.Vec2(401 + zx, 215), 'CHH']);
    drawLabel.apply(this, [423, 235, 'hetero']);
    drawButton.apply(this, [new util.Vec2(401, 260), 'HAR']);
    drawButton.apply(this, [new util.Vec2(401 + zx, 260), 'HAH']);
    drawLabel.apply(this, [423, 280, 'hetero aryl']);

    drawGroup.apply(this, [485, 190, 110, 190, 'CYCLIC']);
    drawButton.apply(this, [new util.Vec2(516, 215), 'CXX']);
    drawButton.apply(this, [new util.Vec2(516 + zx, 215), 'CXH']);
    drawLabel.apply(this, [538, 235, 'no carbon']);
};

rnd.ReaGenericsTable.prototype.getAtomProps = function () {
	return this.atomProps;
};

rnd.ReaGenericsTable.prototype.setSelection = function(selection) {
    this.atomProps = { label : selection };
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].box.attr('fill', this.items[i].text == selection ? this.fillColorSelected : this.fillColor);
    }
    $('reagenerics_table_ok').disabled = (!selection || selection == '');
};


ui.showReaGenericsTable = function(params) {
    if (!$('reagenerics_table').visible()) {
        params = params || {};
        ui.showDialog('reagenerics_table');
        if (typeof(ui.reagenerics_table_obj) == 'undefined') {
            ui.reagenerics_table_obj = new rnd.ReaGenericsTable('reagenerics_table_area', {
                'fillColor':'#DADADA',
                'fillColorSelected':'#FFFFFF',
                'frameColor':'#E8E8E8',
                'fontSize':18,
                'buttonHalfSize':18
            }, true);
        }
        if (params.selection)
            ui.reagenerics_table_obj.setSelection(params.selection);
        var _onOk = new Event.Handler('reagenerics_table_ok', 'click', undefined, function() {
            if (ui.reagenerics_table_obj.atomProps == null)
                return;
            ui.hideDialog('reagenerics_table');
            if ('onOk' in params) params['onOk'](ui.reagenerics_table_obj.selection);
            _onOk.stop();
        }).start();
        var _onCancel = new Event.Handler('reagenerics_table_cancel', 'click', undefined, function() {
            ui.hideDialog('reagenerics_table');
            if ('onCancel' in params) params['onCancel']();
            _onCancel.stop();
        }).start();
        $($('reagenerics_table_ok').disabled ? 'reagenerics_table_cancel' : 'reagenerics_table_ok').focus();
    }
};


ui.onClick_ReaGenericsTableButton = function ()
{
    if (this.hasClassName('buttonDisabled'))
        return;
    ui.showReaGenericsTable({
        onOk : function() {
            ui.selectMode('atom_reagenerics');
        }
    });
};

