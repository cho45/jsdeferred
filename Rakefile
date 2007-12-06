
require "rubygems"
require "rake"
require "rake/clean"

CLEAN.include ["jsdeferred.{nodoc,mini,jquery}.js"]

def mini(js)
	js.gsub(/[ \t]+/, " ").
		gsub(/\n\n+/, "\n").
		gsub(/\s?;\s?/, ";").
		gsub(/\s?\{\s?/, "{").
		gsub(/\s?function/, "function")
end

task :default => [:test]

task :test => ["jsdeferred.jquery.js"] do
end

task :release => ["jsdeferred.nodoc.js", "jsdeferred.mini.js", "jsdeferred.js"] do
end

file "jsdeferred.nodoc.js" => ["jsdeferred.js"] do |t|
	content = File.read("jsdeferred.js")
	content.gsub!(%r|\n?/\*.*?\*/|m, "")
	content.gsub!(%r|\n?//.*|, "")

	File.open(t.name, "w") {|f|
		f << content
	}
end

file "jsdeferred.mini.js" => ["jsdeferred.nodoc.js"] do |t|
	File.open(t.name, "w") {|f|
		f << mini(File.read("jsdeferred.nodoc.js"))
	}
end

file "jsdeferred.jquery.js" do |t|
	File.open(t.name, "w") {|f|
		f << mini(File.read("jsdeferred.js") + File.read("binding/jquery.js"))
	}
end


