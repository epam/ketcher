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

import util from './util';
import Vec2 from '../util/vec2';
import Raphael from '../raphael-ext';

const tfx = util.tfx;

function arrow(paper, a, b, options) {
	var width = 5,
		length = 7;
	return paper.path('M{0},{1}L{2},{3}L{4},{5}M{2},{3}L{4},{6}', tfx(a.x), tfx(a.y), tfx(b.x), tfx(b.y), tfx(b.x - length), tfx(b.y - width), tfx(b.y + width))
		.attr(options.lineattr);
}

function plus(paper, c, options) {
	var s = options.scale / 5;
	return paper.path('M{0},{4}L{0},{5}M{2},{1}L{3},{1}', tfx(c.x), tfx(c.y), tfx(c.x - s), tfx(c.x + s), tfx(c.y - s), tfx(c.y + s))
		.attr(options.lineattr);
}

function bondSingle(paper, hb1, hb2, options) {
	var a = hb1.p,
		b = hb2.p;
	return paper.path(makeStroke(a, b))
		.attr(options.lineattr);
}

function bondSingleUp(paper, a, b2, b3, options) { // eslint-disable-line max-params
	return paper.path('M{0},{1}L{2},{3}L{4},{5}Z', tfx(a.x), tfx(a.y), tfx(b2.x), tfx(b2.y), tfx(b3.x), tfx(b3.y))
		.attr(options.lineattr).attr({ fill: '#000' });
}

function bondSingleStereoBold(paper, a1, a2, a3, a4, options) { // eslint-disable-line max-params
	return paper.path('M{0},{1}L{2},{3}L{4},{5}L{6},{7}Z',
		tfx(a1.x), tfx(a1.y), tfx(a2.x), tfx(a2.y), tfx(a3.x), tfx(a3.y), tfx(a4.x), tfx(a4.y))
		.attr(options.lineattr).attr({
			stroke: '#000',
			fill: '#000'
		});
}

function bondDoubleStereoBold(paper, sgBondPath, b1, b2, options) { // eslint-disable-line max-params
	return paper.set([sgBondPath, paper.path('M{0},{1}L{2},{3}', tfx(b1.x), tfx(b1.y), tfx(b2.x), tfx(b2.y))
		.attr(options.lineattr)]);
}

function bondSingleDown(paper, hb1, d, nlines, step, options) { // eslint-disable-line max-params
	var a = hb1.p,
		n = hb1.norm;
	var bsp = 0.7 * options.stereoBond;

	var path = '',
		p,
		q,
		r;
	for (var i = 0; i < nlines; ++i) {
		r = a.addScaled(d, step * i);
		p = r.addScaled(n, bsp * (i + 0.5) / (nlines - 0.5));
		q = r.addScaled(n, -bsp * (i + 0.5) / (nlines - 0.5));
		path += makeStroke(p, q);
	}
	return paper.path(path).attr(options.lineattr);
}

function bondSingleEither(paper, hb1, d, nlines, step, options) { // eslint-disable-line max-params
	var a = hb1.p,
		n = hb1.norm;
	var bsp = 0.7 * options.stereoBond;

	var path = 'M' + tfx(a.x) + ',' + tfx(a.y),
		r = a;
	for (var i = 0; i < nlines; ++i) {
		r = a.addScaled(d, step * (i + 0.5)).addScaled(n,
			((i & 1) ? -1 : +1) * bsp * (i + 0.5) / (nlines - 0.5));
		path += 'L' + tfx(r.x) + ',' + tfx(r.y);
	}
	return paper.path(path)
		.attr(options.lineattr);
}

function bondDouble(paper, a1, a2, b1, b2, cisTrans, options) { // eslint-disable-line max-params
	return paper.path(cisTrans ?
		'M{0},{1}L{6},{7}M{4},{5}L{2},{3}' :
		'M{0},{1}L{2},{3}M{4},{5}L{6},{7}',
	tfx(a1.x), tfx(a1.y), tfx(b1.x), tfx(b1.y), tfx(a2.x), tfx(a2.y), tfx(b2.x), tfx(b2.y))
		.attr(options.lineattr);
}

function bondSingleOrDouble(paper, hb1, hb2, nSect, options) { // eslint-disable-line max-statements, max-params
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm;
	var bsp = options.bondSpace / 2;

	var path = '',
		pi,
		pp = a;
	for (var i = 1; i <= nSect; ++i) {
		pi = Vec2.lc2(a, (nSect - i) / nSect, b, i / nSect);
		if (i & 1) {
			path += makeStroke(pp, pi);
		} else {
			path += makeStroke(pp.addScaled(n, bsp), pi.addScaled(n, bsp));
			path += makeStroke(pp.addScaled(n, -bsp), pi.addScaled(n, -bsp));
		}
		pp = pi;
	}
	return paper.path(path)
		.attr(options.lineattr);
}

function bondTriple(paper, hb1, hb2, options) {
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm;
	var a2 = a.addScaled(n, options.bondSpace);
	var b2 = b.addScaled(n, options.bondSpace);
	var a3 = a.addScaled(n, -options.bondSpace);
	var b3 = b.addScaled(n, -options.bondSpace);
	return paper.path(makeStroke(a, b) + makeStroke(a2, b2) + makeStroke(a3, b3))
		.attr(options.lineattr);
}

