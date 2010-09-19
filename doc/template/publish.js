function publish (symbolSet) {
	publish.conf = {
		ext          : ".html",
		outDir       : JSDOC.opt.d || SYS.pwd+"../out/jsdoc/",
		templatesDir : JSDOC.opt.t || SYS.pwd+"../templates/jsdoc/"
	};

	IO.mkPath((publish.conf.outDir+"symbols/src").split("/"));

	try {
		var classTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"class.tmpl");
	} catch (e) {
		print("Couldn't create the required templates: "+e);
		quit();
	}

	var symbols = symbolSet.toArray();
	var classes = symbols.filter(isaClass);

	for (var i = 0, l = classes.length; i < l; i++) {
		var symbol = classes[i];
		if (symbol.alias == '_global_') continue;

		symbol.events  = symbol.getEvents();
		symbol.methods = symbol.getMethods().sort(
			function (a, b) {
				if (a.isStatic < b.isStatic) return  1;
				if (a.isStatic > b.isStatic) return -1;
				if (a.alias < b.alias) return -1;
				if (a.alias > b.alias) return  1;
				return 0;
			}
		);

		Link.currentSymbol= symbol;
		var output = "";
		output = classTemplate.process(symbol);

		IO.saveFile(publish.conf.outDir, symbol.alias + publish.conf.ext, output);
	}
}

function hasNoParent (_) {return (_.memberOf == "")}
function isaFile (_) {return (_.is("FILE"))}
function isaClass (_) {return (_.is("CONSTRUCTOR") || _.isNamespace)}


function href (name) {
	return '#' + idOf(name);
}

function idOf (name) {
	return name;
}

function include (path) {
	path = publish.conf.templatesDir + path;
	return IO.readFile(path);
}

function makeSignature (params) {
	if (!params) return "()";

	var signature =
		"(" + params.
			filter(function (_) {
				return _.name.indexOf(".") == -1;
			}).
			map(function (_) {
				return _.name;
			}).join(", ")
		+ ")";
	return signature;
}

function resolveLinks (str, from) {
	return str.replace(/\{@link ([^} ]+) ?\}/gi, function(match, symbolName) {
		return link(symbolName);
	});
}

function escapeHTML (s) {
	return s.replace(/[<>&]/g, function (_) { return { '<':'&lt;', '>':'&gt;', '&':'&amp;' }[_] });
}

