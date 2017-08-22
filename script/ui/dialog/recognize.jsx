import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { changeImage, shouldFragment } from '../state/options';
import { load } from '../state';
import { recognize } from '../state/server';
import Dialog from '../component/dialog';
import Input from '../component/input';
import StructRender from '../component/structrender';
import Spin from '../component/spin';

function Recognize(prop) {
	let {file, structStr, fragment, onRecognize, isFragment, onImage, ...props} = prop;

	const result = () =>
		structStr && !(structStr instanceof Promise) ? {structStr, fragment} : null;

	return (
		<Dialog title="Import From Image" className="recognize"
				params={props} result={() => result(structStr, fragment) }
				buttons={[
					(
						<label className="open">
							Choose file…
							<input type="file" onChange={ (ev) => onImage(ev.target.files[0]) }
								   accept="image/*"/>
						</label>
					),
					<span className="open-filename">{file ? file.name : null}</span>,
					file && !structStr ? (
						<button onClick={() => onRecognize(file) }>Recognize</button>
					) : null,
					"Cancel",
					"OK"
				]}>
			<div className="picture">
				{
					file ? (
						<img id="pic" src={url(file) || ""}
							 onError={() => {
								 onImage(null);
								 alert("Error, it isn't a picture");
							 }}/>
					) : null
				}
			</div>
			<div className="output">
				{
					structStr ? (
						structStr instanceof Promise ?
							( <Spin/> ) :
							( <StructRender className="struct" struct={structStr}/> )
					) : null
				}
			</div>
			<label>
				<Input type="checkbox" value={fragment} onChange={v => isFragment(v)}/>
				Load as a fragment
			</label>
		</Dialog>
	);
}

function url(file) {
	if (!file) return null;
	var URL = window.URL || window.webkitURL;
	return URL ? URL.createObjectURL(file) : "No preview";
}

export default connect(
	store => ({
		file: store.options.recognize.file,
		structStr: store.options.recognize.structStr,
		fragment: store.options.recognize.fragment
	}),
	(dispatch, props) => ({
		isFragment: (v) => dispatch(shouldFragment(v)),
		onImage: (file) => dispatch(changeImage(file)),
		onRecognize: (file) => dispatch(recognize(file)),
		onOk: (res) => {
			dispatch(
				load(res.structStr, {
					rescale: true,
					fragment: res.fragment
				})
			);
			props.onOk(res);
		}
	})
)(Recognize);
