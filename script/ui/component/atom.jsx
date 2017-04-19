import { h } from 'preact';
/** @jsx h */
import element from '../../chem/element';

const metPrefix = ['alkali', 'alkaline-earth', 'transition',
				   'post-transition']; // 'lanthanide', 'actinide'

function atomClass(el) {
	let own = `atom-${el.label.toLowerCase()}`;
	let type = metPrefix.indexOf(el.type) >= 0 ? `${el.type} metal` :
		(el.type || 'unknown-props');
	return [own, type, el.state || 'unknown-state', el.origin];
}

function Atom({el, shortcut, className, ...props}) {
	return (
		<button title={shortcut ? `${el.title} (${shortcut})` : el.title}
				className={[...atomClass(el), className].join(' ')}
				value={element.map[el.label]} {...props}>
		  {el.label}
		</button>
	);
}

export default Atom;