function bondAromatic(paper, paths, bondShift, options) {
	var l1 = paper.path(paths[0]).attr(options.lineattr);
	var l2 = paper.path(paths[1]).attr(options.lineattr);
	if (bondShift !== undefined && bondShift !== null)
		(bondShift > 0 ? l1 : l2).attr({ 'stroke-dasharray': '- ' });

	return paper.set([l1, l2]);
}

function bondAny(paper, hb1, hb2, options) {
	var a = hb1.p,
		b = hb2.p;
	return paper.path(makeStroke(a, b))
		.attr(options.lineattr).attr({ 'stroke-dasharray': '- ' });
}

function reactingCenter(paper, p, options) {
	var pathdesc = '';
	for (var i = 0; i < p.length / 2; ++i)
		pathdesc += makeStroke(p[2 * i], p[(2 * i) + 1]);
	return paper.path(pathdesc).attr(options.lineattr);
}

function topologyMark(paper, p, mark, options) {
	var path = paper.text(p.x, p.y, mark)
		.attr({
			font: options.font,
			'font-size': options.fontszsub,
			fill: '#000'
		});
	var rbb = util.relBox(path.getBBox());
	recenterText(path, rbb);
	return path;
}

function radicalCap(paper, p, options) {
	var s = options.lineWidth * 0.9;
	var dw = s,
		dh = 2 * s;
	return paper.path('M{0},{1}L{2},{3}L{4},{5}',
		tfx(p.x - dw), tfx(p.y + dh), tfx(p.x), tfx(p.y), tfx(p.x + dw), tfx(p.y + dh))
		.attr({
			stroke: '#000',
			'stroke-width': options.lineWidth * 0.7,
			'stroke-linecap': 'square',
			'stroke-linejoin': 'miter'
		});
}

function radicalBullet(paper, p, options) {
	return paper.circle(tfx(p.x), tfx(p.y), options.lineWidth)
		.attr({
			stroke: null,
			fill: '#000'
		});
}

function bracket(paper, d, n, c, bracketWidth, bracketHeight, options) { // eslint-disable-line max-params
	bracketWidth = bracketWidth || 0.25;
	bracketHeight = bracketHeight || 1.0;
	var a0 = c.addScaled(n, -0.5 * bracketHeight);
	var a1 = c.addScaled(n, 0.5 * bracketHeight);
	var b0 = a0.addScaled(d, -bracketWidth);
	var b1 = a1.addScaled(d, -bracketWidth);

	return paper.path('M{0},{1}L{2},{3}L{4},{5}L{6},{7}',
		tfx(b0.x), tfx(b0.y), tfx(a0.x), tfx(a0.y),
		tfx(a1.x), tfx(a1.y), tfx(b1.x), tfx(b1.y)).attr(options.sgroupBracketStyle);
}

function selectionRectangle(paper, p0, p1, options) {
	return paper.rect(tfx(Math.min(p0.x, p1.x)),
		tfx(Math.min(p0.y, p1.y)),
		tfx(Math.abs(p1.x - p0.x)),
		tfx(Math.abs(p1.y - p0.y))).attr(options.lassoStyle);
}

function selectionPolygon(paper, r, options) {
	var v = r[r.length - 1];
	var pstr = 'M' + tfx(v.x) + ',' + tfx(v.y);
	for (var i = 0; i < r.length; ++i)
		pstr += 'L' + tfx(r[i].x) + ',' + tfx(r[i].y);
	return paper.path(pstr).attr(options.lassoStyle);
}

function selectionLine(paper, p0, p1, options) {
	return paper.path(makeStroke(p0, p1)).attr(options.lassoStyle);
}

function makeStroke(a, b) {
	return 'M' + tfx(a.x) + ',' + tfx(a.y) +
		'L' + tfx(b.x) + ',' + tfx(b.y) + '	';
}

function dashedPath(p0, p1, dash) {
	var t0 = 0;
	var t1 = Vec2.dist(p0, p1);
	var d = Vec2.diff(p1, p0).normalized();
	var black = true;
	var path = '';
	var i = 0;

	while (t0 < t1) {
		var len = dash[i % dash.length];
		var t2 = t0 + Math.min(len, t1 - t0);
		if (black)
			path += 'M ' + p0.addScaled(d, t0).coordStr() + ' L ' + p0.addScaled(d, t2).coordStr();
		t0 += len;
		black = !black;
		i++;
	}
	return path;
}

function aromaticBondPaths(a2, a3, b2, b3, mask, dash) { // eslint-disable-line max-params
	var l1 = dash && (mask & 1) ? dashedPath(a2, b2, dash) : makeStroke(a2, b2);
	var l2 = dash && (mask & 2) ? dashedPath(a3, b3, dash) : makeStroke(a3, b3);

	return [l1, l2];
}

function recenterText(path, rbb) {
	// TODO: find a better way
	if (Raphael.vml) { // dirty hack
		console.assert(null, 'Souldn\'t go here!');
		var gap = rbb.height * 0.16;
		path.translateAbs(0, gap);
		rbb.y += gap;
	}
}

export default {
	recenterText,
	arrow,
	plus,
	aromaticBondPaths,
	bondSingle,
	bondSingleUp,
	bondSingleStereoBold,
	bondDoubleStereoBold,
	bondSingleDown,
	bondSingleEither,
	bondDouble,
	bondSingleOrDouble,
	bondTriple,
	bondAromatic,
	bondAny,
	reactingCenter,
	topologyMark,
	radicalCap,
	radicalBullet,
	bracket,
	selectionRectangle,
	selectionPolygon,
	selectionLine
};
