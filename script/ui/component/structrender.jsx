import { h, Component } from 'preact';
/** @jsx h */

import Render from '../../render';

function renderTmpl(el, struct) {
	if (el) {
		if (struct.prerender)           // Should it sit here?
			el.innerHTML = struct.prerender;
		else {
			var rnd = new Render(el, 0, {
				'autoScale': true,
				'autoScaleMargin': 0,
				'maxBondLength': 30
			});
			rnd.setMolecule(struct);
			rnd.update();
			console.info('render!');//, el.innerHTML);
			//tmpl.prerender = el.innerHTML;
		}
	}
}

class StructRender extends Component {
	render ({ struct, xhref, Tag="div", ...props }) {
		console.info('xhref', xhref);
		return (
			xhref ?
			<Tag {...props}><img src={xhref}/></Tag> :
			<Tag ref={ el => renderTmpl(el, struct) } {...props}/>
		);
	}
}

export default StructRender;
