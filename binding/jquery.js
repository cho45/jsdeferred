(function ($) {

	// Convert jQuery.Deferred or jqXHR to JSDeferred.
	//
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
		var ret = orig_Deferred.apply(this, arguments);
		ret.toJSDeferred = function () {
			return Deferred.absorb(this);
		};
		ret.next = function (fun) {
			return Deferred.absorb(this).next(fun);
		};
		ret.error = function (fun) {
			return Deferred.absorb(this).error(fun);
		};
		return ret;
	};

	var orig_ajax = $.ajax;
	$.ajax = function () {
		var ret = orig_ajax.apply(this, arguments);
		ret.toJSDeferred = function () {
			return Deferred.absorb(this);
		};
		ret.next = function (fun) {
			return Deferred.absorb(this).next(fun);
		};
		ret.error = function (fun) {
			return Deferred.absorb(this).error(fun);
		};
		ret.done(function (v) {
			if (ret._next) ret._next._fire('ok', v);
		});
		ret.fail(function (v) {
			if (ret._next) ret._next._fire('ok', v);
		});
		return ret;
	};

	// okay, jQuery.Deferred's interface is compatible to JSDeferred.
	var orig_isDeferred = Deferred.isDeferred;
	Deferred.isDeferred = function (obj) {
		return orig_isDeferred(obj) || !!(obj && obj.toJSDeferred);
	};

	$.JSDeferred = Deferred;
})(jQuery);

