/*global require */

require('./ui');
require('./dialog/crap');
require('./dialog/io');
require('./dialog/selectdialog');
require('./dialog/sgroup');
require('./dialog/template-custom');

var Action = require('./actions');
global.ui = global.ui || {}; // jshint ignore:line
global.ui.Action = Action;
