(function ($) {

	function wrap (obj) {
		obj.toJSDeferred = function () {
			return Deferred.absorb(this);
		};
		obj.next = function (fun) {
			return Deferred.absorb(this).next(fun);
		};
		obj.error = function (fun) {
			return Deferred.absorb(this).error(fun);
		};
		obj.done(function (v) {
			if (obj._next) obj._next._fire('ok', v);
		});
		obj.fail(function (v) {
			if (obj._next) obj._next._fire('ok', v);
		});

		var orig_promise = obj.promise;
		obj.promise = function () {
			return wrap(orig_promise.apply(this, arguments));
		};

		return obj;
	}

	// Convert jQuery.Deferred or jqXHR to JSDeferred.
	
	Deferred.absorb = function (obj) {
		var ret = new Deferred();
		ret.progress = function () {};
		obj.done(function (v) {
			// Remove isDeferred signature from jQuery.Deferred as "Result"
			if (v.toJSDeferred) delete v.toJSDeferred;
			ret.call(v);
		});
		obj.fail(function (v) {
			// Remove isDeferred signature from jQuery.Deferred as "Result"
			if (v.toJSDeferred) delete v.toJSDeferred;
			ret.fail(v);
		});
		if (obj.progress) obj.progress(function (v) {
			ret.progress(v);
		});
		return ret;
	};

	// Fortunately, jQuery.Deferred and jqXHR in 1.7 does not have next() and error() function.
	// So JSDeferred can implement it.

	var orig_Deferred = $.Deferred;
	$.Deferred = function (fun) {
		return wrap(orig_Deferred.apply(this, arguments));
	};

	var orig_ajax = $.ajax;
	$.ajax = function () {
		// Currently, jQuery call deferred.promise( jqXHR ); so we just returns it.  
		return orig_ajax.apply(this, arguments);
	};

	// okay, jQuery.Deferred's interface is compatible to JSDeferred.
	var orig_isDeferred = Deferred.isDeferred;
	Deferred.isDeferred = function (obj) {
		return orig_isDeferred(obj) || !!(obj && obj.toJSDeferred);
	};

	$.JSDeferred = Deferred;
})(jQuery);

