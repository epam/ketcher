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
	throw new Error("Prototype.js should be loaded first")
if (!window.rnd)
	throw new Error("rnd should be defined prior to loading this file");

rnd.ElementTable = function (clientArea, opts)
{
	opts = opts || {};
	clientArea = $(clientArea);
	clientArea.innerHTML = "";
	this.paper = new Raphael(clientArea);
	this.size = new chem.Vec2();
	this.viewSz = new chem.Vec2(clientArea['clientWidth'] || 100, clientArea['clientHeight'] || 100);
	this.bb = new chem.Box2Abs(new chem.Vec2(), this.viewSz);
	
	var table = this;
	this.onClick = opts.onClick || function(elemNum){ table.setElementSelected(elemNum, !table.items[elemNum].selected); }

	var paper = this.paper;
	var elemHalfSz = new chem.Vec2(16, 16);
	var elemSz = elemHalfSz.scaled(2);
	var spacing = new chem.Vec2(3, 3);
	var cornerRadius = 7;
	var orig = elemSz.scaled(1.0);
	
	this.fillColor = opts.fillColor || '#def';
	this.fillColorSelected = opts.fillColorSelected || '#fcb';
	this.frameColor = opts.frameColor || '#9ad';
	this.frameThickness = opts.frameThickness || '1pt';
	this.fontSize = opts.fontSize || 19;
	this.fontType = opts.fontType || "Arial";


	this.frameAttrs = {
			'fill':this.fillColor,
			'stroke':this.frameColor,
			'stroke-width':this.frameThickness
		};
	this.fontAttrs = {
			'font' : this.fontType,
			'font-size' : this.fontSize
		};
	this.items = {};

	chem.Element.elements.each(function(id, elem){
		var centre = new chem.Vec2(orig.x + elem.xpos * elemSz.x + (elem.xpos - 1) * spacing.x, orig.y + elem.ypos * elemSz.y + (elem.ypos - 1) * spacing.y);
		var box = this.paper.rect(centre.x - elemHalfSz.x, centre.y - elemHalfSz.y, elemSz.x, elemSz.y, cornerRadius).attr(this.frameAttrs);
		var label = this.paper.text(centre.x, centre.y, elem.label).attr(this.fontAttrs).attr('fill', elem.color);
		box.node.onclick = function () { table.onClick(id); };
		label.node.onclick = function () { table.onClick(id); };
		this.items[id] = {'box':box, 'label':label, 'selected':false};
	}, this); 
}

rnd.ElementTable.prototype.setElementSelected = function (id, selected) {
	var item = this.items[id];
	if (selected)
		item.box.attr('fill',this.fillColorSelected);
	else
		item.box.attr('fill',this.fillColor);
	item.selected = selected;
}
