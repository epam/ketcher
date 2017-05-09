import { h } from 'preact';
/** @jsx h */

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

function ActionButton({item, onAction, ...props}) {
	let act = acts[item];
	let shortcut = act.shortcut && shortcutStr(act.shortcut);
	return (
		<button
		  onClick={ev => onAction(act.action)}
		  title={shortcut ? `${act.title} (${shortcut})` :
		                    act.title}>
		  {act.title}
		</button>
	)
}

function ActionMenu({menu, className, role, ...props}) {
	return (
		<menu className={className} role={role}>
		{
		  menu.map(item => (
			  <li id={item.id || item}>
				{ typeof item != 'object' ?
					( <ActionButton item={item} {...props}/> ) :
						item.menu ?
				  ( <ActionMenu menu={item.menu} {...props}/> ) :
							item.component(props)
				}
			  </li>
		  ))
		}
		</menu>
	);
}

export default ActionMenu;
