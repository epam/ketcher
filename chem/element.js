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

if (!window.chem || !chem.Vec2)
    throw new Error("Vec2 should be defined first")

// element table and utilities
chem.Element = function (label, period, group, putHydrogenOnTheLeft, color)
{
    this.label = label;
    this.period = period;
    this.group = group;
    this.putHydrogenOnTheLeft = putHydrogenOnTheLeft;
    this.color = color || '#000000';
}

chem.Element.elements = new chem.Map({
      1: new chem.Element( 'H', 1, 1, false, '#000000'),
      2: new chem.Element('He', 1, 8, false, '#d9ffff'),
      3: new chem.Element('Li', 2, 1, false, '#cc80ff'),
      4: new chem.Element('Be', 2, 2, false, '#c2ff00'),
      5: new chem.Element( 'B', 2, 3, false, '#ffb5b5'),
      6: new chem.Element( 'C', 2, 4, false, '#000000'),
      7: new chem.Element( 'N', 2, 5, false, '#304ff7'),
      8: new chem.Element( 'O', 2, 6, true,  '#ff0d0d'),
      9: new chem.Element( 'F', 2, 7, true,  '#8fe04f'),
     10: new chem.Element('Ne', 2, 8, false, '#b3e3f5'),
     11: new chem.Element('Na', 3, 1, false, '#ab5cf2'),
     12: new chem.Element('Mg', 3, 2, false, '#8aff00'),
     13: new chem.Element('Al', 3, 3, false, '#bfa6a6'),
     14: new chem.Element('Si', 3, 4, false, '#f0c7a1'),
     15: new chem.Element( 'P', 3, 5, false, '#ff8000'),
     16: new chem.Element( 'S', 3, 6, true,  '#d9a61a'),
     17: new chem.Element('Cl', 3, 7, true,  '#1ff01f'),
     18: new chem.Element('Ar', 3, 8, false, '#80d1e3'),
     19: new chem.Element( 'K', 4, 1, false, '#8f40d4'),
     20: new chem.Element('Ca', 4, 2, false, '#3dff00'),
     21: new chem.Element('Sc', 4, 3, false, '#e6e6e6'),
     22: new chem.Element('Ti', 4, 4, false, '#bfc2c7'),
     23: new chem.Element( 'V', 4, 5, false, '#a6a6ab'),
     24: new chem.Element('Cr', 4, 6, false, '#8a99c7'),
     25: new chem.Element('Mn', 4, 7, false, '#9c7ac7'),
     26: new chem.Element('Fe', 4, 8, false, '#e06633'),
     27: new chem.Element('Co', 4, 8, false, '#f08fa1'),
     28: new chem.Element('Ni', 4, 8, false, '#4fd14f'),
     29: new chem.Element('Cu', 4, 1, false, '#c78033'),
     30: new chem.Element('Zn', 4, 2, false, '#7d80b0'),
     31: new chem.Element('Ga', 4, 3, false, '#c28f8f'),
     32: new chem.Element('Ge', 4, 4, false, '#668f8f'),
     33: new chem.Element('As', 4, 5, false, '#bd80e3'),
     34: new chem.Element('Se', 4, 6, true,  '#ffa100'),
     35: new chem.Element('Br', 4, 7, true,  '#a62929'),
     36: new chem.Element('Kr', 4, 8, false, '#5cb8d1'),
     37: new chem.Element('Rb', 5, 1, false, '#702eb0'),
     38: new chem.Element('Sr', 5, 2, false, '#00ff00'),
     39: new chem.Element( 'Y', 5, 3, false, '#94ffff'),
     40: new chem.Element('Zr', 5, 4, false, '#94e0e0'),
     41: new chem.Element('Nb', 5, 5, false, '#73c2c9'),
     42: new chem.Element('Mo', 5, 6, false, '#54b5b5'),
     43: new chem.Element('Tc', 5, 7, false, '#3b9e9e'),
     44: new chem.Element('Ru', 5, 8, false, '#248f8f'),
     45: new chem.Element('Rh', 5, 8, false, '#0a7d8c'),
     46: new chem.Element('Pd', 5, 8, false, '#006985'),
     47: new chem.Element('Ag', 5, 1, false, '#bfbfbf'),
     48: new chem.Element('Cd', 5, 2, false, '#ffd98f'),
     49: new chem.Element('In', 5, 3, false, '#a67573'),
     50: new chem.Element('Sn', 5, 4, false, '#668080'),
     51: new chem.Element('Sb', 5, 5, false, '#9e63b5'),
     52: new chem.Element('Te', 5, 6, false, '#d47a00'),
     53: new chem.Element( 'I', 5, 7, true,  '#940094'),
     54: new chem.Element('Xe', 5, 8, false, '#429eb0'),
     55: new chem.Element('Cs', 6, 1, false, '#57178f'),
     56: new chem.Element('Ba', 6, 2, false, '#00c900'),
     57: new chem.Element('La', 6, 3, false, '#70d4ff'),
     58: new chem.Element('Ce', 6, 3, false, '#ffffc7'),
     59: new chem.Element('Pr', 6, 3, false, '#d9ffc7'),
     60: new chem.Element('Nd', 6, 3, false, '#c7ffc7'),
     61: new chem.Element('Pm', 6, 3, false, '#a3ffc7'),
     62: new chem.Element('Sm', 6, 3, false, '#8fffc7'),
     63: new chem.Element('Eu', 6, 3, false, '#61ffc7'),
     64: new chem.Element('Gd', 6, 3, false, '#45ffc7'),
     65: new chem.Element('Tb', 6, 3, false, '#30ffc7'),
     66: new chem.Element('Dy', 6, 3, false, '#1fffc7'),
     67: new chem.Element('Ho', 6, 3, false, '#00ff9c'),
     68: new chem.Element('Er', 6, 3, false, '#00e675'),
     69: new chem.Element('Tm', 6, 3, false, '#00d452'),
     70: new chem.Element('Yb', 6, 3, false, '#00bf38'),
     71: new chem.Element('Lu', 6, 3, false, '#00ab24'),
     72: new chem.Element('Hf', 6, 4, false, '#4dc2ff'),
     73: new chem.Element('Ta', 6, 5, false, '#4da6ff'),
     74: new chem.Element( 'W', 6, 6, false, '#2194d6'),
     75: new chem.Element('Re', 6, 7, false, '#267dab'),
     76: new chem.Element('Os', 6, 8, false, '#266696'),
     77: new chem.Element('Ir', 6, 8, false, '#175487'),
     78: new chem.Element('Pt', 6, 8, false, '#d1d1e0'),
     79: new chem.Element('Au', 6, 1, false, '#ffd124'),
     80: new chem.Element('Hg', 6, 2, false, '#b8b8d1'),
     81: new chem.Element('Tl', 6, 3, false, '#a6544d'),
     82: new chem.Element('Pb', 6, 4, false, '#575961'),
     83: new chem.Element('Bi', 6, 5, false, '#9e4fb5'),
     84: new chem.Element('Po', 6, 6, false, '#ab5c00'),
     85: new chem.Element('At', 6, 7, false, '#754f45'),
     86: new chem.Element('Rn', 6, 8, false, '#428296'),
     87: new chem.Element('Fr', 7, 1, false, '#420066'),
     88: new chem.Element('Ra', 7, 2, false, '#007d00'),
     89: new chem.Element('Ac', 7, 3, false, '#70abfa'),
     90: new chem.Element('Th', 7, 3, false, '#00baff'),
     91: new chem.Element('Pa', 7, 3, false, '#00a1ff'),
     92: new chem.Element( 'U', 7, 3, false, '#008fff'),
     93: new chem.Element('Np', 7, 3, false, '#0080ff'),
     94: new chem.Element('Pu', 7, 3, false, '#006bff'),
     95: new chem.Element('Am', 7, 3, false, '#545cf2'),
     96: new chem.Element('Cm', 7, 3, false, '#785ce3'),
     97: new chem.Element('Bk', 7, 3, false, '#8a4fe3'),
     98: new chem.Element('Cf', 7, 3, false, '#a136d4'),
     99: new chem.Element('Es', 7, 3, false, '#b31fd4'),
    100: new chem.Element('Fm', 7, 3, false, '#000000'),
    101: new chem.Element('Md', 7, 3, false, '#000000'),
    102: new chem.Element('No', 7, 3, false, '#000000'),
    103: new chem.Element('Lr', 7, 3, false, '#000000')
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
}