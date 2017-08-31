import { h } from 'preact';
/** @jsx h */

function SelectList({ schema, value, onSelect, splitIndexes, ...props }) {
	return (
		<ul {...props}>{
			schema.enum.map((opt, index) => (
				<li onClick={() => onSelect(opt, index) }
					className={
						(opt === value ? 'selected ' : '') +
						(isSplitIndex(index, splitIndexes) ? 'split' : '')
					}>
					{schema.enumNames ? schema.enumNames[index] : opt}
				</li>
			))
		}</ul>
	);
}

function isSplitIndex(index, splitIndexes) {
	return index > 0 && splitIndexes && splitIndexes.includes(index);
}

export default SelectList;
