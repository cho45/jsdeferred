Titanium.include('jsdeferred.js');
Titanium.UI.setBackgroundColor('#fff');

var container = Ti.UI.createWebView({
    backgroundColor: '#fff',
});
Titanium.UI.currentWindow.add(container);

container.html = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory + '/jsdeferred/test-titanium.html').read().toString();
container.addEventListener('load', function () {

function showToView (obj) {
    container.evalJS('message(' + JSON.stringify(obj) + ')');
}

function msg (m) {
    Ti.API.warn(m);
    showToView({
        type : 'info',
        text : m
    });
}
log = msg;
print = msg;

msg('Titanium.version: ' + Titanium.version);
msg('Titanium.Platform.model: ' + Titanium.Platform.model);
msg('Titanium.Platform.name: ' + Titanium.Platform.name);
msg('Titanium.Platform.osname: ' + Titanium.Platform.osname);
msg('Titanium.Platform.version: ' + Titanium.Platform.version);

var Global = (function () { return this })();
Deferred.define();

file = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory + '/jsdeferred/test-jsdeferred.js');
data = file.read().toString();
data = data.match(/\/\/ ::Test::Start::([\s\S]+)::Test::End::/)[1];
var testfuns = []; data.replace(/(ok|expect)\(.+/g, function (m) {
    testfuns.push(m);
    return m;
});

var expects = testfuns.length;

function uneval (obj) {
    return JSON.stringify(obj);
}

function show (msg, expect, result) {
    var okng = this;

    var out = [];
    out.push(color(46, "[", [expects - testfuns.length, expects].join("/"), "]"));
    if (okng == "skip") {
        out.push(" ", color(33, "skipped " + expect + " tests: " + msg));
        Ti.API.info(out.join(""));
        while (expect--) testfuns.pop();
        showToView({
            type : 'skip',
            text : out.join('')
        });
    } else
    if (okng == "ng") {
        testfuns.pop();
        expect = (typeof expect == "function") ? uneval(expect).match(/[^{]+/)+"..." : uneval(expect);
        result = (typeof result == "function") ? uneval(result).match(/[^{]+/)+"..." : uneval(result);
        out.push(["NG Test::", msg, expect, result].join("\n"));
        Ti.API.error(out.join(""));
        showToView({
            type : 'ng',
            text : out.join('')
        });
    } else {
        testfuns.pop();
        out.push(" ", color(32, "ok"));
        Ti.API.info(out.join(""));
        showToView({
            type : 'ok',
            text : out.join('')
        });
    }
}

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
    return str;
}

// run tests
eval(data);

});
