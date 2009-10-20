(function ($) {
	$.deferred = Deferred;
	$.fn.extend({
		deferred: function(name) {
			var args = Array.prototype.slice.call(arguments, 1);
			return Deferred.connect(this[name], { target:this }).apply(null, args);
		}
	});

	// override jQuery Ajax function for returning Deferred.
	var orig_ajax = $.ajax; $.ajax = function (opts) {
		var d = $.deferred(), orig = {};
		$.extend(orig, opts);

		opts.success = function () {
			if (orig.success) orig.success.apply(this, arguments);
			d.call.apply(d, arguments);
		};

		opts.error = function () {
			if (orig.error) orig.error.apply(this, arguments);
			d.fail.apply(d, arguments);
		};

		orig_ajax(opts);

		return d;
	};
})(jQuery);

