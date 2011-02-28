/*
 * Usage:
 *  const Deferred = require("jsdeferred").Deferred;
 *  Deferred.define(this);
 */

function D () {
/*include JSDeferred*/

Deferred.Deferred = Deferred;
return Deferred;
}

const Deferred = D();

const {Cc,Ci,components} = require("chrome");
var {setTimeout,clearTimeout} = require("timer");

Deferred.postie = function (constructor, opts) {
	var ret;
	var id  = 0;
	var cb  = {};
	var mm  = [];
	var onMessage = opts.onMessage;
	var contentScript = opts.contentScript;

	opts.onMessage = function (message) {
		if (message.init) {
			for (var i = 0, it; it = mm[i]; i++) {
				ret.postMessage(it);
			}
			mm = null;
			return;
		} else  {
			var c = cb[message.id];
			if (c) {
				c(message.value, message.error);
				return;
			}
		}
		onMessage.apply(this, arguments);
	};

	opts.contentScriptWhen = "ready";
	opts.contentScript = [
		'Deferred = ' + D.toSource() + '();Deferred.define(this);',
		(function () {
			on('message', function (message) {
				next(function () {
					return eval(message.code);
				}).
				next(function (v) {
					postMessage({ id : message.id, value : v });
				}).
				error(function (e) {
					postMessage({ id : message.id, error : e });
				});
			});
			postMessage({ id : -1, init : true });
		}).toSource() + '()'
	];

	ret = constructor(opts);

	ret.post = function (args, code) {
		var deferred = new Deferred();
		args = Array.prototype.slice.call(arguments, 0);
		code = args.pop();

		code = (typeof code == 'function') ? code.toSource() : 'function () {' + code + '}';
		
		var mes = {
			id : id++,
			code : '(' + code + ').apply(null, ' + JSON.stringify(args) + ')'
		};

		cb[mes.id] = function (v, e) { e ? deferred.fail(e) : deferred.call(v) };

		if (mm) {
			mm.push(mes);
		} else {
			this.postMessage(mes);
		}

		return deferred;
	};

	ret.bind = function (selector, event, callback) {
		return ret.post(selector, event, function (selector, event) {
			var deferred = new Deferred();
			var nodes = document.querySelectorAll(selector);
			for (var i = 0, it; it = nodes[i]; i++) {
				it.addEventListener(event, function (e) {
					deferred.call(e);
				}, false);
			}
			return deferred;
		}).
		next(callback);
	};

	if (contentScript) ret.post(contentScript).error(function (e) { console.log(e) });

	return ret;
};

exports.Deferred = Deferred;
