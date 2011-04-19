JSDeferred
==========

![JSDeferred Structure]( http://f.hatena.ne.jp/images/fotolife/c/cho45/20071208/20071208021643.png )

Simple and clean asynchronous processing.


Sample
------

[JSDeferred Samples]( http://cho45.stfuawsc.com/jsdeferred/sample.html )


Download
--------

 * [jsdeferred.js]( http://github.com/cho45/jsdeferred/raw/master/jsdeferred.js )
 * No comments: [jsdeferred.nodoc.js]( http://github.com/cho45/jsdeferred/raw/master/jsdeferred.nodoc.js )
 * Compressed: [jsdeferred.mini.js]( http://github.com/cho45/jsdeferred/raw/master/jsdeferred.mini.js )
 * With jQuery supports: [jsdeferred.jquery.js]( http://github.com/cho45/jsdeferred/raw/master/jsdeferred.jquery.js )

Repository:

	git clone git://github.com/cho45/jsdeferred.git

For userscript
--------------

Copy and paste following at end of your userscript:

 * [jsdeferred.userscript.js]( http://github.com/cho45/jsdeferred/raw/master/jsdeferred.userscript.js )

Example:

	with (D()) {
	
	next(fun...);
	
	// normal xhr
	http.get("...").
	next(fun...);
	
	// cross site
	xhttp.get("...").
	next(fun...);
	
	}
	
	// pasted code
	function D () {
	...JSDeferred...
	}

See [binding/userscript.js]( http://github.com/cho45/jsdeferred/raw/master/binding/userscript.js )
to get more information of utility functions (http.get/xhttp.get)

Documentation
-------------

See source.

## Introduction ##

 * [doc/intro.html (Japanese)]( http://cho45.stfuawsc.com/jsdeferred/doc/intro.html )
 * [doc/intro.en.html (English)]( http://cho45.stfuawsc.com/jsdeferred/doc/intro.en.html )

[doc/index.html]( http://cho45.stfuawsc.com/jsdeferred/doc/index.html )

Tests
-----

[test.html]( http://cho45.stfuawsc.com/jsdeferred/test.html )

License
-------

Copyright 2007-2009 cho45 &lt;cho45@lowreal.net&gt;

MIT. See header of [jsdeferred.js]( http://github.com/cho45/jsdeferred/raw/master/jsdeferred.js )

Concept
-------

 * Compact
 * Greasemonkey friendly (standalone and compact...)
 * Method chain
 * Short and meaning function names
 * Useful shorthand ways

Internal
--------

This sections use some words as following meanings.

 chain::
    a sequence of processes.
 child::
    the Deferred which returns from a callback.
 Deferred#foobar::
    Deferred.prototype.foobar

### Deferred structure and chain structure ###

A Deferred object has only one callback as its process. Deferred object packages a process (function) as callback and has reference to next Deferred (this is thought like continuation).

Example for understanding Deferred structure.

	var d1 = new Deferred();
	d1.callback.ok = function () {
		alert("1");
	};
	
	var d2 = new Deferred();
	d2.callback.ok = function () {
		alert("2");
	};
	
	// Set d2 as continuation of d1.
	d1._next = d2;
	
	// Invoke the chain.
	d1.call();

And example for usual use.

	next(function () { // this `next` is global function
		alert("1");
	}).
	next(function () { // this `next` is Deferred#next
		alert("2");
	}).
	next(function () {
		alert("3");
	});

Deferred#next creates new Deferred, sets the passed functions to process of it, sets it as continuation of `this` and returns it.


This structure makes easy to chain child Deferreds.

	next(function () {
		alert("1");
	}).
	next(function () {
		alert("2");
		// child Deferred
		return next(function () {
			alert("3");
		});
	}).
	next(function () {
		alert("4");
	});

When the callback returns Deferred, the Deferred calling the callback only sets its continuation (`_next`) to returned Deferred's continuation.

	next(function () {
		alert("1");
	}).
	next(function () {
		alert("2");
		var d = next(function () {
			alert("3");
		});
		d._next = this._next;
		this.cancel();
	}).
	next(function () {
		alert("4");
	});

After the process, above code is same as following:

	next(function () {
		alert("1");
	}).
	next(function () {
		alert("2");
		next(function () {
			alert("3");
		}).
		next(function () {
			alert("4");
		});
	});

![Chain child deferred]( http://f.hatena.ne.jp/images/fotolife/c/cho45/20071207/20071207014817.png )

### Error processing and recovering ###

A Deferred has also error-back for error processing. Let's just see an example (this is from test):

	next(function () {
		throw "Error";
	}).
	error(function (e) {
		expect("Errorback called", "Error", e);
		return e; // recovering error
	}).
	next(function (e) {
		expect("Callback called", "Error", e);
		throw "Error2";
	}).
	next(function (e) {
		// This process is not called because
		// the error is not recovered.
		ng("Must not be called!!");
	}).
	error(function (e) {
		expect("Errorback called", "Error2", e);
	});

The error thrown in callback is propagated by error-back chain. If the error-back returns normal value, the error is considered as recovery, and the callback chain continues.

### Difference between MochiKit and JSDeferred ###

JSDeferred is inspired by MochiKit Deferred object, so both is similar but JSDeferred drops some functions and simplified it.

 * MochiKit Deferred has chain by Array. JSDeferred has chain by chain of Deferred.
 * MochiKit Deferred separates parent chain and child chain, JSDeferred not.

## Comparison of other deferred-like objects ##

### vs [jQuery's Deferred]( http://api.jquery.com/category/deferred-object/ )

 *  Bad: Not supports child deferred
 *  Bad: No utility functions
 *  Good: Simple
 *  Good: Cache result (it can be called after completed the task)
 *  Good: jQuery embed (no more dependencies and compact)

### vs [Dojo's Deferred]( http://docs.dojocampus.org/dojo/Deferred )

 *  Bad: Not supports child deferred
 *  Bad: Very heavy dependencies for dojo
 *  Good: Support progress

### vs [CommonJS's Promise]( http://wiki.commonjs.org/wiki/Promises )

 *  Bad: Not implemeneted?
 *  Bad: Not supports child deferred
 *  Bad: Too complex
 *  Good: Highlier functional

## Different-origin Deferred instances

JSDeferred can be used in inter-environment which is independent respectively like browser extension
because JSDeferred determines a self-class identity by instance id.

Author
-------

Copyright 2007-2009 cho45 &lt;cho45@lowreal.net&gt;

 * Portfolio: [www.lowreal.net]( http://www.lowreal.net/ )
 * Diary (Japanese): [subtech]( http://subtech.g.hatena.ne.jp/cho45/ )

