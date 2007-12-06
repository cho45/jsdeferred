#!rhino
function Main () {
/*
 * This test script is NOT work in Rhino 1.6.R1-0.0ubuntu3
 * ...
 */

load("jsdeferred.js");

data = readFile("./test-jsdeferred.js");
data = data.match(/\/\/ ::Test::Start::((?:\s|[^\s])+)::Test::End::/)[1];
var testfuns = []; data.replace(/(ok|expect)\(.+/g, function (m) {
//	if (window.console) console.log(m);
	testfuns.push(m);
	return m;
});

var expects = testfuns.length;

function show (msg, expect, result) {
	var okng = this;
	testfuns.pop();

	var out = [];
	out.push("[", [expects - testfuns.length, expects].join("/"), "]");
	if (okng == "ng") {
		expect = (typeof expect == "function") ? uneval(expect).match(/[^{]+/)+"..." : uneval(expect);
		result = (typeof result == "function") ? uneval(result).match(/[^{]+/)+"..." : uneval(result);
		out.push(["NG Test::", msg, expect, result].join("\n"));
		print(out.join(""));
		quit();
	} else {
		out.push(" ", "ok");
		print(out.join(""));
	}
}

function msg (m) {
	print(m);
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


// run test
// eval(data);

Deferred.define();
loop(5, function (n) {
	print(n);
});


next(function () {
	print("111");
	return next(function () {
		print("222");
	});
}).
next(function () {
	function aaa () {
		print("444");
	}
	print("333");
	return call(aaa);
});

//var id = setTimeout(function () {
//	print("foo");
//}, 1000);
//var id = setTimeout(function () {
//	print("bar");
//	var id = setTimeout(function () {
//		print("bar");
//	}, 1000);
//}, 1000);
//print("hoge");
//print((function () { return this })().setTimeout);

}(function () {
	// emurate setTimeout
	var Global = (function () { return this })();
	var runQueue = [{func:Main,time:0}];
	runQueue.process = sync(function () {
		var now = new Date().valueOf();
		for (var i = 0; i < runQueue.length; i++) {
			if (runQueue[i].time <= now) {
		//		print("invoke"+uneval(runQueue[i]));
				fun = runQueue[i].func;
				runQueue.splice(i, 1);
				fun();
				break;
			}
		}
	});
	runQueue.add    = sync(function (func, delay) {
		this.push({id:++runQueue._id,func:func, time: new Date().valueOf() + delay});
		return runQueue._id;
	});
	runQueue.remove = sync(function (id) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].id == id) {
				this.splice(i, 1);
				break;
			}
		}
	});
	runQueue._id = 0;

	Global.setTimeout = function (func, delay) {
//		print("setTimeout:"+uneval(func));
		return runQueue.add(func, delay);
	};
	Global.clearTimeout = function (id) {
		runQueue.remove(id);
	};

	Global.window = Global;
	Global.console = {
		log : function (a) {
			a = Array.prototype.slice.call(arguments, 0);
			print(uneval(a));
		}
	};

	// run process
	spawn(function () {
		while (runQueue.length) {
//			print(uneval(runQueue));
			runQueue.process();
		}
	});
})();
