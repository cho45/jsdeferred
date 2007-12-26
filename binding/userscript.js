function D () {
/*include JSDeferred*/

/* function xhttp (opts) //=> Deferred
 * Cross site version of `http`.
 */
/* function xhttp.get (url) //=> Deferred
 */
/* function xhttp.post (url, data) //=> Deferred
 */
function xhttp (opts) {
	var d = Deferred();
	if (opts.onload)  d = d.next(opts.onload);
	if (opts.onerror) d = d.error(opts.onerror);
	opts.onload = function (res) {
		d.call(res);
	};
	opts.onerror = function (res) {
		d.fail(res);
	};
	GM_xmlhttpRequest(opts);
	return d;
}
xhttp.get  = function (url)       { return xhttp({method:"get", url:url}) }
xhttp.post = function (url, data) { return xhttp({method:"post", url:url, data:data, headers:{"Content-Type":"application/x-www-form-urlencoded"}}) }


/* function http (opts) //=> Deferred
 * Sample:
 *     http.get("http://example.com/hogehoge")
 *     .next(function (a) {
 *         log(a.responseText);
 *     })
 *     .error(function (e) {
 *         log("error", e);
 *     });
 */
/* function http.get (url) //=> Deferred
 */
/* function http.post (url, data) //=> Deferred
 */
function http (opts) {
	var d = Deferred();
	var req = new XMLHttpRequest();
	if (opts.method == "post") req.setRequestHeader("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
	req.open(opts.method, opts.url, true);
	req.onreadystatechange = function () {
		if (req.readyState == 4) d.call(req);
	};
	req.send(opts.data || null);
	d.xhr = req;
	return d;
}
http.get  = function (url)       { return http({method:"get", url:url}) }
http.post = function (url, data) { return http({method:"post", url:url, data:data}) }

Deferred.Deferred = Deferred;
Deferred.http     = http;
Deferred.xhttp    = xhttp;
return Deferred;
}
