var EXPORTED_SYMBOLS = ["Deferred"];
var timers = [];

function setTimeout (f, i) {
	if (i) {
		let timer = Components.classes["@mozilla.org/timer;1"]
						.createInstance(Components.interfaces.nsITimer);
		timer.initWithCallback(f, i, timer.TYPE_ONE_SHOT);
		timers.push(timer);
		return timer;
	}
	else {
		let request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
					.createInstance(Components.interfaces.nsIXMLHttpRequest)
					.QueryInterface(Components.interfaces.nsIDOMEventTarget);
		let handler = function(e) {
				if (request.readyState < 2) return;
				request.removeEventListener("readystatechange", handler, false);
				f();
			};
		request.open("GET", "data:,", true);
		request.addEventListener("readystatechange", handler, false);
		request.send(null);
		timers.push(request);
		return request;
	}
}

function clearTimeout (timer) {
	timers.splice(timers.indexOf(timer), 1);
	if (timer instanceof Components.interfaces.nsITimer)
		timer.cancel();
	else
		timer.abort();
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
