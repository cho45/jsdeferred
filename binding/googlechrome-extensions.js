/*
 * JSDeferred Integration for GoogleChrome.
 * writtern By Yuichi Tateno <http://github.com/hotchpotch>.
 *
 * MIT License.
 *
 * examples:
 * Deferred.chrome.bookmarks.search('Google').next(function(r) {
 *     console.log(r); // BookmarkTreeNode
 * });
 *
 * Deferred.chrome.tabs.create({url: 'http://www.google.com/'}).next(function(tab) {
 *     console.log(tab); // Tab instance
 * });
 */

if (typeof Deferred.chrome == 'undefined')
(function(Deferred) {
    Deferred.chrome = {};

    Deferred.chrome.registers = function(name, hash) {
        var chromeTarget = chrome[name];
        if (!chromeTarget) return console.log('chrome.' + name + ' is not found.');
        if (typeof Deferred.chrome[name] == 'undefined') Deferred.chrome[name] = {};

        var target = Deferred.chrome[name];
        for (var key in hash) {
            if (!chromeTarget[key]) {
                console.log('chrome.' + name + '.' + key + ' is not found.');
                continue;
            }
            var t = hash[key];
            target[key] = Deferred.connect(chromeTarget[key], { target: chromeTarget, ok: t[0], ng: t[1] });
        }
    }

    Deferred.chrome.registers('tabs', {
        captureVisibleTab : [1],
        create            : [1],
        detectLanguage    : [1],
        executeScript     : [2],
        get               : [1],
        getAllInWindow    : [1],
        getSelected       : [1],
        insertCSS         : [2],
        move              : [2],
        remove            : [1],
        update            : [2],
    });

    Deferred.chrome.registers('bookmarks', {
        create      : [1],
        get         : [1],
        getChildren : [1],
        getTree     : [0],
        move        : [2],
        remove      : [1],
        removeTree  : [0],
        search      : [1],
        update      : [2],
    });

    Deferred.chrome.registers('windows', {
        create         : [1],
        get            : [1],
        getAll         : [1],
        getCurrent     : [0],
        getLastFocused : [0],
        remove         : [1],
        update         : [2],
    });

    Deferred.chrome.registers('i18n', {
        getAcceptLanguages : [0],
    });

    Deferred.chrome.registers('toolstrip', {
        collapse : [1],
        expand   : [1],
    });

})(Deferred);


