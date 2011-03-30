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

if (!window.chem)
	chem = {};

chem.Set = {
	size: function(set) {
		var cnt = 0;
		for (var id in set) {
			if (set[id] !== Object.prototype[id]) {
				cnt++;
			}
		}
	},

	contains: function(set, v) {
		return typeof(set[v]) != "undefined" && set[v] !== Object.prototype[v];
	},

	subset: function(set1, set2) {
		for (var id in set1) {
			if (set1[id] !== Object.prototype[id]) {
				if (set2[id] !== set1[id]) {
					return false;
				}
			}
		}
		return true;
	},

	eq: function(set1, set2) {
		return chem.Set.subset(set1, set2) && chem.Set.subset(set2, set1);
	},

	each: function(set, func, context) {
		for (var v in set) {
			if (set[v] !== Object.prototype[v]) {
				func.call(context, set[v]);
			}
		}
	},

	list: function(set) {
		var list = [];
		for (var v in set) {
			if (set[v] !== Object.prototype[v]) {
				list.push(set[v]);
			}
		}
		return list;
	},

	add: function(set, item) {
		set[item] = item;
	},
	
	remove: function(set, item) {
		delete set[item];
	},

	clear: function(set) {
		set = {};
	}
}