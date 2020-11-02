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
import { connect } from 'preact-redux';

import Dialog from '../../component/dialog';

function About(props) {
	const indigoInfo = props.indigoVersion && props.indigoVersion.split('.r'); // Indigo version and build info

	return (
		<Dialog
			title="About"
			className="about"
			params={props}
			buttons={['Close']}
		>
			<a href="http://lifescience.opensource.epam.com/ketcher/" target="_blank">
				<img alt="Ketcher" src="logo/ketcher-logo.svg" />
			</a>
			<dl>
				<dt>
					<a href="http://lifescience.opensource.epam.com/ketcher/help.html" target="_blank">Ketcher</a>
				</dt>
				<dd>
					version
					<var>{props.version}</var>
				</dd>
				{
					props.buildNumber ? (
						<dd>
							build #
							<var>{props.buildNumber}</var>
							{' at '}
							<time>{props.buildDate}</time>
						</dd>) : null
				}
				{
					props.indigoVersion ? (
						<div>
							<dt>
								<a href="http://lifescience.opensource.epam.com/indigo/" target="_blank">Indigo
									Toolkit
								</a>
							</dt>
							<dd>
								version
								<var>{indigoInfo[0]}</var>
							</dd>
							<dd>
								build #
								<var>{indigoInfo[1]}</var>
							</dd>
						</div>
					) : (<dd>standalone</dd>)
				}
				<dt>
					<a href="http://lifescience.opensource.epam.com/" target="_blank">EPAM Life Sciences</a>
				</dt>
				<dd>
					<a href="http://lifescience.opensource.epam.com/ketcher/#feedback" target="_blank">Feedback</a>
				</dd>
			</dl>
		</Dialog>
	);
}

export default connect(
	store => ({ ...store.options.app })
)(About);
