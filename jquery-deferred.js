/* Header::
 * jQuery Deferred
 * Copyright (c) 2007 cho45 ( www.lowreal.net )
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
/* Usage::
 *
 *     $.deferred.export();
 *
 *     $.get("/hoge").next(function (data) {
 *         alert(data);
 *     }).
 *
 *     parallel([$.get("foo.html"), $.get("bar.html")]).next(function (values) {
 *         log($.map(values, function (v) { return v.length }));
 *         if (values[1].match(/nextUrl:\s*([^\s]+)/)) {
 *             return $.get(RegExp.$1).next(function (d) {
 *                 return d;
 *             });
 *         }
 *     }).
 *     next(function (d) {
 *         log(d.length)
 *     });
 *
 */


/* function Deferred () //=> constructor
 *
 * `Deferred` function is constructor of Deferred.
 *
 * Sample:
 *     var d = new $.deferred(); //=> new Deferred;
 *     // or this is shothand of above.
 *     var d = $.deferred();
 */
/* function Deferred.prototype.next   (fun) //=> Deferred
 *
 * `next` set `fun` as callback of self and return next Deferred.
 */
/* function Deferred.prototype.error  (fun) //=> Deferred
 *
 * `error` set `fun` as errorback of self and return next Deferred.
 * If `fun` not throws error but returns normal value, Deferred treats
 * the given error is recovery and continue callback chain.
 */
/* function Deferred.prototype.call   (val) //=> void 0
 *
 * `call` invokes self callback chain.
 */
/* function Deferred.prototype.fail   (err) //=> void 0
 *
 * `fail` invokes self errorback chain.
 */
/* function Deferred.prototype.cancel (err) //=> void 0
 *
 * `cancel` cancels self callback chain.
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

/* function parallel (deferredlist) //=> Deferred
 *
 * `parallel` wraps up deferredlist to one deferred.
 * This is useful when some asynchronous resources required.
 *
 * `deferredlist` can be Array or Object (Hash).
 *
 * Sample:
 *     parallel([
 *         $.get("foo.html"),
 *         $.get("bar.html")
 *     ]).next(function (values) {
 *         values[0] //=> foo.html data
 *         values[1] //=> bar.html data
 *     });
 *
 *     parallel({
 *         foo: $.get("foo.html"),
 *         bar: $.get("bar.html")
 *     }).next(function (values) {
 *         values.foo //=> foo.html data
 *         values.bar //=> bar.html data
 *     });
 */
function parallel (dl) {
	var ret = new Deferred();
	if (dl instanceof Array) {
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
	} else {
		var values = {}
		var num    = 0;
		for (var i in dl) {
			if (!dl.hasOwnProperty(i)) continue;
			(function (d, i) {
				d.next(function (v) {
					values[i] = v;
					if (--num <= 0) {
						ret.call(values);
					}
				}).error(function (e) {
					ret.fail(e);
				});
				num++;
			})(dl[i], i)
		}
	}
	return ret;
}

/* function wait (sec) //=> Deferred
 *
 * `wait` returns deferred that will be called after `sec` elapsed
 * with real elapsed time (msec)
 *
 * Sample:
 *     wait(1).next(function (elapsed) {
 *         log(elapsed); //=> may be 990-1100
 *     });
 */
function wait (n) {
	var d = new Deferred();
	var t = new Date();
	setTimeout(function () {
		d.call((new Date).getTime() - t.getTime());
	}, n * 1000)
	return d;
}

/* function next (fun) //=> Deferred
 *
 * `next` is shorthand for creating new deferred which
 * is called after current queue.
 */
function next (fun) {
	var d = new Deferred();
	setTimeout(function () { d.call() }, 0);
	return d.next(fun);
}

/* function call (fun[, args...]) //=> Deferred
 *
 * `call` function is for calling function asynchronous.
 *
 * Sample:
 *     next(function () {
 *         function pow (x, n) {
 *             function _pow (n, r) {
 *                 print([n, r]);
 *                 if (n == 0) return r;
 *                 return call(_pow, n - 1, x * r);
 *             }
 *             return call(_pow, n, 1);
 *         }
 *         return call(pow, 2, 10);
 *     }).
 *     next(function (r) {
 *         print([r, "end"]);
 *     })
 *
 */
function call (f, args) {
	args = Array.prototype.slice.call(arguments);
	f    = args.shift();
	return next(function () {
		return f.apply(this, args);
	});
}

/* function loop (n, fun) //=> Deferred
 *
 * `loop` function provides browser-non-blocking loop.
 * This loop is slow but not stop browser's appearance.
 *
 * Sample:
 *     //=> loop 1 to 100
 *     loop({begin:1, end:100,step:10}, function (n, o) {
 *         for (var i = 0; i < o.step; i++) {
 *             log(n+i);
 *         }
 *     });
 *
 *     //=> loop 10 times
 *     loop(10, function (n) {
 *         log(n);
 *     });
 */
function loop (n, fun) {
	var o = {};
	o.begin = n.begin || 0;
	o.end   = n.end   || (n - 1);
	o.step  = n.step  || 1;
	o.last  = false;
	o.prev  = null;
	var ret, step = o.step;
	return next(function () {
		function _loop (i) {
			if (i <= o.end) {
				if ((i + step) > o.end) {
					o.last = true;
					o.step = o.end - i + 1;
				}
				o.prev = ret;
				ret = fun.call(this, i, o);
				if (ret instanceof Deferred) {
					return ret.next(function (r) {
						ret = r;
						return call(_loop, i + step);
					});
				} else {
					return call(_loop, i + step);
				}
			} else {
				return ret;
			}
		}
		return call(_loop, o.begin);
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
