import { h } from 'preact';
import { without } from 'lodash/fp';

function oneOrMore(multipl, invalidId, values, item) {
	if (invalidId) return null;
	if (!multipl && values.includes(item)) return without([item], values);
	else if (!multipl && !values.includes(item)) return values.concat([item]);
	values = [];
	return values.concat([item]);
}

function ButtonList({ value, onChange, schema, disabledIds, multiple }) {
	return (
		<ul>
			{
				schema.items.enum.map((item, i) => {
					const invalidId = disabledIds.includes(item);
					let className = invalidId ? 'disabled' : '';
					if (className === '')
						className = value.includes(item) ? 'selected' : '';
					return (
						<li>
							<button
								type="button"
								className={className}
								onClick={() => (invalidId
									? null
									: onChange(oneOrMore(multiple, invalidId, value, item)))}
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

