import app from './app';

function init(opts, apiServer) {
	const ketcherWindow = document.querySelector('[role=application]') || document.body;
	return app(ketcherWindow, opts, apiServer);
}

export default init;
