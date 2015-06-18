/*global require, global:false*/

require('./actions');
require('./keys');
require('./server');
require('./ui');
require('./dialog/crap');
require('./dialog/io');
require('./dialog/selectdialog');
require('./dialog/sgroup');
require('./dialog/template-custom');

global.ui = global.ui || {};
