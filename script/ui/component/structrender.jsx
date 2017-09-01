/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { h, Component } from 'preact';
/** @jsx h */

import Struct from '../../chem/struct';
import molfile from '../../chem/molfile';
import Render from '../../render';

function renderStruct(el, struct, options={}) {
	if (el) {
		if (struct.prerender)           // Should it sit here?
			el.innerHTML = struct.prerender;
		else {
			console.info('render!', el.clientWidth, el.clientWidth);
			const rnd = new Render(el, {
				autoScale: true,
				...options
			});
			rnd.setMolecule(struct);
			rnd.update();
			// console.info('render!');//, el.innerHTML);
			// struct.prerender = el.innerHTML;
		}
	}
}

class StructRender extends Component {
	constructor(props) {
		super(props);
		if (!(props.struct instanceof Struct)) try {
			this.props.struct = molfile.parse(props.struct);
		} catch (e) {
			alert("Could not parse structure\n" + e);
			this.props.struct = null;
		}
	}

	shouldComponentUpdate() {
		return false;
	}

	componentDidMount() {
		const el = this.refs ? this.refs.base : this.base;
		const { struct, options } = this.props;
		renderStruct(el, struct, options);
	}

	render () {
		let { struct, Tag="div", ...props } = this.props;
		return (
			<Tag /*ref="el"*/ {...props}>{ struct ? null :  'No molecule' }</Tag>
		);
	}
}

export default StructRender;
