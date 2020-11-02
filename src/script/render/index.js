/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import Raphael from '../raphael-ext';
import Box2Abs from '../util/box2abs';
import Vec2 from '../util/vec2';
import scale from '../util/scale';

import Struct from '../chem/struct';
import ReStruct from './restruct';

import defaultOptions from './options';

var DEBUG = { debug: false, logcnt: 0, logmouse: false, hl: false };
DEBUG.logMethod = function () { };
// DEBUG.logMethod = function (method) {addionalAtoms("METHOD: " + method);

function Render(clientArea, opt) {
	let renderWidth = clientArea.clientWidth - 10;
	let renderHeight = clientArea.clientHeight - 10;
	renderWidth = renderWidth > 0 ? renderWidth : 0;
	renderHeight = renderHeight > 0 ? renderHeight : 0;

	this.userOpts = opt;
	this.clientArea = clientArea;
	this.paper = new Raphael(clientArea, renderWidth, renderHeight);
	this.sz = Vec2.ZERO;
	this.ctab = new ReStruct(new Struct(), this);
	this.options = defaultOptions(this.userOpts);
}

Render.prototype.view2obj = function (p, isRelative) {
	var scroll = this.scrollPos();
	if (!this.useOldZoom) {
		p = p.scaled(1 / this.options.zoom);
		scroll = scroll.scaled(1 / this.options.zoom);
	}
	p = isRelative ? p : p.add(scroll).sub(this.options.offset);
	return scale.scaled2obj(p, this.options);
};

Render.prototype.obj2view = function (v, isRelative) {
	var p = scale.obj2scaled(v, this.options);
	p = isRelative ? p : p.add(this.options.offset).sub(this.scrollPos().scaled(1 / this.options.zoom));
	if (!this.useOldZoom)
		p = p.scaled(this.options.zoom);
	return p;
};

Render.prototype.scrollPos = function () {
	return new Vec2(this.clientArea.scrollLeft, this.clientArea.scrollTop);
};

function cumulativeOffset(el) {
	var curtop = 0;
	var curleft = 0;
	if (el.parentNode) {
		do {
			curtop += el.offsetTop || 0;
			curleft += el.offsetLeft || 0;
			el = el.offsetParent;
		} while (el);
	}
	return { left: curleft, top: curtop };
}

Render.prototype.page2obj = function (pagePos) {
	var offset = cumulativeOffset(this.clientArea);
	var pp = new Vec2(pagePos.pageX - offset.left, pagePos.pageY - offset.top);
	return this.view2obj(pp);
};

Render.prototype.setPaperSize = function (sz) {
	DEBUG.logMethod('setPaperSize');
	this.sz = sz;
	this.paper.setSize(sz.x * this.options.zoom, sz.y * this.options.zoom);
	this.setViewBox(this.options.zoom);
};

Render.prototype.setOffset = function (newoffset) {
	DEBUG.logMethod('setOffset');
	var delta = new Vec2(newoffset.x - this.options.offset.x, newoffset.y - this.options.offset.y);
	this.clientArea.scrollLeft += delta.x;
	this.clientArea.scrollTop += delta.y;
	this.options.offset = newoffset;
};

Render.prototype.setZoom = function (zoom) {
	// when scaling the canvas down it may happen that the scaled canvas is smaller than the view window
	// don't forget to call setScrollOffset after zooming (or use extendCanvas directly)
	console.info('set zoom', zoom);
	this.options.zoom = zoom;
	this.paper.setSize(this.sz.x * zoom, this.sz.y * zoom);
	this.setViewBox(zoom);
};

function calcExtend(sSz, x0, y0, x1, y1) { // eslint-disable-line max-params
	var ex = (x0 < 0) ? -x0 : 0;
	var ey = (y0 < 0) ? -y0 : 0;

	if (sSz.x < x1)
		ex += x1 - sSz.x;
	if (sSz.y < y1)
		ey += y1 - sSz.y;
	return new Vec2(ex, ey);
}

