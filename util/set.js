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

if (!window.util)
	util = {};

util.Set = {
	empty: function() {
		return {};
	},

	single: function(item) {
		var set = {};
		util.Set.add(set, item);
		return set;
	},

	size: function(set) {
		var cnt = 0;
		for (var id in set) {
			if (set[id] !== Object.prototype[id]) {
				cnt++;
			}
		}
		return cnt;
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
		return util.Set.subset(set1, set2) && util.Set.subset(set2, set1);
	},

	each: function(set, func, context) {
		for (var v in set) {
			if (set[v] !== Object.prototype[v]) {
				func.call(context, set[v]);
			}
		}
	},

	filter: function(set, func, context) {
		var subset = {};
		for (var v in set) {
			if (set[v] !== Object.prototype[v]) {
				if (func.call(context, set[v])) {
					subset[set[v]] = set[v];
				}
			}
		}
		return subset;
	},

	pick: function(set) {
		for (var v in set) {
			if (set[v] !== Object.prototype[v]) {
				return set[v];
			}
		}
		return null;
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

	mergeIn: function(set, other) {
		util.Set.each(other, function(item){
			util.Set.add(set, item);
		});
	},

	remove: function(set, item) {
		var v = set[item];
		delete set[item];
		return v;
	},

	clone: function(other) {
		var set = {};
		util.Set.mergeIn(set, other);
		return set;
	},

	fromList: function(list) {
		var set = {};
		for (var i = 0; i < list.length; ++i) {
			set[list[i]-0] = list[i]-0;
		}
		return set;
	},

	keySetInt: function(map) {
		var set = {};
		map.each(function(id){
			set[id - 0] = id - 0;
		});
		return set;
	},

	find: function(set, func, context) {
		for (var v in set) {
			if (set[v] !== Object.prototype[v]) {
				if (func.call(context, set[v])) {
					return v;
				}
			}
		}
		return null;
	}
};
