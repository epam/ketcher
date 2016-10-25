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

class SystemFonts extends Component {
	constructor(props) {
		super(props);
		this.state = { availableFonts: [] };
		let observer, tmp;

		commonFonts.forEach((fontName) => {
			observer = new FontFaceObserver(fontName);
			observer.check().then(() => {
				tmp = this.state.availableFonts;
				tmp.push(fontName);
				this.setState({ availableFonts: tmp })
			});
		});
	}
	render() {
		let {...props} = this.props;
		let content = this.state.availableFonts.map((fontName) =>
			<option value={fontName}>{fontName}</option>);
		return (
			<select {...props}>
				{content}
			</select>
		);
	}
}

export default SystemFonts;
