/****************************************************************************
 * Copyright (C) 2009-2010 GGA Software Services LLC
 *
 * This file may be distributed and/or modified under the terms of the
 * GNU Affero General Public License version 3 as published by the Free
 * Software Foundation and appearing in the file LICENSE.GPL included in
 * the packaging of this file.
 *
 * This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 * WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 ***************************************************************************/

if (!window.Prototype)
	throw new Error("Prototype.js should be loaded first");
if (!window.rnd)
	throw new Error("rnd should be defined prior to loading this file");

rnd.RGroupTable = function (clientArea, opts, isTable)
{
	opts = opts || {};
	clientArea = $(clientArea);
	clientArea.innerHTML = "";
	this.onClick = opts.onClick || function(rgi){
        this.setSelection(this.mode == 'single'
            ? this.selection == (1 << rgi) ? 0 : (1 << rgi)
            : (this.selection ^ (1 << rgi)) & 0xFFFFFFFF
        );
	};

	var hsz = opts.buttonHalfSize || 16;
	this.elemHalfSz = new util.Vec2(hsz, hsz);
	this.elemSz = this.elemHalfSz.scaled(2);
	this.spacing = new util.Vec2(3, 3);
	this.cornerRadius = 0;
	this.orig = this.elemSz.scaled(0);
	this.mode = opts.mode || 'multiple';
    this.selection = 0;

	if (isTable) {
		this.size = new util.Vec2(
            (this.elemSz.x + this.spacing.x) * 8 + this.spacing.x,
            (this.elemSz.y + this.spacing.y) * 4 + this.spacing.y
        );
		clientArea.style.width = (this.size.x).toString() + 'px';
		clientArea.style.height = (this.size.y).toString() + 'px';
	}
	this.viewSz = new util.Vec2(clientArea['clientWidth'] || 100, clientArea['clientHeight'] || 100);

	this.paper = new Raphael(clientArea, this.viewSz.x, this.viewSz.y);
	this.bb = new util.Box2Abs(new util.Vec2(), this.viewSz);

	this.fillColor = opts.fillColor || '#def';
	this.fillColorSelected = opts.fillColorSelected || '#fcb';
	this.frameColor = opts.frameColor || '#9ad';
	this.frameThickness = opts.frameThickness || '1pt';
	this.fontSize = opts.fontSize || 18;
	this.fontType = opts.fontType || "Arial";

	this.frameAttrs = {
        'fill':this.fillColor,
        'stroke':this.frameColor,
        'stroke-width':this.frameThickness
    };
	this.fontAttrs = {
        'font-family': this.fontType,
        'font-size': this.fontSize
    };
    this.items = [];

    for (var rgi = 0; rgi < 32; rgi++) {
        (function(rgi) {
            var center = new util.Vec2(
                this.orig.x + (rgi % 8) * (this.spacing.x + this.elemSz.x) + this.elemHalfSz.x + this.spacing.x,
                this.orig.y + parseInt(rgi / 8) * (this.spacing.y + this.elemSz.y) + this.elemHalfSz.y + this.spacing.y
            );
            var box = this.paper.rect(
                center.x - this.elemHalfSz.x, center.y - this.elemHalfSz.y,
                this.elemSz.x, this.elemSz.y, this.cornerRadius
            ).attr(this.frameAttrs);
            var label = this.paper.text(center.x, center.y, 'R' + (rgi + 1).toString()).attr(this.fontAttrs);
            var self = this;
            box.node.onclick = function() {
                self.onClick(rgi);
            };
            label.node.onclick = function() {
                self.onClick(rgi);
            };
            this.items[rgi] = { box : box, label : label };
        }).apply(this, [rgi]);
    }
};

rnd.RGroupTable.prototype.setMode = function(mode) {
    this.mode = mode;
};

rnd.RGroupTable.prototype.setSelection = function(selection) {
    this.selection = selection;
    for (var rgi = 0; rgi < 32; rgi++) {
        this.items[rgi].box.attr('fill', this.selection & (1 << rgi) ? this.fillColorSelected : this.fillColor);
    }
};



