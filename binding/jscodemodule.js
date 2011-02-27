var EXPORTED_SYMBOLS = ['Deferred'];
var window = {};
var location = { protocol: 'resource:' };
var document = { addEventListener : function() {} };

function setTimeout (aCallback, aDelay) {
	var timer = Components.classes['@mozilla.org/timer;1']
					.createInstance(Components.interfaces.nsITimer);
	timer.initWithCallback(aCallback, aDelay, timer.TYPE_ONE_SHOT);
	return timer;
}

function clearTimeout(aTimer) {
	aTimer.cancel();
}

/*include JSDeferred*/
