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
if (!window.rnd || !rnd.MolData)
	throw new Error("rnd.MolData should be defined prior to loading this file");

rnd.DEBUG = false;

rnd.logcnt = 0;
rnd.logmouse = false;
rnd.hl = false;

rnd.mouseEventNames = [
	'Click',
	'DblClick',
	'MouseOver',
	'MouseDown',
	'MouseMove',
	'MouseOut'
	];
rnd.entities = ['Atom', 'Bond', 'Canvas'];

rnd.actions = [
	'atomSetAttr',
	'atomAddToSGroup',
	'atomRemoveFromSGroup',
	'atomClearSGroups',
	'atomAdd',
	'atomMove',
	'atomMoveRel',
	'atomMoveRelMultiple',
	'atomRemove',
	'bondSetAttr',
	'bondAdd',
	'bondFlip',
	'bondRemove',
	'sGroupSetHighlight',
	'sGroupSetAttr',
	'sGroupSetType',
	'sGroupSetPos' // data s-group label position
];

rnd.ElementTable = function (clientArea)
{

	this.scale = 100;
	clientArea = $(clientArea);
	clientArea.innerHTML = "";
	this.paper = new Raphael(clientArea);
	this.size = new chem.Vec2();
	this.viewSz = new chem.Vec2(clientArea['clientWidth'] || 100, clientArea['clientHeight'] || 100);
	this.bb = new chem.Box2Abs(new chem.Vec2(), this.viewSz);
	this.curItem = {
		'type':'Canvas',
		'id':-1
	};

	var valueT = 0, valueL = 0;
	var element = clientArea;
	do {
		valueT += element.offsetTop  || 0;
		valueL += element.offsetLeft || 0;
		element = element.offsetParent;
	} while (element);

	this.clientAreaPos = new chem.Vec2(valueL, valueT);

//	// assign canvas events handlers
//	rnd.mouseEventNames.each(function(eventName){
//		clientArea.observe(eventName.toLowerCase(), function(event) {
//			var name = '_onCanvas' + eventName;
//			if (render[name])
//				render[name](new rnd.MouseEvent(event));
//			chem.stopEventPropagation(event);
//			return chem.preventDefault(event);
//		});
//	}, this);

	var paper = this.paper;
	var elemWidth = 30, elemHeight = 30;
	var orig = new chem.Vec2(elemWidth, elemHeight);
	chem.Element.elements.each(function(id, elem){
		var path = this.paper.text(orig.x + elem.xpos * elemWidth, orig.y + elem.ypos * elemHeight, elem.label)
		.attr({
			'font' : "Arial",
			'font-size' : 20,
			'fill' : elem.color
		});
//		console.log(elem);
	}, this);
//	var path = this.paper.text(valueL, valueT, "TEST")
//	.attr({
//		'font' : "Arial",
//		'font-size' : 20,
//		'fill' : "#000"
//	});
}