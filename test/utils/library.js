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
