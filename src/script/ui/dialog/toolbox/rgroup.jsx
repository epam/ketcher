/****************************************************************************
 * Copyright 2017 EPAM Systems
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

import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import Dialog from '../../component/dialog';
import Form, { Field } from '../../component/form/form';

const rgroupValues = Array.from(new Array(32), (val, index) => 'R' + ++index);

const rgroupSchema = {
	title: 'R-group',
	type: 'object',
	properties: {
		rgroupValues: {
			type: 'array',
			items: {
				type: 'string',
				enum: rgroupValues
			}
		}
	}
};

function RGroup({ disabledIds, rgroupValues, formState, ...props }) {
	console.log(props);
	return (
		<Dialog
			title="R-Group"
			className="rgroup"
			params={props}
			result={() => formState.result}
		>
			<Form schema={rgroupSchema} init={{ rgroupValues }} {...formState} >
				<Field
					name="rgroupValues"
					multiple
					component={ButtonList}
					disabledIds={disabledIds}
				/>
			</Form>
		</Dialog>
	);
}

function ButtonList({ value, onChange, schema, disabledIds }) {
	console.log("!!", value, onChange);
	return (
		<ul>
			{
				schema.items.enum.map((item, i) => {
					const invalidId = disabledIds.includes(i);

					let className = invalidId ? 'disabled' : '';
					if (className === '')
						className = value.includes(item) ? 'selected' : '';

					return (
						<li>
							<button
								className={className}
								onClick={() => (invalidId ? null : onChange(value.concat([item])))}
							>
								{item}
							</button>
						</li>
					);
				})
			}
		</ul>
	);
}

class RGroupFragment extends Component {
	constructor({ rgroupValues }) {
		super();
		this.state.label = rgroupValues || null;
	}
	onSelect(label) {
		this.setState({
			label: label !== this.state.label ? label : null
		});
	}
	selected(label) {
		return label === this.state.label;
	}
	result() {
		return { label: this.state.label };
	}
	render() {
		return (
			<RGroup
				selected={i => this.selected(i)}
				onSelect={i => this.onSelect(i)}
				result1={() => this.result()}
				{...this.props}
			/>
		);
	}
}

class RGroupAtom extends Component { // eslint-disable-line
	constructor({ rgroupValues }) {
		super();
		this.state.values = rgroupValues || [];
	}
	onSelect(index) {
		const { values } = this.state;
		const i = values.indexOf(index);
		if (i < 0)
			values.push(index);
		else
			values.splice(i, 1);
		this.setState({ values });
	}
	selected(index) {
		return this.state.values.includes(index);
	}
	result() {
		return {
			type: 'rlabel',
			values: this.state.values
		};
	}
	render() {
		return (
			<RGroup
				selected={i => this.selected(i)}
				onSelect={i => this.onSelect(i)}
				result1={() => this.result()}
				{...this.props}
			/>
		);
	}
}

export default connect(
	store => ({ formState: store.modal.form })
)(RGroup);
