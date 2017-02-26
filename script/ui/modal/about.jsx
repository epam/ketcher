import { h, render } from 'preact';
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

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<About {...params}/>
	), overlay);
};
