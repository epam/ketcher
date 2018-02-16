import { h } from 'preact';
import { xor } from 'lodash/fp';

function oneOrMore(multipl, values, item) {
	if (multipl) return xor(values, [item]);
	return xor(values, values.concat([item]));
}

function ButtonList({ value, onChange, schema, disabledIds, multiple }) {
	let className;
	return (
		<ul>
			{
				schema.items.enum.map((item, i) => {
					className = value.includes(item) ? 'selected' : '';
					return (
						<li>
							<button
								disabled={disabledIds.includes(item)}
								type="button"
								className={className}
								onClick={() => (onChange(oneOrMore(multiple, value, item)))}
							>
								{schema.items.enumNames[i]}
							</button>
						</li>
					);
				})
			}
		</ul>
	);
}

export default ButtonList;

