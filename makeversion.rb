#!/usr/bin/env ruby

content = File.read("./jquery-deferred.js")
content.gsub!(%r|\n?/\*.*?\*/|m, "")
content.gsub!(%r|\n?//.*|, "")

File.open("jquery-deferred.nodoc.js", "w") {|f|
	f << content
}

content.gsub!(/[ \t]+/, " ")
content.gsub!(/\n\n+/, "\n")
content.gsub!(/\s?;\s?/, ";")
content.gsub!(/\s?\{\s?/, "{")
content.gsub!(/\s?function/, "function")

File.open("jquery-deferred.mini.js", "w") {|f|
	f << content
}

