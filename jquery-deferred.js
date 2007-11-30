/*
 * jQuery Deferred
 * Copyring (c) 2007 cho45 ( www.lowreal.net )
 *
 * License:: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function ($) {
/***

Usage:

$.deferred.export();

$.get("/hoge").next(function (data) {
	alert(data);
}).

parallel([$.get("foo.html"), $.get("bar.html")]).next(function (values) {
	log($.map(values, function (v) { return v.length }));
	if (values[1].match(/nextUrl:\s*([^\s]+)/)) {
		return $.get(RegExp.$1).next(function (d) {
			return d;
		});
	}
}).
next(function (d) {
	log(d.length)
});

*/

function Deferred () {
	if (this instanceof Deferred) {
		this.init.apply(this);
	} else {
		return new Deferred();
	}
}
Deferred.prototype = {
	init : function () {
		this.callback = {
			ok: function (x) { return x },
			ng: function (x) { throw  x }
		};
		this._next    = null;
	},

	next  : function (fun) { return this._post("ok", fun); },
	error : function (fun) { return this._post("ng", fun); },
	call  : function (val) { return this._fire("ok", val); },
	fail  : function (err) { return this._fire("ng", err); },

	cancel : function () {
		this._next = null;
	},

	_post : function (okng, fun) {
		this.callback[okng] = fun;
		this._next = new Deferred();
		return this._next;
	},

	_fire : function (okng, value) {
		var self = this;
		var next = "ok";
		try {
			value = self.callback[okng].call(self, value);
		} catch (e) {
			next  = "ng";
			value = e;
		}
		if (value instanceof Deferred) {
			value._next = self._next;
		} else {
			setTimeout(function () {
				if (self._next) self._next._fire(next, value);
			}, 0);
		}
	}
};

function parallel (dl) {
	var ret = new Deferred();
	var values = [];
	for (var i = 0; i < dl.length; i++) {
		(function (d, i) {
			d.next(function (v) {
				dl.pop();
				values[i] = v;
				if (!dl.length) {
					ret.call(values);
				}
			}).error(function (e) {
				ret.fail(e);
			});
		})(dl[i], i)
	}
	return ret;
}

function wait (n) {
	var d = new Deferred();
	var t = new Date();
	setTimeout(function () {
		d.call((new Date).getTime() - t.getTime());
	}, n * 1000)
	return d;
}

function next (fun) {
	var d = new Deferred();
	setTimeout(function () { d.call() }, 0);
	return d.next(fun);
}

function call (f, args) {
	args = Array.prototype.slice.call(arguments);
	f    = args.shift();
	return next(function () {
		return f.apply(this, args);
	});
}

function loop (o, fun) {
	var begin = o.begin || 0;
	var end   = o.end;
	var step  = o.step || 1;
	var ret;
	return next(function () {
		function _loop (i) {
			if (i < end) {
				ret = fun.call(this, i, step);
				return call(_loop, i + step);
			} else {
				return ret;
			}
		}
		return call(_loop, begin);
	});
}

$.deferred          = Deferred;
$.deferred.parallel = parallel;
$.deferred.wait     = wait;
$.deferred.next     = next;
$.deferred.call     = call;
$.deferred.loop     = loop;
$.deferred.define   = function (obj, list) {
	if (!list) list = ["parallel", "wait", "next", "call", "loop"];
	if (!obj)  obj  = (function () { return this })();
	$.each(list, function (n, i) {
		obj[i] = $.deferred[i];
	});
};

// override jQuery Ajax functions
$.each(["get", "getJSON", "post"], function (n, i) {
	var orig = $[i];
	$[i] = function (url, data, callback) {
		if (typeof data == "function") {
			data = undefined;
			callback = data;
		}
		var d = $.deferred();
		orig(url, data, function (data) {
			d.call(data);
		});
		if (callback) d.next(callback);
		return d;
	};
});

// end
})(jQuery);
