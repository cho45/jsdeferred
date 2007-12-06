(function ($) {
	$.deferred = Deferred;
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
			if (callback) d = d.next(callback);
			return d;
		};
	});
})(jQuery);