Render.prototype.setScrollOffset = function (x, y) {
	var clientArea = this.clientArea;
	var cx = clientArea.clientWidth;
	var cy = clientArea.clientHeight;
	var e = calcExtend(this.sz.scaled(this.options.zoom), x, y,
		cx + x, cy + y)
		.scaled(1 / this.options.zoom);
	if (e.x > 0 || e.y > 0) {
		this.setPaperSize(this.sz.add(e));
		var d = new Vec2((x < 0) ? -x : 0,
			(y < 0) ? -y : 0).scaled(1 / this.options.zoom);
		if (d.x > 0 || d.y > 0) {
			this.ctab.translate(d);
			this.setOffset(this.options.offset.add(d));
		}
	}
	clientArea.scrollLeft = x;
	clientArea.scrollTop = y;
	// TODO: store drag position in scaled systems
	// scrollLeft = clientArea.scrollLeft;
	// scrollTop = clientArea.scrollTop;
	this.update(false);
};

Render.prototype.setScale = function (z) {
	if (this.options.offset)
		this.options.offset = this.options.offset.scaled(1 / z).scaled(z);
	this.userOpts.scale *= z;
	this.options = null;
	this.update(true);
};

Render.prototype.setViewBox = function (z) {
	if (!this.useOldZoom)
		this.paper.canvas.setAttribute('viewBox', '0 0 ' + this.sz.x + ' ' + this.sz.y);
	else
		this.setScale(z);
};

Render.prototype.setMolecule = function (ctab) {
	DEBUG.logMethod('setMolecule');
	this.paper.clear();
	this.ctab = new ReStruct(ctab, this);
	this.options.offset = new Vec2();
	this.update(false);
};

Render.prototype.update = function (force, viewSz) { // eslint-disable-line max-statements
	viewSz = viewSz || new Vec2(this.clientArea.clientWidth || 100,
		this.clientArea.clientHeight || 100);

	var changes = this.ctab.update(force);
	this.ctab.setSelection(); // [MK] redraw the selection bits where necessary
	if (changes) {
		var sf = this.options.scale;
		var bb = this.ctab.getVBoxObj().transform(scale.obj2scaled, this.options).translate(this.options.offset || new Vec2());

		if (!this.options.autoScale) {
			var ext = Vec2.UNIT.scaled(sf);
			var eb = bb.sz().length() > 0 ? bb.extend(ext, ext) : bb;
			var vb = new Box2Abs(this.scrollPos(), viewSz.scaled(1 / this.options.zoom).sub(Vec2.UNIT.scaled(20)));
			var cb = Box2Abs.union(vb, eb);
			if (!this.oldCb)
				this.oldCb = new Box2Abs();

			var sz = cb.sz().floor();
			var delta = this.oldCb.p0.sub(cb.p0).ceil();
			this.oldBb = bb;
			if (!this.sz || sz.x != this.sz.x || sz.y != this.sz.y)
				this.setPaperSize(sz);

			this.options.offset = this.options.offset || new Vec2();
			if (delta.x != 0 || delta.y != 0) {
				this.setOffset(this.options.offset.add(delta));
				this.ctab.translate(delta);
			}
		} else {
			var sz1 = bb.sz();
			var marg = this.options.autoScaleMargin;
			var mv = new Vec2(marg, marg);
			var csz = viewSz;
			if (csz.x < (2 * marg) + 1 || csz.y < (2 * marg) + 1)
				throw new Error('View box too small for the given margin');
			var rescale = Math.max(sz1.x / (csz.x - (2 * marg)), sz1.y / (csz.y - (2 * marg)));
			if (this.options.maxBondLength / rescale > 1.0)
				rescale = 1.0;
			var sz2 = sz1.add(mv.scaled(2 * rescale));
			/* eslint-disable no-mixed-operators*/
			this.paper.setViewBox(bb.pos().x - marg * rescale - (csz.x * rescale - sz2.x) / 2, bb.pos().y - marg * rescale - (csz.y * rescale - sz2.y) / 2, csz.x * rescale, csz.y * rescale);
			/* eslint-enable no-mixed-operators*/
		}
	}
};

export default Render;
