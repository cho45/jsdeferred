var EXPORTED_SYMBOLS = ['Deferred'];
var timers = [];

function setTimeout(aCallback, aDelay) {
	if (aDelay) {
		let timer = Components.classes['@mozilla.org/timer;1']
						.createInstance(Components.interfaces.nsITimer);
		timer.initWithCallback(aCallback, aDelay, timer.TYPE_ONE_SHOT);
		timers.push(timer);
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
		timers.push(request);
		return request;
	}
}

function clearTimeout(aTimer) {
	timers.splice(aTimer.indexOf(timer), 1);
	if (aTimer instanceof Components.interfaces.nsITimer)
		aTimer.cancel();
	else
		aTimer.abort();
}

function shutdown()
{
	timers.forEach(clearTimeout);
	setTimeout = void(0);
	clearTimeout = void(0);
	timers = void(0);
}

/*include JSDeferred*/

exports = {};
Deferred.define(exports);
