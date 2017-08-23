import { h } from 'preact';
/** @jsx h */
import classNames from 'classnames';

import action from '../action';

const isMac = /Mac/.test(navigator.platform);
const shortcutAliasMap = {
	'Escape': 'Esc',
	'Delete': 'Del',
	'Mod': isMac ? '⌘' : 'Ctrl'
};

export function shortcutStr(shortcut) {
	var key = Array.isArray(shortcut) ? shortcut[0] : shortcut;
	return key.replace(/(\b[a-z]\b$|Mod|Escape|Delete)/g, function (key) {
		return shortcutAliasMap[key] || key.toUpperCase();
	});
}

function ActionButton({action, status={}, onAction, ...props}) {
	let shortcut = action.shortcut && shortcutStr(action.shortcut);
	return (
		<button disabled={status.disabled}
				onClick={(ev) => {
					if (!status.selected) {
						onAction(action.action);
						props.onOpen(null);
						ev.stopPropagation();
					}
				}}
				title={shortcut ? `${action.title} (${shortcut})` :	action.title}>
			{action.title}
		</button>
	)
}

function ActionMenu({menu, className, role, ...props}) {
	return (
		<menu className={className} role={role}>
		{
		  menu.map(item => (
			  <li id={item.id || item}
				  className={classNames(props.status[item]) + ` ${item.id === props.opened ? 'opened' : ''}`}
				  onClick={(ev) => openHandle(ev, props.onOpen) }>
				{ typeof item !== 'object' ?
					( <ActionButton {...props} action={action[item]}
									status={props.status[item]} /> ) :
						item.menu ?
				  ( <ActionMenu {...props} menu={item.menu} /> ) :
							item.component(props)
				}
			  </li>
		  ))
		}
		</menu>
	);
}

function openHandle(event, onOpen) {
	let target = event.currentTarget;
	if (!target) return event.stopPropagation();

	if (window.getComputedStyle(target).overflow !== 'hidden') return;

	onOpen(target.id);
	event.stopPropagation();
}

export default ActionMenu;
