var jpath = require('..')
, http = require('http')
, util = require('util')
;

var feed = "http://api.flickr.com/services/feeds/photos_public.gne?tags=beach,pipeline&tagmode=all&format=json&jsoncallback=processResponse"
;

function processResponse(json) {
	var res = jpath.resolve(json, "#/items[first(3)]take(/title,/author,media=/media/m)")
	console.log( util.inspect(res, false, 5) );
}

http.get(feed, function(res) {
	console.log("Got response: " + res.statusCode);

	var data = '';

	res.on('data', function (chunk){
		data += chunk;
	});

	res.on('end',function(){
		// result is formatted as jsonp... this is for illustration only.
		eval(data);
	})
}).on('error', function(e) {
	console.log("Got error: " + e.message);
});