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

if (!window.util || !util.Vec2)
    throw new Error("Vec2 should be defined first");

if (!window.chem)
    chem = {};

function hexToRGB(hex) {
	return {
		'r': parseInt(hex.substring(1,3), 16),
		'g': parseInt(hex.substring(3,5), 16),
		'b': parseInt(hex.substring(5,7), 16)
	};
}

function rgbCompToHex(c) {
	c = c.toFixed();
	c = Math.max(Math.min(c, 255),0);
	var hex = c.toString(16);
	if (hex.length < 2)
		hex = '0' + hex;
	return hex;
}

function rgbToHex(rgb) {
	return '#' + 
		rgbCompToHex(rgb.r) +
		rgbCompToHex(rgb.g) +
		rgbCompToHex(rgb.b);
}

function rgbRescale(rgb, maxNorm) {
	var norm = 0.21 * rgb.r + 0.72 * rgb.g + 0.07 * rgb.b;
	if (norm <= maxNorm)
		return rgb;
	return {
		'r': (rgb.r * maxNorm / norm).toFixed()-0,
		'g': (rgb.g * maxNorm / norm).toFixed()-0,
		'b': (rgb.b * maxNorm / norm).toFixed()-0
	}
}

// element table and utilities
chem.Element = function (label, period, group, putHydrogenOnTheLeft, color, ypos, xpos)
{
    this.label = label;
    this.period = period;
    this.group = group;
    this.putHydrogenOnTheLeft = putHydrogenOnTheLeft;
    this.color = color || '#000000';
    this.labelColor = rgbToHex(rgbRescale(hexToRGB(this.color),150));
	this.xpos = xpos || group;
	this.ypos = ypos || period;
	
	var r = (("0x"+this.color.substring(1,3)) - 0)/255;
	var g = (("0x"+this.color.substring(3,5)) - 0)/255;
	var b = (("0x"+this.color.substring(5,7)) - 0)/255;
	var luminance = 0.299*r + 0.587*g + 0.114*b;
	if (luminance > 0.6) {
		r *= 0.6 / luminance;
		g *= 0.6 / luminance;
		b *= 0.6 / luminance;
	}
	r = Math.ceil(Math.min(r * 255, 255)).toString(16);
	g = Math.ceil(Math.min(g * 255, 255)).toString(16);
	b = Math.ceil(Math.min(b * 255, 255)).toString(16);
	r = r.length == 1 ? "0" + r : r;
	g = g.length == 1 ? "0" + g : g;
	b = b.length == 1 ? "0" + b : b;
	this.color = "#" + r + g + b;

};

