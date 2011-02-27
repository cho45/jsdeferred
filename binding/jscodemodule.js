var EXPORTED_SYMBOLS = ['Deferred'];

function setTimeout(aCallback, aDelay) {
	if (aDelay) {
		let timer = Components.classes['@mozilla.org/timer;1']
						.createInstance(Components.interfaces.nsITimer);
		timer.initWithCallback(aCallback, aDelay, timer.TYPE_ONE_SHOT);
		return timer;
	}
	else {
		let uri = 'data:image/png,' + Math.random();
		let request = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1']
					.createInstance(Components.interfaces.nsIXMLHttpRequest)
					.QueryInterface(Components.interfaces.nsIDOMEventTarget);
		let handler = function() {
				request.removeEventListener('readystatechange', handler, false);
				request.removeEventListener('error', handler, false);
				aCallback();
			};
		request.open('GET', uri, true);
		request.addEventListener('readystatechange', handler, false);
		request.addEventListener('error', handler, false);
		request.send(null);
		return request;
	}
}

function clearTimeout(aTimer) {
	if (aTimer instanceof Components.interfaces.nsITimer)
		aTimer.cancel();
	else
		aTimer.abort();
}

/*include JSDeferred*/
