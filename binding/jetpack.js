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

Deferred.postie = function (target, opts) {
	var ret;
	var id  = 0;
	var cb  = {};
	var mm  = [];
	var contentScript;

	var messageListener = function (message) {
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

	if (typeof target == 'function') { // it is a constructor.
		let onMessage = opts.onMessage;
		contentScript = opts.contentScript;

		opts.onMessage = messageListener;
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

		ret = target(opts);
	}
	else {
		target.on('message', messageListener);
		ret = target;
	}

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

	if (contentScript) ret.post(contentScript).error(function (e) { console.log(e) });

	return ret;
};

exports.Deferred = Deferred;

exports.__defineGetter__('Item', function() {
	delete this.Item;
	var Item = require('context-menu').Item;
	return this.Item = function(options) {
		return Deferred.postie(Item, options);
	};
});

exports.__defineGetter__('PageMod', function() {
	delete this.PageMod;
	var PageMod = require('page-mod').PageMod;
	return this.PageMod = function(options) {
		var deferred = new Deferred();
		var wrappedOptions = {};
		for (let i in options) { wrappedOptions[i] = options[i]; }
		wrappedOptions.onAttach = function(worker) {
			deferred.call(Deferred.postie(worker));
		};
		var instance = Deferred.postie(PageMod, wrappedOptions);
		deferred.destroy = function() {
			instance.destroy.apply(instance, arguments);
		};
		deferred.__defineGetter__('include', function() {
			return instance.include;
		});
		return deferred
				.next(function(worker) {
					if (options.onAttach)
						options.onAttach(worker);
					return worker;
				});
	};
});

exports.__defineGetter__('Page', function() {
	delete this.Page;
	var Page = require('page-worker').Page;
	return this.Page = function(options) {
		return Deferred.postie(Page, options);
	};
});

exports.__defineGetter__('Panel', function() {
	delete this.Panel;
	var Panel = require('panel').Panel;
	return this.Panel = function(options) {
		return Deferred.postie(Panel, options);
	};
});

exports.__defineGetter__('Request', function() {
	delete this.Request;
	var Request = require('request').Request;
	return this.Request = function(options) {
		var deferred;
		var wrappedOptions = {};
		for (let i in options) { wrappedOptions[i] = options[i]; }
		wrappedOptions.onComplete = function(response) {
			deferred.call(response);
		};
		var request = Request(wrappedOptions);
		var originalGet = request.get;
		request.get = function() {
			deferred = new Deferred();
			originalGet.apply(request, arguments);
			return deferred
					.next(function(response) {
						if (options.onComplete)
							options.onComplete(response);
						return response;
					});
		};
		var originalPost = request.post;
		request.post = function() {
			deferred = new Deferred();
			originalPost.apply(request, arguments);
			return deferred
					.next(function(response) {
						if (options.onComplete)
							options.onComplete(response);
						return response;
					});
		};
		return request;
	};
});

exports.__defineGetter__('Widget', function() {
	delete this.Widget;
	var Widget = require('widget').Widget;
	return this.Widget = function(options) {
		return Deferred.postie(Widget, options);
	};
});
