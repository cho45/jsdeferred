
$(function () { $.get("test-jquery-deferred.js", {}, function (data) {

// get tests number.
data = data.match(/::Test::Start::((?:\s|[^\s])+)::Test::End::/)[1];
var testfuns = []; data.replace(/(ok|expect)\(.+/g, function (m) {
	if (window.console) console.log(m);
	testfuns.push(m);
	return m;
});

var results = $("#results tbody");
var expects = testfuns.length;

function show (msg, expect, result) {
	var okng = this;
	testfuns.pop();
	$("#nums").text([expects - testfuns.length, expects].join("/"));
	$("<tr class='"+okng+"'><td>"+[msg, expect, result].join("</td><td>")+"</td></tr>").appendTo(results);
	window.scrollTo(0, document.body.scrollHeight);
}

function msg (m) {
	$("<tr class='msg'><td colspan='3'>"+m+"</td></tr>").appendTo(results);
}

function print (m) {
	$("<tr class='msg low'><td colspan='3'>"+m+"</td></tr>").appendTo(results);
}

function ok () {
	show.apply("ok", arguments);
}

function ng () {
	show.apply("ng", arguments);
}

function expect (msg, expect, result) {
	if (expect == result) {
		show.apply("ok", arguments);
	} else {
		show.apply("ng", arguments);
	}
}

// ::Test::Start::

$.deferred.define();

msg("Loaded "+testfuns.length+" tests;");

msg("Basic Tests::");

expect("new $.deferred()", true, (new $.deferred()) instanceof $.deferred);

var testobj = {};
$.deferred.define(testobj);
expect("define() next", $.deferred.next, testobj.next);
expect("define() loop", $.deferred.loop, testobj.loop);

var testobj = {};
$.deferred.define(testobj, ["next"]);
expect("define() next", $.deferred.next, testobj.next);
expect("define() loop (must not be exported)", undefined, testobj.loop);

var r = [];
var d = new $.deferred();
d.next(function () { ok("Callback called"); r.push(1) });
d.call();
expect("Callback called", 1, r.pop());

// Start Main Test
msg("Start Main Tests::");
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
	return next(function () {
		function pow (x, n) {
			function _pow (n, r) {
				print([n, r]);
				if (n == 0) return r;
				return call(_pow, n - 1, x * r);
			}
			return call(_pow, n, 1);
		}
		return call(pow, 2, 10);
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
		});
	}).
	next(function () {
		var r = [];
		return loop({end: 10, step:1}, function (n, o) {
			r.push(n);
			return r;
		}).next(function (r) {
			expect("loop end:10, step:1", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
		});
	}).
	next(function () {
		var r = [];
		return loop({end: 10, step:2}, function (n, o) {
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop end:10, step:2", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
		});
	}).
	next(function () {
		var r = [];
		return loop({end: 10, step:3}, function (n, o) {
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop end:10, step:3", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
		});
	}).
	next(function () {
		var r = [];
		return loop({end: 10, step:5}, function (n, o) {
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop end:10, step:5", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
		});
	}).
	next(function () {
		var r = [];
		return loop({end: 10, step:9}, function (n, o) {
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop end:10, step:9", [0,1,2,3,4,5,6,7,8,9,10].join(), r.join());
		});
	}).
	next(function () {
		var r = [];
		return loop({begin:1, end: 10, step:3}, function (n, o) {
			for (var i = 0; i < o.step; i++) {
				r.push(n+i);
			}
			return r;
		}).next(function (r) {
			expect("loop begin:1, end:10, step:3", [1,2,3,4,5,6,7,8,9,10].join(), r.join());
		});
	}).
	next(function () {
		return parallel([next(function () { return 0 }), next(function () { return 1 })]).
		next(function (values) {
			expect("parallel values 0", 0, values[0]);
			expect("parallel values 1", 1, values[1]);
		});
	}).
	next(function () {
		return parallel({foo:next(function () { return 0 }), bar: next(function () { return 1 })}).
		next(function (values) {
			expect("parallel named values foo", 0, values.foo);
			expect("parallel named values bar", 1, values.bar);
		});
	}).
	next(function () {
	}).
	error(function (e) {
		ng("Error on loop Tests", "", e);
	}).
	next(function () {
	});
}).
next(function () {
	msg("Done Main.");
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
});



// ::Test::End::

}) });
