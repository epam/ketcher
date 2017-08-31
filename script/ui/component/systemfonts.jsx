import { h, Component } from 'preact';
import FontFaceObserver from "font-face-observer";
import Input from './input';
/** @jsx h */

const commonFonts = [
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
	const availableFontsPromises = commonFonts.map((fontName) => {
		const observer = new FontFaceObserver(fontName);
		return observer.check().then(() => fontName, () => null);
	});

	return Promise.all(availableFontsPromises);
}

let cache = null;

class SystemFonts extends Component {
	constructor(props) {
		super(props);
		this.state = { availableFonts: [subfontname(props.value)] };
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
		const {...props} = this.props;

		const desc = {
			enum: [],
			enumNames: []
		};

		this.state.availableFonts.forEach((font) => {
				desc.enum.push(`30px ${font}`);
				desc.enumNames.push(font);
		});

		return desc.enum.length !== 1
			? <Input schema={desc} {...props} />
			: <select><option>{desc.enumNames[0]}</option></select>;
	}
}

function subfontname(name) {
	return name.substring(name.indexOf('px ') + 3);
}

export default SystemFonts;
