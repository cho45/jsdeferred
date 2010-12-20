#!node

var sys      = require('sys');
var fs       = require('fs');
var Deferred = require('./jsdeferred.js').Deferred;
var Global   = global;
Deferred.define();

var data;
data = fs.readFileSync('./test-jsdeferred.js', 'ascii');
data = data.match(/\/\/ ::Test::Start::([\s\S]+)::Test::End::/)[1];
var testfuns = []; data.replace(/(ok|expect)\(.+/g, function (m) {
	testfuns.push(m);
	return m;
});

var expects = testfuns.length;

function uneval (obj) {
	return sys.inspect(obj);
}

function show (msg, expect, result) {
	var okng = this;

	var out = [];
	out.push(color(46, "[", [expects - testfuns.length, expects].join("/"), "]"));
	if (okng == "skip") {
		out.push(" ", color(33, "skipped " + expect + " tests: " + msg));
		console.log(out.join(""));
		while (expect--) testfuns.pop();
	} else
	if (okng == "ng") {
		testfuns.pop();
		expect = (typeof expect == "function") ? uneval(expect).match(/[^{]+/)+"..." : uneval(expect);
		result = (typeof result == "function") ? uneval(result).match(/[^{]+/)+"..." : uneval(result);
		out.push(["NG Test::", msg, expect, result].join("\n"));
		console.log(out.join(""));
		process.exit(1);
	} else {
		testfuns.pop();
		out.push(" ", color(32, "ok"));
		console.log(out.join(""));
	}
}

function msg (m) {
	console.log(m);
}
log = msg;
print = msg;

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

function color (code) {
	var str = "";
	for (var i = 1; i < arguments.length; i++) str += arguments[i];
	return [
		String.fromCharCode(27), "[", code, "m",
		str,
		String.fromCharCode(27), "[0m"
	].join("");
}

// run tests
eval(data);

process.on('exit', function () {
	if (expects - testfuns.length == expects) {
		print(color(32, "All tests passed"));
	} else {
		print(color(31, "Some tests failed..."));
	}
});