chem.Element.elements = new util.Map({
      1: new chem.Element( 'H', 1, 1, false, '#000000', 1, 1),
      2: new chem.Element('He', 1, 8, false, '#d9ffff', 1, 18),
      3: new chem.Element('Li', 2, 1, false, '#cc80ff', 2, 1),
      4: new chem.Element('Be', 2, 2, false, '#c2ff00', 2, 2),
      5: new chem.Element( 'B', 2, 3, false, '#ffb5b5', 2,13),
      6: new chem.Element( 'C', 2, 4, false, '#000000', 2,14),
      7: new chem.Element( 'N', 2, 5, false, '#304ff7', 2,15),
      8: new chem.Element( 'O', 2, 6, true,  '#ff0d0d', 2,16),
      9: new chem.Element( 'F', 2, 7, true,  '#8fe04f', 2,17),
     10: new chem.Element('Ne', 2, 8, false, '#b3e3f5', 2,18),
     11: new chem.Element('Na', 3, 1, false, '#ab5cf2', 3, 1),
     12: new chem.Element('Mg', 3, 2, false, '#8aff00', 3, 2),
     13: new chem.Element('Al', 3, 3, false, '#bfa6a6', 3,13),
     14: new chem.Element('Si', 3, 4, false, '#f0c7a1', 3,14),
     15: new chem.Element( 'P', 3, 5, false, '#ff8000', 3,15),
     16: new chem.Element( 'S', 3, 6, true,  '#d9a61a', 3,16),
     17: new chem.Element('Cl', 3, 7, true,  '#1fd01f', 3,17),
     18: new chem.Element('Ar', 3, 8, false, '#80d1e3', 3,18),
     19: new chem.Element( 'K', 4, 1, false, '#8f40d4', 4, 1),
     20: new chem.Element('Ca', 4, 2, false, '#3dff00', 4, 2),
     21: new chem.Element('Sc', 4, 3, false, '#e6e6e6', 4, 3),
     22: new chem.Element('Ti', 4, 4, false, '#bfc2c7', 4, 4),
     23: new chem.Element( 'V', 4, 5, false, '#a6a6ab', 4, 5),
     24: new chem.Element('Cr', 4, 6, false, '#8a99c7', 4, 6),
     25: new chem.Element('Mn', 4, 7, false, '#9c7ac7', 4, 7),
     26: new chem.Element('Fe', 4, 8, false, '#e06633', 4, 8),
     27: new chem.Element('Co', 4, 8, false, '#f08fa1', 4, 9),
     28: new chem.Element('Ni', 4, 8, false, '#4fd14f', 4,10),
     29: new chem.Element('Cu', 4, 1, false, '#c78033', 4,11),
     30: new chem.Element('Zn', 4, 2, false, '#7d80b0', 4,12),
     31: new chem.Element('Ga', 4, 3, false, '#c28f8f', 4,13),
     32: new chem.Element('Ge', 4, 4, false, '#668f8f', 4,14),
     33: new chem.Element('As', 4, 5, false, '#bd80e3', 4,15),
     34: new chem.Element('Se', 4, 6, true,  '#ffa100', 4,16),
     35: new chem.Element('Br', 4, 7, true,  '#a62929', 4,17),
     36: new chem.Element('Kr', 4, 8, false, '#5cb8d1', 4,18),
     37: new chem.Element('Rb', 5, 1, false, '#702eb0', 5, 1),
     38: new chem.Element('Sr', 5, 2, false, '#00ff00', 5, 2),
     39: new chem.Element( 'Y', 5, 3, false, '#94ffff', 5, 3),
     40: new chem.Element('Zr', 5, 4, false, '#94e0e0', 5, 4),
     41: new chem.Element('Nb', 5, 5, false, '#73c2c9', 5, 5),
     42: new chem.Element('Mo', 5, 6, false, '#54b5b5', 5, 6),
     43: new chem.Element('Tc', 5, 7, false, '#3b9e9e', 5, 7),
     44: new chem.Element('Ru', 5, 8, false, '#248f8f', 5, 8),
     45: new chem.Element('Rh', 5, 8, false, '#0a7d8c', 5, 9),
     46: new chem.Element('Pd', 5, 8, false, '#006985', 5,10),
     47: new chem.Element('Ag', 5, 1, false, '#bfbfbf', 5,11),
     48: new chem.Element('Cd', 5, 2, false, '#ffd98f', 5,12),
     49: new chem.Element('In', 5, 3, false, '#a67573', 5,13),
     50: new chem.Element('Sn', 5, 4, false, '#668080', 5,14),
     51: new chem.Element('Sb', 5, 5, false, '#9e63b5', 5,15),
     52: new chem.Element('Te', 5, 6, false, '#d47a00', 5,16),
     53: new chem.Element( 'I', 5, 7, true,  '#940094', 5,17),
     54: new chem.Element('Xe', 5, 8, false, '#429eb0', 5,18),
     55: new chem.Element('Cs', 6, 1, false, '#57178f', 6, 1),
     56: new chem.Element('Ba', 6, 2, false, '#00c900', 6, 2),
     57: new chem.Element('La', 6, 3, false, '#70d4ff', 6, 3),
     58: new chem.Element('Ce', 6, 3, false, '#ffffc7', 8, 4),
     59: new chem.Element('Pr', 6, 3, false, '#d9ffc7', 8, 5),
     60: new chem.Element('Nd', 6, 3, false, '#c7ffc7', 8, 6),
     61: new chem.Element('Pm', 6, 3, false, '#a3ffc7', 8, 7),
     62: new chem.Element('Sm', 6, 3, false, '#8fffc7', 8, 8),
     63: new chem.Element('Eu', 6, 3, false, '#61ffc7', 8, 9),
     64: new chem.Element('Gd', 6, 3, false, '#45ffc7', 8,10),
     65: new chem.Element('Tb', 6, 3, false, '#30ffc7', 8,11),
     66: new chem.Element('Dy', 6, 3, false, '#1fffc7', 8,12),
     67: new chem.Element('Ho', 6, 3, false, '#00ff9c', 8,13),
     68: new chem.Element('Er', 6, 3, false, '#00e675', 8,14),
     69: new chem.Element('Tm', 6, 3, false, '#00d452', 8,15),
     70: new chem.Element('Yb', 6, 3, false, '#00bf38', 8,16),
     71: new chem.Element('Lu', 6, 3, false, '#00ab24', 8,17),
     72: new chem.Element('Hf', 6, 4, false, '#4dc2ff', 6, 4),
     73: new chem.Element('Ta', 6, 5, false, '#4da6ff', 6, 5),
     74: new chem.Element( 'W', 6, 6, false, '#2194d6', 6, 6),
     75: new chem.Element('Re', 6, 7, false, '#267dab', 6, 7),
     76: new chem.Element('Os', 6, 8, false, '#266696', 6, 8),
     77: new chem.Element('Ir', 6, 8, false, '#175487', 6, 9),
     78: new chem.Element('Pt', 6, 8, false, '#d1d1e0', 6,10),
     79: new chem.Element('Au', 6, 1, false, '#ffd124', 6,11),
     80: new chem.Element('Hg', 6, 2, false, '#b8b8d1', 6,12),
     81: new chem.Element('Tl', 6, 3, false, '#a6544d', 6,13),
     82: new chem.Element('Pb', 6, 4, false, '#575961', 6,14),
     83: new chem.Element('Bi', 6, 5, false, '#9e4fb5', 6,15),
     84: new chem.Element('Po', 6, 6, false, '#ab5c00', 6,16),
     85: new chem.Element('At', 6, 7, false, '#754f45', 6,17),
     86: new chem.Element('Rn', 6, 8, false, '#428296', 6,18),
     87: new chem.Element('Fr', 7, 1, false, '#420066', 7, 1),
     88: new chem.Element('Ra', 7, 2, false, '#007d00', 7, 2),
     89: new chem.Element('Ac', 7, 3, false, '#70abfa', 7, 3),
     90: new chem.Element('Th', 7, 3, false, '#00baff', 9, 4),
     91: new chem.Element('Pa', 7, 3, false, '#00a1ff', 9, 5),
     92: new chem.Element( 'U', 7, 3, false, '#008fff', 9, 6),
     93: new chem.Element('Np', 7, 3, false, '#0080ff', 9, 7),
     94: new chem.Element('Pu', 7, 3, false, '#006bff', 9, 8),
     95: new chem.Element('Am', 7, 3, false, '#545cf2', 9, 9),
     96: new chem.Element('Cm', 7, 3, false, '#785ce3', 9,10),
     97: new chem.Element('Bk', 7, 3, false, '#8a4fe3', 9,11),
     98: new chem.Element('Cf', 7, 3, false, '#a136d4', 9,12),
     99: new chem.Element('Es', 7, 3, false, '#b31fd4', 9,13),
    // TODO need to fix colors for the elements below
    100: new chem.Element('Fm', 7, 3, false, '#000000', 9,14),
    101: new chem.Element('Md', 7, 3, false, '#000000', 9,15),
    102: new chem.Element('No', 7, 3, false, '#000000', 9,16),
    103: new chem.Element('Lr', 7, 3, false, '#000000', 9,17),
    104: new chem.Element('Rf', 7, 4, false, '#4dc2ff', 7, 4),
    105: new chem.Element('Db', 7, 5, false, '#4da6ff', 7, 5),
    106: new chem.Element('Sg', 7, 6, false, '#2194d6', 7, 6),
    107: new chem.Element('Bh', 7, 7, false, '#267dab', 7, 7),
    108: new chem.Element('Hs', 7, 8, false, '#266696', 7, 8),
    109: new chem.Element('Mt', 7, 8, false, '#175487', 7, 9),
    110: new chem.Element('Ds', 7, 8, false, '#d1d1e0', 7,10),
    111: new chem.Element('Rg', 7, 1, false, '#ffd124', 7,11),
    112: new chem.Element('Cn', 7, 2, false, '#b8b8d1', 7,12)
});

chem.Element.labelMap = null;

chem.Element.getElementByLabel = function (label)
{
    if (!this.labelMap)
    {
        this.labelMap = {};
        this.elements.each(function(key, value){
            this.labelMap[value.label] = key-0;
        }, this);
    }
    if (!this.labelMap.hasOwnProperty(label))
        return null;
    return this.labelMap[label];
};
