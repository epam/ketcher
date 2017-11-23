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

import { range } from 'lodash/fp';

import { h, Component } from 'preact';

import Dialog from '../component/dialog';

function RGroup({ selected, onSelect, result, disabledIds, ...props }) {
	return (
		<Dialog
			title="R-Group"
			className="rgroup"
			params={props}
			result={() => result()}
		>
			<ul>
				{
					range(1, 33).map((i) => {
						const invalidId = disabledIds.includes(i);

						let className = invalidId ? 'disabled' : '';
						if (className === '')
							className = selected(i) ? 'selected' : '';

						return (
							<li>
								<button
									className={className}
									onClick={() => (invalidId ? null : onSelect(i))}
								>
									{`R${i}`}
								</button>
							</li>
						);
					})
				}
			</ul>
		</Dialog>
	);
}

class RGroupFragment extends Component {
	constructor({ label }) {
		super();
		this.state.label = label || null;
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
				result={() => this.result()}
				{...this.props}
			/>
		);
	}
}

class RGroupAtom extends Component { // eslint-disable-line
	constructor({ values }) {
		super();
		this.state.values = values || [];
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
				result={() => this.result()}
				{...this.props}
			/>
		);
	}
}

export default params => (params.type === 'rlabel' ? (<RGroupAtom {...params} />) : (<RGroupFragment {...params} />));
