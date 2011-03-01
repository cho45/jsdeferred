$(function () { $.get("test-jsdeferred.js", {}, function (data) {
Global = (function () { return this })();

// get tests number.
data = data.match(/\/\/ ::Test::Start::([\s\S]+)::Test::End::/)[1];
var testfuns = []; data.replace(/(ok|expect)\(.+/g, function (m) {
	if (window.console) console.log(m);
	testfuns.push(m);
	return m;
});

var results = $("#results tbody");
var expects = testfuns.length;

function show (msg, expect, result) {
	var okng = this;
	if (okng == "skip") {
		result = "skipped " + expect + " tests:" + msg;
		while (expect--) testfuns.pop();
		expect = "skipped";
	} else {
		testfuns.pop();
		expect = (typeof expect == "function") ? uneval(expect).match(/[^{]+/)+"..." : uneval(expect);
		result = (typeof result == "function") ? uneval(result).match(/[^{]+/)+"..." : uneval(result);
	}
	$("#nums").text([expects - testfuns.length, expects].join("/"));
	$("<tr class='"+okng+"'><td>"+[msg, expect, result].join("</td><td>")+"</td></tr>").appendTo(results);
	if (testfuns.length) {
		$("#nums").css("color", "#900");
	} else {
		$("#nums").css("color", "");
	}
	if (okng == "ng" || arguments.callee.ng) {
		arguments.callee.ng = true;
		$("#nums").css("background", "#900");
		$("#nums").css("color", "#fff");
	}
	window.scrollTo(0, document.body.scrollHeight);
}

var start = new Date().valueOf();
function msg (m) {
	$("<tr class='msg'><td colspan='3'>("+ (new Date() - start) +"sec)</td></tr>").appendTo(results);
	$("<tr class='msg'><td colspan='3'>"+m+"</td></tr>").appendTo(results);
	window.scrollTo(0, document.body.scrollHeight);
}

function print (m) {
	$("<tr class='msg low'><td colspan='3'>"+m+"</td></tr>").appendTo(results);
	window.scrollTo(0, document.body.scrollHeight);
}
window.print = print;
window.log = print;

function ok () {
	show.apply("ok", arguments);
	return true;
}

function ng () {
	show.apply("ng", arguments);
	return true;
}

function skip () {
	show.apply("skip", arguments);
	return true;
}

function expect (msg, expect, result) {
	if (expect == result) {
		show.apply("ok", arguments);
	} else {
		show.apply("ng", arguments);
	}
	return true;
}

// ::Test::Start::

Deferred.define();

function calcAccuracy () {
	var d = new Deferred();
	var r = [];
	var i = 30;
	var t = new Date().getTime();
	setTimeout(function () {
		if (i-- > 0) {
			var n = new Date().getTime();
			r.push(n - t);
			t = n;
			setTimeout(arguments.callee, 0);
		} else {
			d.call(r);
		}
	}, 0);
	return d;
}

msg("Loaded "+testfuns.length+" tests;");
log("Deferred.next Mode:" + uneval({
	_faster_way_Image            : !!Deferred.next_faster_way_Image,
	_faster_way_readystatechange : !!Deferred.next_faster_way_readystatechange
}));
log(String(Deferred.next));

msg("Basic Tests::");

expect("new Deferred", true, (new Deferred) instanceof Deferred);
expect("Deferred()",   true,     Deferred() instanceof Deferred);

new function () {
	var testobj = {};
	Deferred.define(testobj);
	expect("define() next", Deferred.next, testobj.next);
	expect("define() loop", Deferred.loop, testobj.loop);
};

new function () {
	var testobj = {};
	Deferred.define(testobj, ["next"]);
	expect("define() next", Deferred.next, testobj.next);
	expect("define() loop (must not be exported)", undefined, testobj.loop);
};

new function () {
	var d = next(function () {
		ng("Must not be called!!");
	});
	d.cancel();
};

new function () {
	var d = Deferred();
	d.callback.ok = function () {
		ng("Must not be called!!");
	};
	d.cancel();
	d.call();
};

new function () {
	var d = Deferred();
	var r = undefined;
	Deferred.onerror = function (e) {
		r = e;
	};
	d.fail("error");
	expect("Deferred.onerror", "error", r);

	r = undefined;
	delete Deferred.onerror;
	d.fail("error");
	expect("Deferred.onerror", undefined, r);
};

new function () {
	expect("Deferred.isDeferred(new Deferred())", true, Deferred.isDeferred(new Deferred()));
	// Make different origin Deferred class;
	var _Deferred = function () { this.init() };
	_Deferred.prototype = {};
	for (var key in Deferred.prototype) if (Deferred.prototype.hasOwnProperty(key)) {
		var val = Deferred.prototype[key];
		_Deferred.prototype[key] = val;
	}
	expect("TEST CONDITION", false, new _Deferred() instanceof Deferred);
	expect("Deferred.isDeferred(new _Deferred())", true, Deferred.isDeferred(new _Deferred()));

	expect("Deferred.isDeferred()", false, Deferred.isDeferred());
	expect("Deferred.isDeferred(null)", false, Deferred.isDeferred(null));
	expect("Deferred.isDeferred(true)", false, Deferred.isDeferred(true));
	expect("Deferred.isDeferred('')", false, Deferred.isDeferred(''));
	expect("Deferred.isDeferred(0)", false, Deferred.isDeferred(0));
	expect("Deferred.isDeferred(undefined)", false, Deferred.isDeferred(undefined));
	expect("Deferred.isDeferred({})", false, Deferred.isDeferred({}));
};

Deferred.onerror = function (e) {
	log("DEBUG: Errorback will invoke:" + e);
};

// Start Main Test
msg("Start Main Tests::");
next(function () {
	msg("Information");
	return calcAccuracy().next(function (r) {
		print('setTimeout Accuracy: '+uneval(r));
	});
}).
next(function () {
	msg("Process sequence");

	var vs = [];
	d = next(function () {
		vs.push("1");
	}).
	next(function () {
		vs.push("2");
		expect("Process sequence", "0,1,2", vs.join(","));
	});

	vs.push("0");

	return d;
}).
next(function () {
	msg("Process sequence (Complex)");

	var vs = [];
	return next(function () {
		expect("Process sequence (Complex)", "", vs.join(","));
		vs.push("1");
		return next(function() {
			expect("Process sequence (Complex)", "1", vs.join(","));
			vs.push("2");
		});
	}).
	next(function () {
		expect("Process sequence (Complex)", "1,2", vs.join(","));
	});
}).
next(function () {
	msg("Test Callback, Errorback chain::");
	return next(function () { throw "Error"; }).
	error(function (e) {
		expect("Errorback called", "Error", e);
		return e;
	}).
	next(function (e) {
		expect("Callback called", "Error", e);
		throw "Error2";
	}).
	next(function (e) {
		ng("Must not be called!!");
	}).
	error(function (e) {
		expect("Errorback called", "Error2", e);
	});
}).
next(function () {
	delete Deferred.prototype.wait;
	Deferred.register("wait", wait);
	return next(function () {
		msg("register test");
	}).
	next(function () { msg("registered wait") }).
	wait(0.1).
	next(function () { msg("registered loop") }).
	loop(1, function () {}).
	next(function (n) {
		ok("register test");
	}).
	error(function (e) {
		ng(e);
	});
}).
next(function () {
	var a, b;
	return next(function () {
		function pow (x, n) {
			expect("child deferred chain", a._next, b._next);
			function _pow (n, r) {
				print(uneval([n, r]));
				if (n == 0) return r;
				return call(_pow, n - 1, x * r);
			}
			return call(_pow, n, 1);
		}
		a = this;
		b = call(pow, 2, 10);
		return b;
	}).
	next(function (r) {
		expect("pow calculate", 1024, r);
	}).
	error(function (e) {
		ng("Error on pow", "", e);
	});
}).
error(function (e) {
	ng("Error on Test Callback, Errorback chain", "", e);
}).
next(function () {
	msg("Utility Functions Tests::");

	return next(function () {
		return wait(0).next(function (i) {
			ok("wait(0) called", "1000ms >", i);
		});
	}).
	next(function () {
		}).
	error(function (e) {
		ng("Error on wait Tests", "", e);
	}).
	next(function () {
		return call(function (test) {
			expect("call test1", 10, test);
			return call(function (t, u) {
				expect("call test2", 10, t);
				expect("call test2", 20, u);
			}, 10, 20);
		}, 10);
	}).
	next(function () {
		var t = 0;
		return loop(5, function (i) {
			expect("loop num", t++, i);
			/* dummy for expects
			 * expect()
			 * expect()
			 * expect()
			 * expect()
			 */
			return "ok";
		}).next(function (r) {
			expect("loop num. result", "ok", r);
			expect("loop num. result", 5, t);
		});
	}).
	next(function () {
		var t = 0;
		return loop(2, function (i) {
			expect("loop num", t++, i);
			/* dummy for expects
			 * expect()
			 */
			return "ok";
		}).next(function (r) {
			expect("loop num. result", "ok", r);
			expect("loop num. result", 2, t);
		});
	}).
	next(function () {
		var t = 0;
		return loop(1, function (i) {
			expect("loop num", t++, i);
			return "ok";
		}).next(function (r) {
			expect("loop num. result", "ok", r);
			expect("loop num. result", 1, t);
		});
	}).
	next(function () {
		var t = 0;
		return loop(0, function (i) {
			t++;
		}).next(function () {
			expect("loop num 0 to 0. result", 0, t);
		});
	}).
	next(function () {
		var t = 0;
		return loop({begin:0, end:0}, function (i) {
			t++;
		}).next(function () {
			expect("loop num begin:0 to end:0. result", 1, t);
		});
	}).
	next(function () {
		var r = [];
		var l = [];
		return loop({end: 10, step:1}, function (n, o) {
			print(uneval(o));
			r.push(n);
			l.push(o.last);
			return r;
		}).next(function (r) {
			expect("loop end:10, step:1", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
			expect("loop end:10, step:1 last?", [false,false,false,false,false,false,false,false,false,false,true].join(), l.join());
		});
	}).
	next(function () {
		var r = [];
		var l = [];
		return loop({end: 10, step:2}, function (n, o) {
			print(uneval(o));
			l.push(o.last);
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop end:10, step:2", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
			expect("loop end:10, step:2 last?", [false,false,false,false,false,true].join(), l.join());
		});
	}).
	next(function () {
		var r = [];
		var l = [];
		return loop({end: 10, step:3}, function (n, o) {
			print(uneval(o));
			l.push(o.last);
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop end:10, step:3", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
			expect("loop end:10, step:3 last?", [false,false,false,true].join(), l.join());
		});
	}).
	next(function () {
		var r = [];
		var l = [];
		return loop({end: 10, step:5}, function (n, o) {
			print(uneval(o));
			l.push(o.last);
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop end:10, step:5", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
			expect("loop end:10, step:5 last?", [false,false,true].join(), l.join());
		});
	}).
	next(function () {
		var r = [];
		var l = [];
		return loop({end: 10, step:9}, function (n, o) {
			print(uneval(o));
			l.push(o.last);
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop end:10, step:9", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
			expect("loop end:10, step:9 last?", [false,true].join(), l.join());
		});
	}).
	next(function () {
		var r = [];
		var l = [];
		return loop({end: 10, step:10}, function (n, o) {
			print(uneval(o));
			l.push(o.last);
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop end:10, step:10", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
			expect("loop end:10, step:10 last?", [false,true].join(), l.join());
		});
	}).
	next(function () {
		var r = [];
		var l = [];
		return loop({end: 10, step:11}, function (n, o) {
			print(uneval(o));
			l.push(o.last);
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop end:10, step:11", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
			expect("loop end:10, step:11 last?", [true].join(), l.join());
		});
	}).
	next(function () {
		var r = [];
		var l = [];
		return loop({begin:1, end: 10, step:3}, function (n, o) {
			print(uneval(o));
			l.push(o.last);
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop begin:1, end:10, step:3", [1,2,3,4,5,6,7,8,9,10].join(), r.join());
			expect("loop begin:1, end:10, step:3 last?", [false,false,false,true].join(), l.join());
		});
	}).
	next(function () {
		var r = [];
		return repeat(0, function (i) {
			r.push(i);
		}).
		next(function (ret) {
			expect("repeat 0 ret val", undefined, ret);
			expect("repeat 0", [].join(), r.join());
		});
	}).
	next(function () {
		var r = [];
		return repeat(10, function (i) {
			r.push(i);
		}).
		next(function (ret) {
			expect("repeat 10", [0,1,2,3,4,5,6,7,8,9].join(), r.join());
		});
	}).
	next(function () {
		return parallel([]).
		next(function () {
			ok("parallel no values");
		});
	}).
	next(function () {
		return parallel([next(function () { return 0 }), next(function () { return 1 })]).
		next(function (values) {
			print(uneval(values));
			expect("parallel values 0", 0, values[0]);
			expect("parallel values 1", 1, values[1]);
		});
	}).
	next(function () {
		return parallel({foo:next(function () { return 0 }), bar: next(function () { return 1 })}).
		next(function (values) {
			print(uneval(values));
			expect("parallel named values foo", 0, values.foo);
			expect("parallel named values bar", 1, values.bar);
		});
	}).
	next(function () {
		return parallel(next(function () { return 0 }), next(function () { return 1 })).
		next(function (values) {
			print(uneval(values));
			expect("parallel values 0", 0, values[0]);
			expect("parallel values 1", 1, values[1]);
		});
	}).
	next(function () {
		return Deferred.earlier([
			wait(0).next(function () { return 1 }),
			wait(1).next(function () { return 2 })
		]).
		next(function (values) {
			print(uneval(values));
			expect("earlier named values 0", 1, values[0]);
			expect("earlier named values 1", undefined, values[1]);
		});
	}).
	next(function () {
		return Deferred.earlier([
			wait(1).next(function () { return 1 }),
			wait(0).next(function () { return 2 })
		]).
		next(function (values) {
			print(uneval(values));
			expect("earlier named values 0", undefined, values[0]);
			expect("earlier named values 1", 2, values[1]);
		});
	}).
	next(function () {
		return Deferred.earlier(
			wait(1).next(function () { return 1 }),
			wait(0).next(function () { return 2 })
		).
		next(function (values) {
			print(uneval(values));
			expect("earlier named values 0", undefined, values[0]);
			expect("earlier named values 1", 2, values[1]);
		});
	}).
	next(function () {
		return Deferred.earlier({
			foo : wait(0).next(function () { return 1 }),
			bar : wait(1).next(function () { return 2 })
		}).
		next(function (values) {
			print(uneval(values));
			expect("earlier named values foo", 1, values.foo);
			expect("earlier named values bar", undefined, values.bar);
		});
	}).
	next(function () {
		return Deferred.earlier({
			foo : wait(1).next(function () { return 1 }),
			bar : wait(0).next(function () { return 2 })
		}).
		next(function (values) {
			print(uneval(values));
			expect("earlier named values foo", undefined, values.foo);
			expect("earlier named values bar", 2, values.bar);
		});
	}).
	error(function (e) {
		alert(e);
		ng("Error on Tests", "", e);
	});
}).
next(function () {
	return Deferred.chain(
		function () {
			ok("called");
			return wait(0.5);
		},
		function (w) {
			ok("called");
			throw "error";
		},
		function error (e) {
			ok("error called: " + e);
		},
		[
			function () {
				ok("callled");
				return next(function () { return 1 });
			},
			function () {
				ok("callled");
				return next(function () { return 2 });
			}
		],
		function (result) {
			expect("array is run in parallel", result[0], 1); 
			expect("array is run in parallel", result[1], 2); 
		},
		{
			foo: function () { return 1 },
			bar: function () { return 2 }
		},
		function (result) {
			expect("object is run in parallel", result.foo, 1); 
			expect("object is run in parallel", result.bar, 2); 
		},
		function error (e) {
			ng(e);
		}
	);
}).
next(function () {
	msg("Connect Tests::");
	return next(function () {
		var f = function (arg1, arg2, callback) {
			callback(arg1 + arg2);
		}
		var fd = Deferred.connect(f, { ok: 2 });
		return fd(2,3).next(function(r) {
			expect('connect f 2 arguments', 5, r);
		});
	}).
	next(function () {
		var obj = {
			f : function (arg1, arg2, callback) {
				callback(this.plus(arg1, arg2));
			},

			plus : function (a, b) {
				return a + b;
			}
		};
		var fd = Deferred.connect(obj, "f", { ok: 2 });
		return fd(2,3).next(function(r) {
			expect('connect f target, "method"', 5, r);
		});
	}).
	next(function () {
		var obj = {
			f : function (arg1, arg2, callback) {
				callback(this.plus(arg1, arg2));
			},

			plus : function (a, b) {
				return a + b;
			}
		};
		var fd = Deferred.connect(obj, "f");
		return fd(2,3).next(function(r) {
			expect('connect f target, "method"', 5, r);
		});
	}).
	next(function () {
		var f = function (arg1, arg2, callback) {
			callback(arg1 + arg2);
		}
		var fd = Deferred.connect(f, { args: [2, 3] });

		return fd().next(function(r) {
			expect('connect f bind args', 5, r);
		});
	}).
	next(function () {
		var f = function (arg1, arg2, callback) {
			callback(arg1 + arg2);
		}
		var fd = Deferred.connect(f, { args: [2, 3] });

		return fd(undefined).next(function(r) {
			expect('connect f bind args', 5, r);
		});
	}).
	next(function () {
		var f = function (arg1, arg2, arg3, callback) {
			callback(arg1 + arg2 + arg3);
		}
		var fd = Deferred.connect(f, { ok: 3, args: [2, 3] });

		return fd(5).next(function(r) {
			expect('connect f bind args', 10, r);
		});
	}).
	next(function () {
		var obj = {
			f : function (arg1, arg2, callback) {
				callback(this.plus(arg1, arg2));
			},

			plus : function (a, b) {
				return a + b;
			}
		};
		var fd = Deferred.connect(obj, "f", { args: [2, 3] });
		return fd().next(function(r) {
			expect('connect f bind args 2', 5, r);
		});
	}).
	next(function () {
		var timeout = Deferred.connect(function (n, cb) {
			setTimeout(cb, n);
		});

		return timeout(1).next(function () {
			ok('connect setTimeout');
		});
	}).
	next(function () {
		var timeout = Deferred.connect(function (n, cb) {
			setTimeout(cb, n);
		});

		var seq = [0];
		return timeout(1).next(function () {
			expect('sequence of connect', '0', seq.join(','));
			seq.push(1);
			return next(function () {
				expect('sequence of connect', '0,1', seq.join(','));
				seq.push(2);
			});
		}).
		next(function () {
			expect('sequence of connect', '0,1,2', seq.join(','));
		});
	}).
	next(function () {
		var f = Deferred.connect(function (cb) {
			setTimeout(function () {
				cb(0, 1, 2);
			}, 0);
		});
		return f().next(function (a, b, c) {
			expect('connected function pass multiple arguments to callback', '0,1,2', [a,b,c].join(','));
			return f();
		}).
		next(function (a, b, c) {
			expect('connected function pass multiple arguments to callback (child)', '0,1,2', [a,b,c].join(','));
		});
	});
}).
next(function () {
	var f = function(arg1, arg2, callback) {
		setTimeout(function() {
			callback(arg1, arg2);
		}, 10);
	}
	var fd = Deferred.connect(f, { ok: 2 });
	return fd(2,3).next(function(r0, r1) {
		expect('connect f callback multiple values', 2, r0);
		expect('connect f callback multiple values', 3, r1);
	});
}).
next(function () {
	var f = function(arg1, arg2, callback) {
		setTimeout(function() {
			callback(arg1 + arg2);
		}, 10);
	}
	var fd = Deferred.connect(f);
	return fd(2,3).next(function(r) {
		expect('connect unset callbackArgIndex', 5, r);
	});
}).
next(function () {
	var f = function(arg1, arg2, callback, errorback, arg3) {
		setTimeout(function() {
			errorback(arg1, arg2, arg3);
		}, 10);
	}
	var fd = Deferred.connect(f, { ok: 2, ng: 3 });
	return fd(2,3,4).error(function(r) {
		expect('connect f errorback', 2, r[0]);
		expect('connect f errorback', 3, r[1]);
		expect('connect f errorback', 4, r[2]);
	});
}).
next(function () {
	var _this = new Object();
	var f = function (callback) {
		var self = this;
		setTimeout(function () {
			callback(_this === self);
		}, 10);
	};
	var fd = Deferred.connect(f, { target: _this, ok: 0 });
	return fd().next(function (r) {
		expect("connect this", true, r);
	});
}).
next(function () {
	var count = 0;
	var successThird = function () {
		var deferred = new Deferred;
		setTimeout(function() {
			var c = ++count;
			if (c == 3) {
				deferred.call('third');
			} else {
				deferred.fail('no third');
			}
		}, 10);
		return deferred;
	}

	return next(function () {
		return Deferred.retry(4, successThird).next(function (mes) {
			expect('retry third called', 'third', mes);
			expect('retry third called', 3, count);
			count = 0;
		}).
		error(function (e) {
			ng(e);
		});
	}).
	next(function () {
		return Deferred.retry(3, successThird).next(function (mes) {
			expect('retry third called', 'third', mes);
			expect('retry third called', 3, count);
			count = 0;
		}).
		error(function (e) {
			ng(e);
		});
	}).
	next(function () {
		return Deferred.retry(2, successThird).next(function (e) {
			ng(e);
		}).
		error(function (mes) {
			ok(true, 'retry over');
		});
	}).
	error(function (e) {
		ng(e);
	});
}).
next(function () {
	msg("Stack over flow test: check not waste stack.");
//	if (skip("too heavy", 1)) return;

	var num = 10001;
	return loop(num, function (n) {
		if (n % 500 == 0) print(n);
		return n;
	}).
	next(function (r) {
		expect("Long long loop", num-1, r);
	}).
	error(function (e) {
		ng(e);
	});
}).
next(function () {
	msg("Done Main.");
}).
next(function () {
	msg("jQuery binding test")
	if (Global.navigator && !/Rhino/.test(Global.navigator.userAgent)) {
		return next(function() {
			expect("$.ajax should return deferred",    true, $.ajax({ url: "./test.html" }) instanceof $.deferred);
			expect("$.get should return deferred",     true, $.get("./test.html")           instanceof $.deferred);
			expect("$.post should return deferred",    true, $.post("./test.html")          instanceof $.deferred);
			expect("$.getJSON should return deferred", true, $.getJSON("./test.html")       instanceof $.deferred);
		}).
		next(function () {
			return $.ajax({
				url : "./test.html",
				success : function () {
					ok("$.ajax#success");
				},
				error : function () {
					ng("$.ajax#success");
				}
			}).
			next(function () {
				ok("$.ajax#success");
			}).
			error(function (e) {
				ng("$.ajax#success");
			});
		}).
		next(function () {
			return $.ajax({
				url : "error-404" + Math.random(),
				success : function () {
					ng("$.ajax#errro");
				},
				error : function () {
					ok("$.ajax#error", "You may see error on console but it is correct.");
				}
			}).
			next(function () {
				ng("$.ajax#error");
			}).
			error(function (e) {
				ok("$.ajax#error");
			});
		}).
		error(function (e) {
			ng("Error on jQuery Test:", "", e);
		});
	} else {
		skip("Not in browser", 8);
	}
	return null;
}).
next(function () {
	msg("Canceling Test:");
	return next(function () {
		return next(function () {
			msg("Calceling... No more tests below...");
			this.cancel();
		}).
		next(function () {
			ng("Must not be called!! calceled");
		});
	});
}).
next(function () {
	ng("Must not be called!! calceled");
}).
error(function (e) {
	ng(e);
});



// ::Test::End::
}) });



/* util */

if (typeof uneval != "function") {
	uneval = function  (o) {
		switch (typeof o) {
			case "undefined" : return "(void 0)";
			case "boolean"   : return String(o);
			case "number"    : return String(o);
			case "string"    : return '"' + o.replace(/"/g, '\\"') + '"';
			case "function"  : return "(" + o.toString() + ")";
			case "object"    :
				if (o == null) return "null";
				var type = Object.prototype.toString.call(o).match(/\[object (.+)\]/);
				if (!type) throw TypeError("unknown type:"+o);
				switch (type[1]) {
					case "Array":
						var ret = [];
						for (var i = 0; i < o.length; i++) ret.push(arguments.callee(o[i]));
						return "[" + ret.join(", ") + "]";
					case "Object":
						var ret = [];
						for (var i in o) {
							if (!o.hasOwnProperty(i)) continue;
							ret.push(arguments.callee(i) + ":" + arguments.callee(o[i]));
						}
						return "({" + ret.join(", ") + "})";
					case "Number":
						return "(new Number(" + o + "))";
					case "String":
						return "(new String(" + arguments.callee(o) + "))";
					case "Date":
						return "(new Date(" + o.getTime() + "))";
					default:
						if (o.toSource) return o.toSource();
						throw TypeError("unknown type:"+o);
				}
		}
		return null;
	}
}

