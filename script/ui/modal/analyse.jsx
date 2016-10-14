import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';

class Analyse extends Component {
	render () {
		return (
			<Dialog caption="Calculated Values"
					name="analyse" params={this.props}
					buttons={["Cancel"]}>
				<ul>{[
						{ name: 'Chemical Formula', key: 'gross' },
						{ name: 'Molecular Weight', key: 'molecular-weight' },
						{ name: 'Exact Mass', key: 'monoisotopic-mass' },
						{ name: 'Elemental Analysis', key: 'mass-composition' }
						].map(v => (
							<label>{v.name}<output>{this.props[v.key]}</output></label>
						))
					}</ul>
			</Dialog>
		);
	}
}


export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Analyse {...params}/>
	), overlay);
};
