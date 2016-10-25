import { h, Component } from 'preact';
import FontFaceObserver from "font-face-observer";
/** @jsx h */

let commonFonts = [
	"Arial",
	"Arial Black",
	"Comic Sans MS",
	"Courier New",
	"Georgia",
	"Impact", "Charcoal",
	"Lucida Console", "Monaco",
	"Palatino Linotype", "Book Antiqua", "Palatino",
	"Tahoma", "Geneva",
	"Times New Roman", "Times",
	"Verdana",
	"Symbol",
	"MS Serif", "MS Sans Serif", "New York",
	"Droid Sans", "Droid Serif", "Droid Sans Mono", "Roboto"
];

function checkInSystem() {
	let availableFontsPromises = commonFonts.map((fontName) => {
		let observer = new FontFaceObserver(fontName);
		return observer.check().then(() => fontName, () => null);
	});
	return Promise.all(availableFontsPromises);
}

let cache = null;

class SystemFonts extends Component {
	constructor(props) {
		super(props);
		this.state = { availableFonts: [] };
		this.setAvailableFonts();
	}
	setAvailableFonts() {
		cache ? this.setState({ availableFonts: cache }) :
			checkInSystem().then((results) => {
				cache = results.filter((i) => i !== null);
				this.setState({ availableFonts: cache });
			});
	}
	render() {
		let {current, ...props} = this.props;
		let content = this.state.availableFonts.map((fontName) =>
			fontName == current ? <option value={fontName} selected>{fontName}</option> :
					<option value={fontName}>{fontName}</option>);
		return (
			<select {...props}>
				{content}
			</select>
		);
	}
}

export default SystemFonts;
