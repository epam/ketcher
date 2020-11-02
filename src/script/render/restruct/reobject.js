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

import Visel from './visel';
import scale from '../../util/scale';

function ReObject() {
}

ReObject.prototype.init = function (viselType) {
	this.visel = new Visel(viselType);

	this.highlight = false;
	this.highlighting = null;
	this.selected = false;
	this.selectionPlate = null;
};

// returns the bounding box of a ReObject in the object coordinates
ReObject.prototype.getVBoxObj = function (render) {
	var vbox = this.visel.boundingBox;
	if (vbox === null)
		return null;
	if (render.options.offset)
		vbox = vbox.translate(render.options.offset.negated());
	return vbox.transform(scale.scaled2obj, render.options);
};

ReObject.prototype.setHighlight = function (highLight, render) { // TODO render should be field
	if (highLight) {
		let noredraw = 'highlighting' in this && this.highlighting !== null;// && !this.highlighting.removed;
		if (noredraw) {
			if (this.highlighting.type === 'set') {
				if (!this.highlighting[0]) return;
				noredraw = !this.highlighting[0].removed;
			} else { noredraw = !this.highlighting.removed; }
		}
		if (noredraw) {
			this.highlighting.show();
		} else {
			render.paper.setStart();
			this.drawHighlight(render);
			this.highlighting = render.paper.setFinish();
		}
	} else if (this.highlighting) {
		this.highlighting.hide();
	}

	this.highlight = highLight;
};

ReObject.prototype.drawHighlight = function () {
	console.assert('ReObject.drawHighlight is not overridden'); // eslint-disable-line no-console
};

ReObject.prototype.makeSelectionPlate = function () {
	console.assert(null, 'ReObject.makeSelectionPlate is not overridden'); // eslint-disable-line no-console
};

export default ReObject;
