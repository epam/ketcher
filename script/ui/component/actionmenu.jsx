import { h } from 'preact';
/** @jsx h */
import classNames from 'classnames';

import acts from '../acts';

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
				onClick={() => onAction(action.action)}
		  title={shortcut ? `${action.title} (${shortcut})` :
		                    action.title}>
		  {action.title}
		</button>
	)
}

function ActionMenu({menu, className, role, ...props}) {
	return (
		<menu className={className} role={role}>
		{
		  menu.map(item => (
			  <li id={item.id || item} className={classNames(props.status[item])}>
				{ typeof item != 'object' ?
					( <ActionButton {...props} action={acts[item]}
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

export default ActionMenu;
