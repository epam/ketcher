import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import Tabs from '../component/tabs';
import { Form, Field } from '../component/form';

const checkSchema = {
	title: 'Check',
	type: 'object',
	properties: {
		valence: {
			title: 'Valence',
			type: 'boolean'
		},
		radicals: {
			title: 'Radical',
			type: 'boolean'
		},
		pseudoatoms: {
			title: 'Pseudoatom',
			type: 'boolean'
		},
		stereo: {
			title: 'Stereochemistry',
			type: 'boolean'
		},
		query: {
			title: 'Query',
			type: 'boolean'
		},
		overlapping_atoms: {
			title: 'Overlapping Atoms',
			type: 'boolean'
		},
		overlapping_bonds: {
			title: 'Overlapping Bonds',
			type: 'boolean'
		},
		rgroups: {
			title: 'R-Groups',
			type: 'boolean'
		},
		chiral: {
			title: 'Chirality',
			type: 'boolean'
		},
		'3d': {
			title: '3D Structure',
			type: 'boolean'
		}
	}
};

class Check extends Component {
	constructor(props) {
		super(props);

		this.state = {
			moleculeErrors: {}
		};

		this.checkOptsTypes = Object.keys(checkSchema.properties);

		this.initState = this.checkOptsTypes.reduce((acc, key) => {
			acc[key] = true;
			return acc;
		}, {});

		this.checkMolecule(this.checkOptsTypes);
	}

	checkMolecule(optsTypes) {
		this.props.check({ 'types': optsTypes })
			.then(res => {
				this.setState({
					moleculeErrors: Object.assign(this.state.moleculeErrors, res)
				});
			})
			.catch(console.error);
	}

	onCheck(optType, value) {
		if (!value) {
			const moleculeErrors = this.state.moleculeErrors;
			delete moleculeErrors[optType];
			this.setState({ moleculeErrors: moleculeErrors });
			return;
		}

		this.checkMolecule([optType]);
	};

	render(props) {
		var tabs = ['Check', 'Settings'];

		const moleculeErrorsTypes = Object.keys(this.state.moleculeErrors);

		const checkOptTitle = key => checkSchema.properties[key].title;

		return (
			<Form component={Dialog} title="Structure Check" className="check" params={props}
				  schema={checkSchema} init={this.initState}
			>
				<Tabs className="tabs" captions={tabs}>
					<dl className="result">{
						moleculeErrorsTypes.length === 0 ?
							<li>
								<div className="error-name">No errors found</div>
							</li> :
							moleculeErrorsTypes.map(type => (
								<div>
									{/* A wrapper for react */}
									<dt>{checkOptTitle(type)} error :</dt>
									<dd>{this.state.moleculeErrors[type]}</dd>
								</div>
							))
					}</dl>
					<ul className="settings">{
						this.checkOptsTypes.map(optType => (
							<li>
								<Field title={checkOptTitle(optType)} name={optType}
									   onChange={value => this.onCheck(optType, value)}
								/>
							</li>
						))
					}</ul>
				</Tabs>
			</Form>
		);
	}
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Check {...params}/>
	), overlay);
};
