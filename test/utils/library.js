/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

const fs = require('fs');
const path = require('path');

const xpath = require('xpath');
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

let libStr = fs.readFileSync(path.join(__dirname, '../fixtures/fixtures.svg')).toString();
let library = new DOMParser().parseFromString(libStr);

function libSymbol(sampleName) {
	let xsym = xpath.evaluate(`//*[@id='${sampleName}']`, library, // ids with '/' are absolutely valid, see https://epa.ms/SGNMm
		null, xpath.XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	let symbol = xsym.singleNodeValue;
	return new XMLSerializer().serializeToString(symbol);
}

module.exports = libSymbol;
