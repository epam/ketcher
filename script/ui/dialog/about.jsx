/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import Dialog from '../component/dialog';

function About(props) {
	return (
		<Dialog title="About"
				className="about" params={props}
				buttons={["Close"]}>
			<a href="http://lifescience.opensource.epam.com/ketcher/" target="_blank">
				<img src="logo.jpg"/>
			</a>
			<dl>
				<dt>
					<a href="http://lifescience.opensource.epam.com/ketcher/help.html" target="_blank">Ketcher</a>
				</dt>
				<dd>
					version <var>{props.version}</var>
				</dd>
				{ props.buildNumber ? (
					<dd>
						build #<var>{props.buildNumber}</var>
						{ " at " }
						<time>{props.buildDate}</time>
					</dd> ) : null
				}
				{ props.indigoVersion ? (
				<div><dt>
				<a href="http://lifescience.opensource.epam.com/indigo/" target="_blank">Indigo Toolkit</a>
				</dt>
					<dd>version <var>{props.indigoVersion}</var></dd></div>
				) : (
				 <dd>standalone</dd>
				 )
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
