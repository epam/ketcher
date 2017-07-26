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
