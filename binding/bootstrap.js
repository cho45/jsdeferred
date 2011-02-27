var EXPORTED_SYMBOLS = ['Deferred'];
var window = {};
var location = { protocol: 'resource:' };
var document = { addEventListener : function() {} };
var timers = [];

function setTimeout (aCallback, aDelay) {
	var timer = Components.classes['@mozilla.org/timer;1']
					.createInstance(Components.interfaces.nsITimer);
	timer.initWithCallback(function() {
		timers.splice(timers.indexOf(timer), 1);
		aCallback();
	}, aDelay, timer.TYPE_ONE_SHOT);
	timers.push(timer);
	return timer;
}

function clearTimeout(aTimer) {
	timers.splice(aTimer.indexOf(timer), 1);
	aTimer.cancel();
}

function shutdown()
{
	timers.forEach(function(aTimer) {
		clearTimeout(aTimer);
	});
	delete exports.Deferred;
	setTimeout = void(0);
	clearTimeout = void(0);
	timers = void(0);
}

/*include JSDeferred*/

exports = {};
Deferred.define(exports);
