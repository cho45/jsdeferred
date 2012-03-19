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
		self.global = $('#global-navigation-inner');
		self.subnav = $('<div class="subnav"></div>').appendTo(self.global);

		$(window).load(function () {
			self.offset = self.global.offset().top;
			self.loadOutline();

			var timer = null;
			$(window).scroll(function () {
				clearTimeout(timer);
				timer = setTimeout(function () {
					self.onscroll();
				}, 10);
			});
			$(window).scroll();

		});
	},

	loadOutline : function () {
		var self = this;
		var sections = $('section.toplevel').map(function () {
			var $this = $(this);
			var id = this.id;
			var toplevel = {
				element : $this,
				nav: self.global.find('a[href="#' + this.id + '"]'),
				id : id,
				title : $this.find('> h1').text(),
				top : $this.offset().top
			};

			var submenu = $('<div class="submenu"><div class="submenu-inner"></div></div>');

			toplevel.sections = $this.find('section').map(function () {
				var $this = $(this);
				var title  = $this.find('> h1').text();
				var id     = this.id || toplevel.id + "-" + title.toLowerCase().replace(/^\s*|\s*$/g, '').replace(/\s+/g, '-');
				this.setAttribute('id', id);

				var nav = $('<a></a>').attr('href', '#' + id).text(title).appendTo(submenu.find('.submenu-inner'));

				return {
					element : $this,
					nav : nav,
					id : id,
					title :  title,
					top : $this.offset().top
				};
			});

			if (toplevel.sections.length) submenu.appendTo(toplevel.nav.parent());

			return toplevel;
		});

		self.outline = sections;
	},

	onscroll : function () {
		var self = this;
		var current = $(window).scrollTop();
		if (current > self.offset) {
			self.global.addClass('fixed');
		} else {
			self.global.removeClass('fixed');
		}

		if (!self.outline) return;
		current += 60;

		for (var i = 0, toplevel; (toplevel = self.outline[i]); i++) {
			if (toplevel.top > current) break;
		}
		toplevel = self.outline[i-1] || { id:'top', sections: [] };

		for (var i = 0, section; (section = toplevel.sections[i]); i++) {
			if (section.top > current) break;
		}
		section = toplevel.sections[i-1];

		if (self.active !== toplevel) {
			if (self.active)
			if (self.active.nav) self.active.nav.removeClass('active');
			self.active = toplevel;
			if (self.active.nav) self.active.nav.addClass('active');
		}

		if (self.activeSection !== section) {
			if (self.activeSection)
			if (self.activeSection.nav) self.activeSection.nav.removeClass('active');
			self.activeSection = section;
			if (self.activeSection)
			if (self.activeSection.nav) self.activeSection.nav.addClass('active');
		}
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
