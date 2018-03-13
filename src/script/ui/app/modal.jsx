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

import { h } from 'preact';
import { omit } from 'lodash/fp';
import { connect } from 'preact-redux';
import modals from '../dialog';

const mapStateToProps = state => ({
	modal: state.modal
});

const mapDispatchToProps = dispatch => ({
	onOk: (res) => {
		console.info('Output:', res);
		dispatch({ type: 'MODAL_CLOSE' });
	},
	onCancel: () => {
		dispatch({ type: 'MODAL_CLOSE' });
	}
});

const mergeProps = (stateProps, dispatchProps) => {
	const prop = stateProps.modal && stateProps.modal.prop;
	const initProps = prop ? omit(['onResult', 'onCancel'], prop) : {};
	return {
		modal: stateProps.modal,
		...initProps,
		onOk: (res) => {
			if (prop && prop.onResult) prop.onResult(res);
			dispatchProps.onOk(res);
		},
		onCancel: () => {
			if (prop && prop.onCancel) prop.onCancel();
			dispatchProps.onCancel();
		}
	};
};

const AppModal = connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)(({ modal, ...props }) => {
	if (!modal)
		return null;

	const Modal = modals[modal.name];

	if (!Modal)
		throw new Error(`There is no modal window named ${modal.name}`);

	return (
		<div className="ket-overlay">
			<Modal {...props} />
		</div>
	);
});

export default AppModal;
