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
	
	this.onClick = opts.onClick || function(elemNum){ alert(elemNum); }

	var paper = this.paper;
	var elemHalfSz = new chem.Vec2(16, 16);
	var elemSz = elemHalfSz.scaled(2);
	var spacing = new chem.Vec2(3, 3);
	var cornerRadius = 7;
	var orig = elemSz.scaled(1.0);
	
	var fillColor = '#def';
	var frameColor = '#9ad';
	var frameThickness = '1pt';
	var frameAttrs = {
			'fill':fillColor,
			'stroke':frameColor,
			'stroke-width':frameThickness
		};
	var fontSize = 19;
	var fontType = "Arial";
	var fontAttrs = {
			'font' : fontType,
			'font-size' : fontSize
		};
	
	chem.Element.elements.each(function(id, elem){
		var centre = new chem.Vec2(orig.x + elem.xpos * elemSz.x + (elem.xpos - 1) * spacing.x, orig.y + elem.ypos * elemSz.y + (elem.ypos - 1) * spacing.y);
		var box = this.paper.rect(centre.x - elemHalfSz.x, centre.y - elemHalfSz.y, elemSz.x, elemSz.y, cornerRadius).attr(frameAttrs);
		var path = this.paper.text(centre.x, centre.y, elem.label).attr(fontAttrs).attr('fill', elem.color);
		var table = this;
		box.node.onclick = function () { table.onClick(id); };
		path.node.onclick = function () { table.onClick(id); };
	}, this);
}