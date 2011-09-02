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

rnd.ElementTable = function (clientArea, opts, element)
{
	opts = opts || {};
	clientArea = $(clientArea);
	clientArea.innerHTML = "";
	this.paper = new Raphael(clientArea);
	this.size = new util.Vec2();
	this.viewSz = new util.Vec2(clientArea['clientWidth'] || 100, clientArea['clientHeight'] || 100);
	this.bb = new util.Box2Abs(new util.Vec2(), this.viewSz);

	var table = this;
	this.onClick = opts.onClick || function(elemNum){table.setElementSelected(elemNum, !table.items[elemNum].selected);}

	this.elemHalfSz = new util.Vec2(16, 16);
	this.elemSz = this.elemHalfSz.scaled(2);
	this.spacing = new util.Vec2(3, 3);
	this.cornerRadius = 7;
	this.orig = this.elemSz.scaled(1.0);

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
}

rnd.ElementTable.prototype.renderTable = function () {
	var table = this;
	chem.Element.elements.each(function(id, elem){
		var centre = new util.Vec2(this.orig.x + elem.xpos * this.elemSz.x + (elem.xpos - 1) * this.spacing.x, this.orig.y + elem.ypos * this.elemSz.y + (elem.ypos - 1) * this.spacing.y);
		var box = this.paper.rect(centre.x - this.elemHalfSz.x, centre.y - this.elemHalfSz.y, this.elemSz.x, this.elemSz.y, this.cornerRadius).attr(this.frameAttrs);
		var label = this.paper.text(centre.x, centre.y, elem.label).attr(this.fontAttrs).attr('fill', elem.color);
		box.node.onclick = function () {table.onClick(id);};
		label.node.onclick = function () {table.onClick(id);};
		this.items[id] = {'box':box, 'label':label, 'selected':false};
	}, this);

}

rnd.ElementTable.prototype.renderSingle = function (element) {
	var elemId = chem.Element.getElementByLabel(element);
	var elem = chem.Element.elements.get(elemId);
	this.items[element] = this.paper.text(this.viewSz.x / 2, this.viewSz.y / 2, element).attr(this.fontAttrs).attr('fill', elem ? elem.color : '#000');
}

rnd.ElementTable.prototype.renderArrow = function () {
	var margin = 4, hsz = 16, hext = 6, hw = 4;
	this.items['arrow'] = this.paper.path("M{1},{3}L{2},{4}L{1},{5}M{0},{4}L{2},{4}", margin, 2 * hsz - hext - margin, 2 * hsz - margin, hsz - hw, hsz, hsz + hw).attr({'stroke': '#000','stroke-width': '2px'});
}

rnd.ElementTable.prototype.renderPlus = function () {
	var hsz = 16, hext = 9;
	this.items['plus'] = this.paper.path("M{1},{0}L{1},{2}M{0},{1}L{2},{1}", hsz - hext, hsz, hsz + hext).attr({'stroke': '#000','stroke-width': '2px'});
}

rnd.ElementTable.prototype.setElementSelected = function (id, selected) {
	var item = this.items[id];
	if (selected)
		item.box.attr('fill',this.fillColorSelected);
	else
		item.box.attr('fill',this.fillColor);
	item.selected = selected;
}
