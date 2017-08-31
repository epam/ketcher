import templates from '../data/templates';

const templateLib = {
	"template-lib": {
		shortcut: "Shift+t",
		title: "Custom Templates",
		action: { dialog: 'templates' },
		disabled: (editor, server, options) => !options.app.templates
	}
};

export default templates.reduce((res, struct, i) => {
	res[`template-${i}`] = {
		title: `${struct.name}`,
		shortcut: 't',
		action: {
			tool: 'template',
			opts: { struct }
		}
	};
	return res;
}, templateLib);

