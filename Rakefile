
require "rubygems"
require "rake"
require "rake/clean"

COPYRIGHT = <<EOS
JSDefeered (c) Copyright (c) 2007 cho45 ( www.lowreal.net )
See http://coderepos.org/share/wiki/JSDeferred
EOS

CLEAN.include ["jsdeferred.{nodoc,mini,jquery}.js"]

def mini(js, commentonly=false)
	js = js.dup
	js.gsub!(%r|\n?/\*.*?\*/|m, "")
	js.gsub!(%r|\n?\s*//.*|, "")
	js.gsub!(/\A\s+|\s+\z/, "")
	unless commentonly
		js.gsub!(/^\s+/, "")
		js.gsub!(/[ \t]+/, " ")
		js.gsub!(/\n\n+/, "\n")
		js.gsub!(/\s?;\s?/, ";")
		js.gsub!(/ ?([{}()<>:=,*\/+-]) ?/, "\\1")
	end
	COPYRIGHT.gsub(/^/, "// ") + js
end

task :default => [:test]

task :test => [:release] do
end

task :release => ["jsdeferred.nodoc.js", "jsdeferred.mini.js", "jsdeferred.js", "jsdeferred.jquery.js", "doc/index.html"] do
end

file "jsdeferred.nodoc.js" => ["jsdeferred.js"] do |t|
	File.open(t.name, "w") {|f|
		f << mini(File.read("jsdeferred.js"), true)
	}
end

file "jsdeferred.mini.js" => ["jsdeferred.js"] do |t|
	File.open(t.name, "w") {|f|
		f << mini(File.read("jsdeferred.js"))
	}
end

file "jsdeferred.jquery.js" => ["jsdeferred.js", "binding/jquery.js"] do |t|
	File.open(t.name, "w") {|f|
		f << mini(File.read("jsdeferred.js") + File.read("binding/jquery.js"))
	}
end


file "doc/index.html" => ["jsdeferred.js"] do |t|
	sh %{ruby makedoc.rb}
end

