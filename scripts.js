Deferred.define();

function uneval (o) {
	switch (typeof o) {
		case "undefined" : return "(void 0)";
		case "boolean"   : return String(o);
		case "number"    : return String(o);
		case "string"    : return '"' + o.replace(/[\\"']/gi, function (_) { return '\\u' + (0x10000 + _.charCodeAt(0)).toString(16).slice(1) }) + '"';
		case "function"  : return "(" + o.toString() + ")";
		case "object"    :
			if (o === null) return "null";
			var type = Object.prototype.toString.call(o).match(/\[object (.+)\]/);
			if (!type) throw TypeError("unknown type:"+o);
			switch (type[1]) {
				case "Array":
					var ret = [];
					for (var i = 0, l = o.length; i < l; ret.push(arguments.callee(o[i++])));
					return "[" + ret.join(", ") + "]";
				case "Object":
					ret = [];
					for (var i in o) if (o.hasOwnProperty(i)) {
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
	return "";
}

var Navigation = {
	init : function () {
		var self = this;
		self.global = $('#global-navigation ul');
		self.offset = self.global.offset().top;

		var timer = null;
		$(window).scroll(function () {
			clearTimeout(timer);
			timer = setTimeout(function () {
				self.onscroll();
			}, 10);
		});
	},

	onscroll : function () {
		var self = this;
		var current = $(window).scrollTop();
		if (current > self.offset) {
			self.global.addClass('fixed');
		} else {
			self.global.removeClass('fixed');
		}


//		var x = $(window).width() / 2;
//		var y = $(window).height() / 2;
//		var element = document.elementFromPoint(x, y);
//
//		$(element).parents('section').each(function () {
//			console.log($(this).find('> h1'));
//		});
	}
};


$(function () {
	if (!window.console) window.console = { log: function () { } };

	$('pre.runnable').each(function () {
		var pre = $(this);
		var code = new Function('console', pre.text());
		var output;
		var button = $('<input type="button" value="Run" class="button"/>').
			click(function () {
				if (!output) output = $('<pre class="output" title="click to hide"></pre>').
					click(function () {
						output.hide();
					}).
					appendTo(pre);

				output.show().empty();

				var _console = {
					log:  function (value) {
						console.log(value);
						output.append(uneval(value) + "\n");
					}
				};

				try {
					code(_console);
				} catch (e) {
					alert(e);
				}
			}).
			appendTo(pre);
	});

	Navigation.init();
});
